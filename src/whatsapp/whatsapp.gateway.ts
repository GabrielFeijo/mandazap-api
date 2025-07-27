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
    origin:
      process.env.CORS_ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
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

  private userSockets = new Map<string, Set<string>>();

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
        console.log('Usuário não encontrado');
        client.disconnect();
        return;
      }

      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }

      this.userSockets.get(user.id)?.add(client.id);
    } catch (error) {
      console.log('JWT inválido:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketSet] of this.userSockets.entries()) {
      if (socketSet.has(client.id)) {
        socketSet.delete(client.id);
        if (socketSet.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  emitToUser(userId: string, event: string, data: Record<string, unknown>) {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds) return;

    for (const socketId of socketIds) {
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
