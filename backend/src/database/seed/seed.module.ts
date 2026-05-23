import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../../entities/user.entity';
import { Department } from '../../entities/department.entity';
import { VendorCategory } from '../../entities/vendor-category.entity';
import { VendorCollection } from '../../entities/vendor-collection.entity';
import { Product } from '../../entities/product.entity';
import { ProductVariation } from '../../entities/product-variation.entity';
import { ProductImage } from '../../entities/product-image.entity';
import { Vendor } from '../../entities/vendor.entity';

import { Category } from '../../entities/category.entity';
import { SubCategory } from '../../entities/sub-category.entity';
import { CategoryAttribute } from '../../entities/category-attribute.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Department, Category, SubCategory, CategoryAttribute, VendorCategory, VendorCollection, Product, ProductVariation, ProductImage, Vendor]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
