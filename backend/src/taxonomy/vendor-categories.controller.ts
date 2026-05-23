import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { VendorCategoriesService } from './vendor-categories.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('vendor-categories')
export class VendorCategoriesController {
  constructor(private readonly vendorCategoriesService: VendorCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createVendorCategoryDto: any) {
    return this.vendorCategoriesService.create(createVendorCategoryDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query('vendorId') vendorId?: string) {
    return this.vendorCategoriesService.findAll(vendorId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.vendorCategoriesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateVendorCategoryDto: any) {
    return this.vendorCategoriesService.update(id, updateVendorCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.vendorCategoriesService.remove(id);
  }
}
