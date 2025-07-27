import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaileysService } from './baileys.service';

@Injectable()
export class WhatsAppService {
  constructor(
    private prisma: PrismaService,
    private baileysService: BaileysService,
  ) {}

  async createInstance(userId: string, name: string) {
    const instance = await this.prisma.whatsAppInstance.create({
      data: {
        name,
        userId,
        status: 'disconnected',
      },
    });

    await this.baileysService.createInstance(instance.id, userId);

    return instance;
  }

  async getUserInstances(userId: string) {
    return this.prisma.whatsAppInstance.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            messages: true,
            contacts: true,
          },
        },
      },
    });
  }

  async getInstanceById(instanceId: string, userId: string) {
    const instance = await this.prisma.whatsAppInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new NotFoundException('Instância não encontrada');
    }

    if (instance.userId !== userId) {
      throw new ForbiddenException('Acesso negado a esta instância');
    }

    return instance;
  }

  async connectInstance(instanceId: string, userId: string) {
    const instance = await this.getInstanceById(instanceId, userId);

    if (!instance) {
      throw new NotFoundException('Nenhuma instância encontrada');
    }

    return this.baileysService.connectInstance(instanceId, userId);
  }

  async disconnectInstance(instanceId: string, userId: string) {
    const instance = await this.getInstanceById(instanceId, userId);

    if (!instance) {
      throw new NotFoundException('Nenhuma instância encontrada');
    }

    return this.baileysService.disconnectInstance(userId, instanceId);
  }

  async getInstanceMessages(
    instanceId: string,
    userId: string,
    page = 1,
    limit = 999,
  ) {
    const instance = await this.getInstanceById(instanceId, userId);

    if (!instance) {
      throw new NotFoundException('Nenhuma instância encontrada');
    }

    const skip = (page - 1) * limit;

    return this.prisma.message.findMany({
      where: { instanceId },
      include: {
        contact: true,
        media: true,
      },
      orderBy: { timestamp: 'asc' },
      skip,
      take: limit,
    });
  }

  async sendMessage(
    instanceId: string,
    userId: string,
    to: string,
    message: string,
  ) {
    const instance = await this.getInstanceById(instanceId, userId);

    if (!instance) {
      throw new NotFoundException('Nenhuma instância encontrada');
    }

    return this.baileysService.sendMessage(userId, instanceId, to, message);
  }

  async getInstanceContacts(instanceId: string, userId: string) {
    const instance = await this.getInstanceById(instanceId, userId);

    if (!instance) {
      throw new NotFoundException('Nenhuma instância encontrada');
    }

    return this.prisma.contact.findMany({
      where: { instanceId },
      orderBy: { name: 'asc' },
    });
  }
}
