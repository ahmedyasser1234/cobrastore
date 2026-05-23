import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, Headers } from '@nestjs/common';
import { OrderService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { OrderStatus } from '../entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private orderService: OrderService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Req() req: any, 
    @Headers('x-session-id') sessionId: string,
    @Body() data: CreateOrderDto
  ) {
    return this.orderService.createFromCart(req.user.id, sessionId, data.shippingAddress);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMyOrders(@Req() req: any) {
    return this.orderService.findByUser(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.VENDOR)
  @Get('vendor/me')
  async getMyVendorOrders(@Req() req: any) {
    // Note: req.user.vendorId should be populated or fetched
    const vendor = await this.orderService.findByVendor(req.user.vendorId || req.user.id);
    return vendor;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getOrder(@Param('id') id: string, @Req() req: any) {
    return this.orderService.findOne(id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string, 
    @Req() req: any,
    @Body('status') status: OrderStatus,
    @Body('note') note?: string
  ) {
    return this.orderService.updateStatus(id, status, req.user.id, note);
  }
}
