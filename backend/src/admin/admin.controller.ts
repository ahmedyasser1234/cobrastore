import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, UserStatus } from '../entities/user.entity';
import { ProductStatus } from '../entities/product.entity';
import { PayoutStatus } from '../entities/vendor-payout.entity';
import { OrderStatus } from '../entities/order.entity';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('revenue/monthly')
  async getMonthlyRevenue() {
    return this.adminService.getMonthlyRevenue();
  }

  @Get('users')
  async getUsers(@Query('role') role?: string, @Query('search') search?: string) {
    return this.adminService.getUsers(role, search);
  }

  @Post('users')
  async createUser(@Body() userData: any, @Request() req) {
    return this.adminService.createUser(userData, req.user.id);
  }

  @Patch('users/role/:id')
  async updateUserRole(@Param('id') id: string, @Body('role') role: string, @Request() req) {
    return this.adminService.updateUserRole(id, role, req.user.id);
  }

  @Patch('users/status/:id')
  async updateUserStatus(@Param('id') id: string, @Body('status') status: UserStatus, @Request() req) {
    return this.adminService.updateUserStatus(id, status, req.user.id);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req) {
    return this.adminService.deleteUser(id, req.user.id);
  }

  @Get('vendors')
  async getVendors(@Query('search') search?: string) {
    return this.adminService.getVendors(search);
  }

  @Patch('vendors/status/:id')
  async updateVendorStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
    return this.adminService.updateVendorStatus(id, status, req.user.id);
  }

  @Delete('vendors/:id')
  async deleteVendor(@Param('id') id: string, @Request() req) {
    return this.adminService.deleteVendor(id, req.user.id);
  }

  @Get('products')
  async getProducts(@Query('search') search?: string) {
    return this.adminService.getProducts(search);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string, @Request() req) {
    return this.adminService.deleteProduct(id, req.user.id);
  }

  @Get('orders')
  async getOrders(@Query('search') search?: string) {
    return this.adminService.getOrders(search);
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(@Param('id') id: string, @Body('status') status: OrderStatus, @Request() req) {
    return this.adminService.updateOrderStatus(id, status, req.user.id);
  }

  @Patch('vendors/:id/commission')
  async updateCommission(@Param('id') id: string, @Body('percentage') percentage: number, @Request() req) {
    return this.adminService.updateVendorCommission(id, percentage, req.user.id);
  }

  @Get('products/pending')
  async getPendingProducts() {
    return this.adminService.getPendingProducts();
  }

  @Patch('products/:id/status')
  async updateProductStatus(@Param('id') id: string, @Body('status') status: ProductStatus, @Request() req) {
    return this.adminService.updateProductStatus(id, status, req.user.id);
  }

  @Get('payouts')
  async getPayouts() {
    return this.adminService.getPayouts();
  }

  @Patch('payouts/:id/status')
  async updatePayoutStatus(@Param('id') id: string, @Body('status') status: PayoutStatus, @Request() req) {
    return this.adminService.updatePayoutStatus(id, status, req.user.id);
  }

  @Get('audit-logs')
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('notifications')
  async getNotifications() {
    return this.adminService.getNotifications();
  }

  @Post('vendors')
  async createVendor(@Body() vendorData: any, @Request() req) {
    return this.adminService.createVendor(vendorData, req.user.id);
  }

  @Get('settings')
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Post('settings')
  async updateSettings(@Body() settingsData: any) {
    return this.adminService.updateSettings(settingsData);
  }
}
