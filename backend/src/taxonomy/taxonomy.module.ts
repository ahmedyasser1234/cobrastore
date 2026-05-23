import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../entities/department.entity';
import { Category } from '../entities/category.entity';
import { VendorCategory } from '../entities/vendor-category.entity';
import { VendorCollection } from '../entities/vendor-collection.entity';
import { Product } from '../entities/product.entity';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { VendorCategoriesService } from './vendor-categories.service';
import { VendorCategoriesController } from './vendor-categories.controller';
import { VendorCollectionsService } from './vendor-collections.service';
import { VendorCollectionsController } from './vendor-collections.controller';

import { Brand } from '../entities/brand.entity';
import { SubCategory } from '../entities/sub-category.entity';
import { CategoryAttribute } from '../entities/category-attribute.entity';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { SubCategoriesService } from './sub-categories.service';
import { SubCategoriesController } from './sub-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Category, VendorCategory, VendorCollection, Product, Brand, SubCategory, CategoryAttribute])],
  providers: [DepartmentsService, CategoriesService, VendorCategoriesService, VendorCollectionsService, BrandsService, SubCategoriesService],
  controllers: [DepartmentsController, CategoriesController, VendorCategoriesController, VendorCollectionsController, BrandsController, SubCategoriesController],
  exports: [DepartmentsService, CategoriesService, VendorCategoriesService, VendorCollectionsService, BrandsService, SubCategoriesService, TypeOrmModule],
})
export class TaxonomyModule {}
