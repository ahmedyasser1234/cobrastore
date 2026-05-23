import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductVariation } from '../entities/product-variation.entity';
import { ProductImage } from '../entities/product-image.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariation, ProductImage]),
    VendorsModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
