import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async saveMessage(senderId: string, receiverId: string, content: string) {
    const message = this.chatRepository.create({
      senderId,
      receiverId,
      content,
    });
    return this.chatRepository.save(message);
  }

  async getMessages(user1: string, user2: string) {
    return this.chatRepository.find({
      where: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  async getConversations(userId: string) {
    // This is a simplified way to get unique users the user has chatted with
    const messages = await this.chatRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      order: { createdAt: 'DESC' },
      relations: ['sender', 'receiver'],
    });

    const conversations = new Map();
    messages.forEach((msg) => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg.content,
          timestamp: msg.createdAt,
        });
      }
    });

    return Array.from(conversations.values());
  }
}
