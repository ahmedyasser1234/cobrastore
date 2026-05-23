import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Department } from './department.entity';
import { VendorCategory } from './vendor-category.entity';
import { VendorCollection } from './vendor-collection.entity';
import { ProductVariation } from './product-variation.entity';
import { ProductImage } from './product-image.entity';
import { Brand } from './brand.entity';
import { SubCategory } from './sub-category.entity';

export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
  DIGITAL = 'digital',
}

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  nameAr: string;

  @Column({ default: '' })
  nameEn: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  descriptionAr: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount: number;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  shippingSettings: any;

  @Column({ nullable: true })
  aiContextType: string;

  @Column({ type: 'jsonb', nullable: true })
  dynamicFields: any;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.SIMPLE,
  })
  type: ProductType;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.PENDING,
  })
  status: ProductStatus;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ nullable: true })
  seoTitle: string;

  @Column({ nullable: true, type: 'text' })
  seoDescription: string;

  @Column({ nullable: true })
  ogImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.products)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column()
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column()
  vendorCategoryId: string;

  @ManyToOne(() => VendorCategory, (vc) => vc.products)
  @JoinColumn({ name: 'vendorCategoryId' })
  vendorCategory: VendorCategory;

  @Column({ nullable: true })
  vendorCollectionId: string;

  @ManyToOne(() => VendorCollection, (col) => col.products)
  @JoinColumn({ name: 'vendorCollectionId' })
  vendorCollection: VendorCollection;

  @Column({ nullable: true })
  brandId: string;

  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ nullable: true })
  subCategoryId: string;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products)
  @JoinColumn({ name: 'subCategoryId' })
  subCategory: SubCategory;

  @OneToMany(() => ProductVariation, (variation) => variation.product)
  variations: ProductVariation[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'product_related',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'relatedProductId', referencedColumnName: 'id' },
  })
  relatedProducts: Product[];

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'product_upsell',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'upsellProductId', referencedColumnName: 'id' },
  })
  upsellProducts: Product[];

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'product_cross_sell',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'crossSellProductId', referencedColumnName: 'id' },
  })
  crossSellProducts: Product[];
}
