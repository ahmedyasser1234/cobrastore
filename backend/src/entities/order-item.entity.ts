import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariation } from './product-variation.entity';
import { Vendor } from './vendor.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  variationId: string;

  @ManyToOne(() => ProductVariation)
  @JoinColumn({ name: 'variationId' })
  variation: ProductVariation;

  @Column()
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'jsonb' })
  priceSnapshot: any;

  @Column({ type: 'jsonb', nullable: true })
  variationSnapshot: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  adminCommission: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vendorEarnings: number;
}
