import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { PointsTransaction } from '../entities/points-transaction.entity';
import { Order } from '../entities/order.entity';

@Injectable()
export class LoyaltyService {
  private readonly POINTS_PER_EGP = 0.1; // 1 point for every 10 EGP
  private readonly EGP_PER_POINT = 0.05; // 100 points = 5 EGP

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PointsTransaction)
    private pointsTransactionRepository: Repository<PointsTransaction>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async awardPoints(userId: string, orderId: string, orderTotal: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Ensure we don't award points twice for the same order
    const existing = await this.pointsTransactionRepository.findOne({ where: { orderId, reason: 'ORDER_PURCHASE' } });
    if (existing) return;

    const pointsEarned = Math.floor(orderTotal * this.POINTS_PER_EGP);
    if (pointsEarned <= 0) return;

    const transaction = this.pointsTransactionRepository.create({
      userId,
      amount: pointsEarned,
      reason: 'ORDER_PURCHASE',
      orderId,
    });

    await this.pointsTransactionRepository.save(transaction);
    
    user.points += pointsEarned;
    await this.userRepository.save(user);

    await this.updateTier(user.id);
  }

  async redeemPoints(userId: string, pointsToRedeem: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (pointsToRedeem <= 0) throw new BadRequestException('Invalid points amount');
    if (user.points < pointsToRedeem) throw new BadRequestException('Insufficient points');

    const discountAmount = pointsToRedeem * this.EGP_PER_POINT;

    const transaction = this.pointsTransactionRepository.create({
      userId,
      amount: -pointsToRedeem,
      reason: 'REDEMPTION',
    });

    await this.pointsTransactionRepository.save(transaction);

    user.points -= pointsToRedeem;
    await this.userRepository.save(user);

    return { discountAmount, newBalance: user.points };
  }

  async getBalance(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { points: user.points, tier: user.tier };
  }

  async getHistory(userId: string) {
    return this.pointsTransactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateTier(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    // Calculate total spent
    const orders = await this.orderRepository.find({ where: { user: { id: userId }, status: 'delivered' } });
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    let newTier = 'bronze';
    if (totalSpent >= 5000) newTier = 'platinum';
    else if (totalSpent >= 2000) newTier = 'gold';
    else if (totalSpent >= 500) newTier = 'silver';

    if (user.tier !== newTier) {
      user.tier = newTier;
      await this.userRepository.save(user);
    }
  }
}
