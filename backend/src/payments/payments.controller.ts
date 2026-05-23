import { Controller, Post, Body, Req, Headers, UseGuards, RawBodyRequest, HttpStatus, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('checkout-session')
  async createSession(@Req() req: any, @Body('orderId') orderId: string) {
    const url = await this.paymentsService.createCheckoutSession(orderId, req.user.id);
    return { url };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    return this.paymentsService.handleWebhook(signature, req.rawBody);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('connect/onboarding')
  async getOnboardingUrl(@Req() req: any) {
    const url = await this.paymentsService.createConnectOnboardingUrl(req.user.id);
    return { url };
  }
}
