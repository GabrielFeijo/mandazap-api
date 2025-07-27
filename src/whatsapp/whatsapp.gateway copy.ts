import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WhatsAppGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  async handleConnection(client: Socket) {
    const token = (client.handshake.auth?.token ||
      client.handshake.query?.token) as string;

    if (!token || !token.startsWith('Bearer ')) {
      console.log('JWT ausente ou inválido');
      client.disconnect();
      return;
    }

    try {
      const jwt = token.replace('Bearer ', '');
      const payload = this.jwtService.verify<{ email: string; sub: string }>(
        jwt,
      );

      const user = await this.prisma.user.findUnique({
        where: { email: payload.email, id: payload.sub },
      });

      if (!user) {
        console.log('Usuário não encontrado');
        client.disconnect();
        return;
      }
    } catch (error) {
      console.log('JWT inválido:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSockets.set(data.userId, client.id);
    client.emit('authenticated', { success: true });
  }

  emitToUser(userId: string, event: string, data: Record<string, unknown>) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  @SubscribeMessage('join-instance')
  handleJoinInstance(
    @MessageBody() data: { instanceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(`instance-${data.instanceId}`);
  }

  @SubscribeMessage('leave-instance')
  handleLeaveInstance(
    @MessageBody() data: { instanceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.leave(`instance-${data.instanceId}`);
  }
}
