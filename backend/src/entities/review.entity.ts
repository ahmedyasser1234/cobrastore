import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() productId: string;
  @Column() vendorId: string;
  @Column({ type: 'int' }) rating: number;         // 1-5
  @Column({ type: 'text', nullable: true }) comment: string;
  @Column({ default: false }) isFake: boolean;
  @Column({ nullable: true }) fakeConfidence: string;
  @Column({ nullable: true }) fakeReason: string;
  @Column({ default: false }) isApproved: boolean;
  @CreateDateColumn() createdAt: Date;
  @ManyToOne(() => User) @JoinColumn({ name: 'userId' }) user: User;
  @ManyToOne(() => Product) @JoinColumn({ name: 'productId' }) product: Product;
}
