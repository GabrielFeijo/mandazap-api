import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppGateway } from './whatsapp.gateway';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import makeWASocket, {
  Browsers,
  ConnectionState,
  Contact,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WAMessage,
  WASocket,
} from 'baileys';
import * as QRCode from 'qrcode';
import { useMongoAuthState } from './mongo-auth-state';

@Injectable()
export class BaileysService implements OnModuleInit {
  private readonly logger = pino({ level: 'error' });
  private instances = new Map<string, WASocket>();

  constructor(
    private prisma: PrismaService,
    private whatsappGateway: WhatsAppGateway,
  ) {}

  async onModuleInit() {
    // await this.restoreInstancesOnStartup();
  }

  async restoreInstancesOnStartup() {
    const data = await this.prisma.whatsAppInstance.findMany({
      where: {
        status: {
          in: ['connected', 'connecting'],
        },
      },
    });

    if (data.length === 0) {
      console.log('Nenhuma instância para restaurar.');
      return;
    }

    for (const instance of data) {
      try {
        if (this.instances.has(instance.id)) {
          continue;
        }

        await this.createInstance(instance.id, instance.userId);
      } catch (error) {
        console.error(error, `Erro ao restaurar instância ${instance.id}`);
      }
    }
  }

  async createInstance(instanceId: string, userId: string) {
    const { state, saveCreds } = await useMongoAuthState({ instanceId });
    const { version } = await fetchLatestBaileysVersion();
    const logger = pino({
      level: 'error',
      base: {
        instanceId,
      },
    });

    const sock = makeWASocket({
      version,
      logger,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      browser: Browsers.windows('Chrome'),
      syncFullHistory: true,
      shouldSyncHistoryMessage: () => true,
      generateHighQualityLinkPreview: true,
    });

    this.instances.set(instanceId, sock);

    await this.prisma.whatsAppInstance.update({
      where: { id: instanceId },
      data: { status: 'connecting' },
    });

    this.whatsappGateway.emitToUser(userId, 'connection-update', {
      instanceId,
      status: 'connecting',
    });

    sock.ev.on('connection.update', (update) => {
      void this.handleConnectionUpdate(instanceId, userId, update);
    });

    sock.ev.on('creds.update', () => {
      void saveCreds();
    });

    sock.ev.on('messages.upsert', ({ messages }) => {
      void this.handleMessages(userId, instanceId, messages);
    });

    sock.ev.on('contacts.update', (contacts) => {
      void this.handleContacts(instanceId, contacts);
    });

    return instanceId;
  }

  async connectInstance(instanceId: string, userId: string) {
    const sock = this.instances.get(instanceId);

    if (sock) {
      await this.disconnectInstance(userId, instanceId);
    }

    await this.createInstance(instanceId, userId);

    return { message: 'Conectando instância...' };
  }

  async disconnectInstance(userId: string, instanceId: string) {
    const sock = this.instances.get(instanceId);

    if (sock) {
      await sock.logout?.();
      await sock.ws?.close();
      sock.end(new Error('Desconectado pelo usuário'));
    }

    this.whatsappGateway.emitToUser(userId, 'qr-code', {
      instanceId,
      qrCode: null,
    });

    await this.prisma.whatsAppInstance.update({
      where: { id: instanceId },
      data: {
        status: 'disconnected',
        qrCode: null,
        phoneNumber: null,
      },
    });

    await this.prisma.authSession.deleteMany({
      where: { instanceId },
    });

    this.whatsappGateway.emitToUser(userId, 'connection-update', {
      instanceId,
      status: 'disconnected',
    });

    this.instances.delete(instanceId);

    return { message: 'Instância desconectada' };
  }

  async sendMessage(
    userId: string,
    instanceId: string,
    to: string,
    message: string,
  ) {
    const sock = this.instances.get(instanceId);
    if (!sock) {
      throw new Error('Instância não conectada');
    }

    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    const sentMessage = await sock.sendMessage(jid, { text: message });

    if (!sentMessage) {
      throw new Error('Erro ao enviar mensagem');
    }

    return { message: 'Mensagem enviada com sucesso' };
  }

