import { Controller, Post, Get, Body, Param, Patch, UseGuards, Req, Query, Delete } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { VendorStatus } from '../entities/vendor.entity';

@Controller('vendors')
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Get('public')
  async getPublicVendors() {
    return this.vendorsService.findAll(VendorStatus.APPROVED);
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('apply')
  async apply(@Req() req: any, @Body() vendorData: any) {
    return this.vendorsService.apply(req.user.id, vendorData);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.vendorsService.findBySlug(slug);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile/me')
  async getMyProfile(@Req() req: any) {
    return this.vendorsService.findByUserId(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('payouts/me')
  async getMyPayouts(@Req() req: any) {
    const vendor = await this.vendorsService.findByUserId(req.user.id);
    return this.vendorsService.findPayoutsByVendorId(vendor.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.VENDOR)
  @Post('payouts/request')
  async requestPayout(@Req() req: any, @Body('amount') amount: number) {
    const vendor = await this.vendorsService.findByUserId(req.user.id);
    return this.vendorsService.requestPayout(vendor.id, amount);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile/me')
  async updateMyProfile(@Req() req: any, @Body() updateData: any) {
    const vendor = await this.vendorsService.findByUserId(req.user.id);
    return this.vendorsService.updateProfile(vendor.id, updateData);
  }

  // Admin routes
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAll(@Query('status') status?: VendorStatus) {
    return this.vendorsService.findAll(status);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: VendorStatus) {
    return this.vendorsService.updateStatus(id, status);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.vendorsService.delete(id);
  }
}
