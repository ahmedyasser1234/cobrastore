import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track online users by userId
  private onlineUsers = new Map<string, string>(); // socketId -> userId

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(userId);
      this.onlineUsers.set(client.id, userId);
      console.log(`User connected: ${userId}`);
      
      // Broadcast that this user is online
      this.server.emit('userStatus', { userId, status: 'online' });
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.onlineUsers.get(client.id);
    if (userId) {
      this.onlineUsers.delete(client.id);
      console.log(`User disconnected: ${userId}`);
      
      // Check if user has other active connections
      const isStillOnline = Array.from(this.onlineUsers.values()).includes(userId);
      if (!isStillOnline) {
        this.server.emit('userStatus', { userId, status: 'offline' });
      }
    }
  }

  @SubscribeMessage('checkStatus')
  handleCheckStatus(@ConnectedSocket() client: Socket, @MessageBody() data: { targetUserId: string }) {
    const isOnline = Array.from(this.onlineUsers.values()).includes(data.targetUserId);
    client.emit('userStatus', { userId: data.targetUserId, status: isOnline ? 'online' : 'offline' });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string; receiverId: string; content: string },
  ) {
    const message = await this.chatService.saveMessage(
      data.senderId,
      data.receiverId,
      data.content,
    );

    // Emit to receiver's private room
    this.server.to(data.receiverId).emit('newMessage', message);
    
    // Emit back to sender (optional, usually handled by UI)
    client.emit('messageSent', message);
  }
}