  private async handleConnectionUpdate(
    instanceId: string,
    userId: string,
    update: Partial<ConnectionState>,
  ) {
    const { connection, lastDisconnect, qr } = update;

    if (qr && typeof qr === 'string') {
      const qrCodeDataURL = await QRCode.toDataURL(qr);

      await this.prisma.whatsAppInstance.update({
        where: { id: instanceId },
        data: {
          qrCode: qrCodeDataURL,
          status: 'connecting',
        },
      });

      this.whatsappGateway.emitToUser(userId, 'qr-code', {
        instanceId,
        qrCode: qrCodeDataURL,
      });
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        (DisconnectReason.loggedOut as number);

      await this.prisma.whatsAppInstance.update({
        where: { id: instanceId },
        data: {
          status: shouldReconnect ? 'connecting' : 'disconnected',
          qrCode: null,
        },
      });

      if (shouldReconnect) {
        setTimeout(() => void this.createInstance(instanceId, userId), 1000);
      } else {
        await this.disconnectInstance(userId, instanceId);
      }

      this.whatsappGateway.emitToUser(userId, 'connection-update', {
        instanceId,
        status: shouldReconnect ? 'reconnecting' : 'disconnected',
      });
    }

    if (connection === 'open') {
      const sock = this.instances.get(instanceId);
      const phoneNumber = sock?.user?.id?.split(':')[0];

      const instance = await this.prisma.whatsAppInstance.findFirst({
        where: { phoneNumber, status: 'connected', NOT: { id: instanceId } },
      });

      if (instance) {
        await this.disconnectInstance(userId, instanceId);
        return;
      }

      await this.prisma.whatsAppInstance.update({
        where: { id: instanceId },
        data: {
          status: 'connected',
          phoneNumber,
          qrCode: null,
        },
      });

      this.whatsappGateway.emitToUser(userId, 'connection-update', {
        instanceId,
        status: 'connected',
        phoneNumber,
      });

      this.whatsappGateway.emitToUser(userId, 'qr-code', {
        instanceId,
        qrCode: null,
      });
    }
  }

  private async handleMessages(
    userId: string,
    instanceId: string,
    messages: WAMessage[],
  ) {
    for (const message of messages) {
      await this.saveMessage(userId, instanceId, message);
    }
  }

  private async handleContacts(
    instanceId: string,
    contacts: Partial<Contact>[],
  ) {
    for (const contact of contacts) {
      await this.saveContact(instanceId, contact);
    }
  }

  private async saveMessage(
    userId: string,
    instanceId: string,
    message: WAMessage,
  ) {
    try {
      const jid = message.key.remoteJid;
      if (!jid || message.key.fromMe || message.broadcast) return;

      let contact = await this.prisma.contact.findFirst({
        where: { jid, instanceId },
      });

      if (!contact) {
        contact = await this.prisma.contact.create({
          data: {
            jid,
            number: jid.split('@')[0],
            instanceId,
          },
        });
      }

      const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        '';

      let type = 'text';
      if (message.message?.imageMessage) type = 'image';
      else if (message.message?.videoMessage) type = 'video';
      else if (message.message?.audioMessage) type = 'audio';
      else if (message.message?.documentMessage) type = 'document';

      if (type === 'text' && text === '') return;

      const messageData = {
        messageId: message.key.id!,
        fromMe: false,
        text,
        type,
        timestamp: new Date(),
        status: 'received',
        contactId: contact.id,
        instanceId,
      };

      this.whatsappGateway.emitToUser(userId, 'message-received', {
        instanceId,
        message: {
          ...messageData,
          contact,
        },
      });

      await this.prisma.message.create({
        data: messageData,
      });
    } catch (error) {
      console.error(error);
    }
  }

  private async saveContact(instanceId: string, contact: Partial<Contact>) {
    if (!contact.id) return;

    try {
      await this.prisma.contact.upsert({
        where: {
          jid_instanceId: {
            jid: contact.id,
            instanceId,
          },
        },
        update: {
          name: contact.name || contact.notify,
          profilePic: contact.imgUrl,
        },
        create: {
          jid: contact.id,
          name: contact.name || contact.notify,
          number: contact.id.split('@')[0],
          profilePic: contact.imgUrl,
          instanceId,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
}
