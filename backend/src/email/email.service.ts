import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email-queue') private emailQueue: Queue) {}

  async sendOrderConfirmation(email: string, orderData: any) {
    await this.emailQueue.add('order-confirmation', { email, orderData });
  }

  async sendVendorSaleNotification(email: string, saleData: any) {
    await this.emailQueue.add('vendor-sale', { email, saleData });
  }

  async sendVendorApproval(email: string) {
    await this.emailQueue.add('vendor-approval', { email });
  }
}
