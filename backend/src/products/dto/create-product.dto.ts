import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsBoolean, Min, IsUUID } from 'class-validator';
import { ProductType, ProductStatus } from '../../entities/product.entity';

export class CreateProductDto {
  @IsString()
  nameAr: string;

  @IsString()
  nameEn: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  shippingSettings?: any;

  @IsOptional()
  dynamicFields?: any;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsUUID()
  departmentId: string;

  @IsUUID()
  vendorCategoryId: string;

  @IsOptional()
  @IsUUID()
  vendorCollectionId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  subCategoryId?: string;
}
