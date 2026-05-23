import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OffersService } from './offers.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('vendors/offers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.VENDOR)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async findAll(@Req() req: any) {
    const vendorId = req.user.vendorId || req.user.id;
    return this.offersService.findAllForVendor(vendorId);
  }

  @Post()
  async create(@Req() req: any, @Body() data: any) {
    const vendorId = req.user.vendorId || req.user.id;
    return this.offersService.create(vendorId, data);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    const vendorId = req.user.vendorId || req.user.id;
    return this.offersService.update(id, vendorId, data);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const vendorId = req.user.vendorId || req.user.id;
    return this.offersService.delete(id, vendorId);
  }
}
