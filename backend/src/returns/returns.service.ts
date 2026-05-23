import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequest, ReturnStatus } from '../entities/return-request.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class ReturnsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(ReturnRequest)
    private returnRequestRepository: Repository<ReturnRequest>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private configService: ConfigService,
    private notificationsGateway: NotificationsGateway,
    private notificationsService: NotificationsService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16' as any,
    });
  }

  async create(userId: string, orderId: string, reason: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId }, relations: ['items'] });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.DELIVERED) throw new BadRequestException('Can only return delivered orders');

    const existingReturn = await this.returnRequestRepository.findOne({ where: { orderId } });
    if (existingReturn) throw new BadRequestException('A return request already exists for this order');

    const returnReq = this.returnRequestRepository.create({
      userId,
      orderId,
      vendorId: order.items[0]?.vendorId, // Simplified for now, assuming single vendor or primary vendor
      reason,
      refundAmount: order.total,
    });

    const saved = await this.returnRequestRepository.save(returnReq);

    await this.notificationsService.createNotification({
      userId,
      title: 'طلب إرجاع جديد',
      message: `تم استلام طلب الإرجاع للطلب #${orderId.split('-')[0]} وهو قيد المراجعة`,
      type: NotificationType.ORDER,
      metadata: { returnId: saved.id },
    });

    return saved;
  }

  async findByUser(userId: string) {
    return this.returnRequestRepository.find({ where: { userId }, relations: ['order'], order: { createdAt: 'DESC' } });
  }

  async findAll() {
    return this.returnRequestRepository.find({ relations: ['order'], order: { createdAt: 'DESC' } });
  }

  async processReturn(id: string, action: 'approve' | 'reject') {
    const returnReq = await this.returnRequestRepository.findOne({ where: { id }, relations: ['order'] });
    if (!returnReq) throw new NotFoundException('Return request not found');

    if (action === 'reject') {
      returnReq.status = ReturnStatus.REJECTED;
      await this.returnRequestRepository.save(returnReq);

      await this.notificationsService.createNotification({
        userId: returnReq.userId,
        title: 'تم رفض طلب الإرجاع',
        message: `نأسف، تم رفض طلب الإرجاع للطلب #${returnReq.orderId.split('-')[0]}`,
        type: NotificationType.ORDER,
      });

      return returnReq;
    }

    // Approve and process refund
    returnReq.status = ReturnStatus.APPROVED;
    
    // If order was paid via Stripe, process refund
    if (returnReq.order.stripePaymentIntentId) {
      try {
        const refund = await this.stripe.refunds.create({
          payment_intent: returnReq.order.stripePaymentIntentId,
          amount: Math.round(returnReq.refundAmount * 100),
        });
        returnReq.stripeRefundId = refund.id;
        returnReq.status = ReturnStatus.REFUNDED;
        
        // Mark order as returned
        returnReq.order.status = OrderStatus.RETURNED;
        await this.orderRepository.save(returnReq.order);

      } catch (err) {
        throw new BadRequestException(`Stripe refund failed: ${err.message}`);
      }
    } else {
       // Manual refund needed (e.g. cash on delivery)
       returnReq.order.status = OrderStatus.RETURNED;
       await this.orderRepository.save(returnReq.order);
    }

    await this.returnRequestRepository.save(returnReq);

    await this.notificationsService.createNotification({
      userId: returnReq.userId,
      title: 'تمت الموافقة على طلب الإرجاع',
      message: `تم الموافقة على طلب الإرجاع للطلب #${returnReq.orderId.split('-')[0]} وجاري معالجة المبلغ`,
      type: NotificationType.ORDER,
    });

    return returnReq;
  }
}
