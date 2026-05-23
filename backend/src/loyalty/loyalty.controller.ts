import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Roles(UserRole.CUSTOMER)
  @Get('balance')
  async getBalance(@Req() req: any) {
    return this.loyaltyService.getBalance(req.user.id);
  }

  @Roles(UserRole.CUSTOMER)
  @Get('history')
  async getHistory(@Req() req: any) {
    return this.loyaltyService.getHistory(req.user.id);
  }

  @Roles(UserRole.CUSTOMER)
  @Post('redeem')
  async redeemPoints(@Req() req: any, @Body('pointsToRedeem') pointsToRedeem: number) {
    return this.loyaltyService.redeemPoints(req.user.id, pointsToRedeem);
  }
}
