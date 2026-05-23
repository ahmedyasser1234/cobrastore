import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { VendorPayout, PayoutStatus } from '../entities/vendor-payout.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class PayoutCronService {
  private readonly logger = new Logger(PayoutCronService.name);

  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(VendorPayout) private payoutRepository: Repository<VendorPayout>,
    private paymentsService: PaymentsService,
  ) {}

  // Run on the 1st of every month at midnight
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyPayouts() {
    this.logger.log('Starting monthly vendor payouts calculation...');

    const startOfMonth = new Date();
    startOfMonth.setMonth(startOfMonth.getMonth() - 1);
    startOfMonth.setDate(1);
    
    const endOfMonth = new Date();
    endOfMonth.setDate(0); // Last day of previous month

    // 1. Get all paid orders from the previous month
    const orders = await this.orderRepository.find({
      where: {
        status: OrderStatus.PAID,
        createdAt: Between(startOfMonth, endOfMonth),
      },
      relations: ['items', 'items.vendor'],
    });

    // 2. Group by vendor
    const vendorEarnings: Record<string, number> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const vendor = item.vendor;
        const commission = vendor?.commissionPercentage ? Number(vendor.commissionPercentage) / 100 : 0.10;
        const amount = Number(item.unitPrice) * item.quantity;
        const netEarnings = amount * (1 - commission);
        
        vendorEarnings[vendor.id] = (vendorEarnings[vendor.id] || 0) + netEarnings;
      }
    }

    // 3. Create payout records and (ideally) trigger Stripe transfers
    for (const [vendorId, amount] of Object.entries(vendorEarnings)) {
      const payout = this.payoutRepository.create({
        vendorId,
        amount,
        periodStart: startOfMonth,
        periodEnd: endOfMonth,
        status: PayoutStatus.PENDING,
      });

      await this.payoutRepository.save(payout);
      this.logger.log(`Payout of $${amount} scheduled for Vendor ${vendorId}`);
      
      // In a real implementation, you'd call this.paymentsService.transferToVendor(...)
    }
  }
}
