import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { User } from './user.entity';

export enum StoreRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  FULFILLMENT = 'fulfillment',
}

@Entity('store_staff')
export class StoreStaff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  storeId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'storeId' })
  store: Vendor;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: StoreRole,
    default: StoreRole.MANAGER,
  })
  role: StoreRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
