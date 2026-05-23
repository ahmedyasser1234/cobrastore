import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariation } from './product-variation.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.images)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  variationId: string;

  @ManyToOne(() => ProductVariation)
  @JoinColumn({ name: 'variationId' })
  variation: ProductVariation;

  @Column()
  imageUrl: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: 0 })
  sortOrder: number;
}
