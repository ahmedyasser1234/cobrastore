import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req, Patch, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.VENDOR)
  @Post()
  async create(@Req() req: any, @Body() productData: any) {
    // In a real app, we'd check if the vendor is approved here
    return this.productsService.create(req.user.vendorId || req.user.id, productData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.VENDOR)
  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() updateData: any) {
    return this.productsService.update(id, req.user.vendorId || req.user.id, updateData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/admin')
  async adminUpdate(@Param('id') id: string, @Body() updateData: any) {
    return this.productsService.adminUpdate(id, updateData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    // Note: In a real app, we'd verify the vendor owns the product if it's not an admin
    return this.productsService.delete(id);
  }

  @Get(':id/ai-suggestions')
  async getAiSuggestions(@Param('id') id: string) {
    return this.productsService.getAiSuggestions(id);
  }

  @Get(':id/recommendations')
  async getRecommendations(@Param('id') id: string) {
    return this.productsService.getRecommendations(id);
  }
}
