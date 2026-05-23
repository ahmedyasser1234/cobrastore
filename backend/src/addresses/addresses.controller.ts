import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Patch } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMyAddresses(@Req() req: any) {
    return this.addressesService.findByUser(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async addAddress(@Req() req: any, @Body() addressData: any) {
    return this.addressesService.create(req.user.id, addressData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async removeAddress(@Param('id') id: string, @Req() req: any) {
    return this.addressesService.remove(id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/default')
  async setDefault(@Param('id') id: string, @Req() req: any) {
    return this.addressesService.setAsDefault(id, req.user.id);
  }
}
