import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    metadata?: any;
  }) {
    try {
      const notification = this.notificationsRepo.create({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.SYSTEM,
        metadata: data.metadata,
      });

      const saved = await this.notificationsRepo.save(notification);

      // Emit to specific user via WebSocket
      this.notificationsGateway.sendToUser(data.userId, 'new_notification', saved);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  async getUserNotifications(userId: string) {
    return this.notificationsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50, // Limit to 50 most recent notifications
    });
  }

  async getUnreadCount(userId: string) {
    return this.notificationsRepo.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationsRepo.update({ id, userId }, { read: true });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepo.update({ userId, read: false }, { read: true });
    return { success: true };
  }
}
