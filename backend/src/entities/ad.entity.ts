import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ nullable: true }) imageUrl: string;
  @Column({ nullable: true }) linkUrl: string;
  @Column({ default: true }) isActive: boolean;
  @Column({ nullable: true }) vendorId: string;
  @Column({ type: 'timestamp', nullable: true }) startsAt: Date;
  @Column({ type: 'timestamp', nullable: true }) endsAt: Date;
  @CreateDateColumn() createdAt: Date;
}
