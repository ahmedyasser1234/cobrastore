import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('points_transactions')
export class PointsTransaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ type: 'int' }) amount: number;          // موجب = كسب، سالب = صرف
  @Column() reason: string;                          // 'ORDER_PURCHASE' | 'REDEMPTION' | 'REFERRAL'
  @Column({ nullable: true }) orderId: string;
  @CreateDateColumn() createdAt: Date;
}
