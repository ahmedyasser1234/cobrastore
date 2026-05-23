import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Product } from './product.entity';

@Entity('vendor_categories')
export class VendorCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  nameAr: string;

  @Column({ default: '' })
  nameEn: string;

  @Column()
  slug: string;

  @Column()
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @OneToMany(() => Product, (product) => product.vendorCategory)
  products: Product[];
}
