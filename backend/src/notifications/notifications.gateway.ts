import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationsGateway');
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  @SubscribeMessage('authenticate')
  handleAuthenticate(client: Socket, payload: { userId: string }): void {
    if (!payload?.userId) return;
    
    // Add socket to user's set
    if (!this.userSockets.has(payload.userId)) {
      this.userSockets.set(payload.userId, new Set());
    }
    this.userSockets.get(payload.userId).add(client.id);
    
    // Store userId on the client object for disconnect handling
    (client as any).userId = payload.userId;
    
    this.logger.log(`Client ${client.id} authenticated as user ${payload.userId}`);
  }

  sendToUser(userId: string, event: string, data: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds && socketIds.size > 0) {
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit(event, data);
      });
      this.logger.log(`Sent event ${event} to user ${userId} (${socketIds.size} clients)`);
    }
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  sendNewOrderNotification(order: any) {
    this.server.emit('newOrder', {
      message: 'New order received!',
      orderId: order.id,
      total: order.total,
      customer: order.user?.name || 'Guest',
      timestamp: new Date(),
    });
  }
}
