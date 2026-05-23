import { Process, Processor } from '@nestjs/bull';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bull';

@Processor('email-queue')
export class EmailProcessor {
  constructor(private mailerService: MailerService) {}

  @Process('order-confirmation')
  async handleOrderConfirmation(job: Job) {
    const { email, orderData } = job.data;
    await this.mailerService.sendMail({
      to: email,
      subject: `Order Confirmation #${orderData.id}`,
      template: './order-confirmation', // Would need template files in real app
      context: { orderData },
      html: `<h1>Thanks for your order!</h1><p>Order ID: ${orderData.id}</p><p>Total: $${orderData.total}</p>`,
    });
  }

  @Process('vendor-sale')
  async handleVendorSale(job: Job) {
    const { email, saleData } = job.data;
    await this.mailerService.sendMail({
      to: email,
      subject: `New Sale Notification`,
      html: `<h1>You have a new sale!</h1><p>Item: ${saleData.productName}</p><p>Earnings: $${saleData.earnings}</p>`,
    });
  }

  @Process('vendor-approval')
  async handleVendorApproval(job: Job) {
    const { email } = job.data;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Vendor Application Approved',
      html: '<h1>Welcome!</h1><p>Your vendor application has been approved. You can now start adding products.</p>',
    });
  }
}
