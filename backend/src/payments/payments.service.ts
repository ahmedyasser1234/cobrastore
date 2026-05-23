import { Injectable, RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderService } from '../orders/orders.service';
import { VendorsService } from '../vendors/vendors.service';
import { OrderStatus } from '../entities/order.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private orderService: OrderService,
    private vendorsService: VendorsService,
    private notificationsGateway: NotificationsGateway,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createCheckoutSession(orderId: string, userId: string): Promise<string> {
    const order = await this.orderService.findOne(orderId, userId);
    
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: order.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.nameEn,
            description: item.variationSnapshot ? JSON.stringify(item.variationSnapshot) : undefined,
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL')}/checkout/success?order_id=${order.id}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/checkout/cancel`,
      metadata: { orderId: order.id },
    });

    await this.orderService.updateStatus(order.id, order.status, userId, `Stripe Session Created: ${session.id}`);
    
    return session.url;
  }

  async handleWebhook(signature: string, payload: Buffer) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata.orderId;
      
      await this.orderService.updateStatus(
        orderId, 
        OrderStatus.PAID, 
        'STRIPE_WEBHOOK', 
        `Payment successful. PaymentIntent: ${session.payment_intent}`
      );

      // Trigger real-time notification
      const order = await this.orderService.findOne(orderId, 'STRIPE_WEBHOOK');
      this.notificationsGateway.sendNewOrderNotification(order);
    }

    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;
      if (account.details_submitted) {
        // Logic to mark vendor as onboarding complete
      }
    }

    return { received: true };
  }

  async createConnectOnboardingUrl(userId: string): Promise<string> {
    const vendor = await this.vendorsService.findByUserId(userId);
    let stripeAccountId = vendor.stripeAccountId;

    if (!stripeAccountId) {
      const account = await this.stripe.accounts.create({ type: 'express' });
      stripeAccountId = account.id;
      await this.vendorsService.updateProfile(vendor.id, { stripeAccountId });
    }

    const accountLink = await this.stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${this.configService.get('DASHBOARD_URL')}/vendor/stripe/refresh`,
      return_url: `${this.configService.get('DASHBOARD_URL')}/vendor/stripe/return`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }
}
