import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { Vendor } from '../entities/vendor.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatusLog } from '../entities/order-status-log.entity';
import { CartService } from '../cart/cart.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { LoyaltyService } from '../loyalty/loyalty.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private statusLogRepository: Repository<OrderStatusLog>,
    private cartService: CartService,
    private notificationsService: NotificationsService,
    private loyaltyService: LoyaltyService,
  ) {}

  async createFromCart(userId: string, sessionId: string, shippingAddress: any, pointsToRedeem: number = 0): Promise<Order> {
    const cart = await this.cartService.findOrCreateCart(sessionId, userId);
    
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const order = this.orderRepository.create({
      userId,
      status: OrderStatus.DRAFT,
      total: 0,
      shippingAddress,
    });

    const savedOrder = await this.orderRepository.save(order);
    let total = 0;

    // Fetch vendors to get commission percentages
    const vendorIdsToFetch = Array.from(new Set(cart.items.map(item => item.product.vendorId).filter(Boolean)));
    const vendors = vendorIdsToFetch.length > 0 
      ? await this.orderRepository.manager.find(Vendor, { where: { id: In(vendorIdsToFetch) } }) 
      : [];
    const vendorMap = new Map<string, any>(vendors.map((v: any) => [v.id, v]));

    const orderItems = cart.items.map(cartItem => {
      const price = cartItem.variation ? cartItem.variation.price : cartItem.product.basePrice;
      const subtotal = price * cartItem.quantity;
      total += subtotal;

      const vendor = vendorMap.get(cartItem.product.vendorId);
      const commissionRate = vendor ? Number(vendor.commissionPercentage || 10) : 10;
      const adminCommission = subtotal * (commissionRate / 100);
      const vendorEarnings = subtotal - adminCommission;

      return this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: cartItem.productId,
        variationId: cartItem.variationId,
        vendorId: cartItem.product.vendorId,
        quantity: cartItem.quantity,
        unitPrice: price,
        priceSnapshot: { basePrice: cartItem.product.basePrice, variationPrice: cartItem.variation?.price },
        variationSnapshot: cartItem.variation ? cartItem.variation.attributes : null,
        adminCommission,
        vendorEarnings
      });
    });

    await this.orderItemRepository.save(orderItems);

    let pointsDiscount = 0;
    if (pointsToRedeem > 0) {
      const redemption = await this.loyaltyService.redeemPoints(userId, pointsToRedeem);
      pointsDiscount = redemption.discountAmount;
    }

    savedOrder.total = Math.max(0, total - pointsDiscount);
    const finalOrder = await this.orderRepository.save(savedOrder);

    // Notify vendors
    const vendorIds = new Set(orderItems.map(item => item.vendorId).filter(Boolean));
    for (const vendorId of vendorIds) {
      const vendor = await this.orderRepository.manager.findOne('Vendor', { where: { id: vendorId } }) as any;
      if (vendor && vendor.userId) {
        await this.notificationsService.createNotification({
          userId: vendor.userId,
          title: 'طلب جديد | New Order',
          message: `لقد تلقيت طلباً جديداً برقم #${finalOrder.id.split('-')[0]}`,
          type: NotificationType.ORDER,
          metadata: { orderId: finalOrder.id }
        });
      }
    }

    return finalOrder;
  }

  async findOne(id: string, userId?: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ 
      where: { id },
      relations: ['items', 'items.product', 'statusLogs'] 
    });

    if (!order) throw new NotFoundException();
    if (userId && order.userId !== userId) throw new ForbiddenException();

    return order;
  }

  async updateStatus(id: string, toStatus: OrderStatus, changedBy: string, note?: string): Promise<Order> {
    const order = await this.findOne(id);
    const fromStatus = order.status;

    order.status = toStatus;
    await this.orderRepository.save(order);

    const log = this.statusLogRepository.create({
      orderId: id,
      fromStatus,
      toStatus,
      createdBy: changedBy,
      note
    });
    await this.statusLogRepository.save(log);

    if (toStatus === OrderStatus.PAID) {
      await this.loyaltyService.awardPoints(order.userId, order.id, order.total);
    }

    // Notify the user about the status update
    await this.notificationsService.createNotification({
      userId: order.userId,
      title: 'تحديث حالة الطلب | Order Update',
      message: `تم تحديث حالة طلبك رقم #${order.id.split('-')[0]} إلى: ${toStatus}`,
      type: NotificationType.ORDER,
      metadata: { orderId: order.id, status: toStatus }
    });

    return this.findOne(id);
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({ 
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByVendor(vendorId: string): Promise<Order[]> {
    return this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .where('item.vendorId = :vendorId', { vendorId })
      .getMany();
  }
}
