import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Category } from './category.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  nameAr: string;

  @Column({ default: '' })
  nameEn: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => Category, (category) => category.department)
  categories: Category[];

  @Column({ default: false })
  requiresSizes: boolean;

  @Column({ default: false })
  requiresColors: boolean;

  @Column({ default: false })
  aiBackgroundRemover: boolean;

  @Column({ default: false })
  aiAutoDescription: boolean;

  @Column({ default: false })
  aiSmartCategory: boolean;

  @Column({ default: false })
  aiAutoTranslate: boolean;

  @Column({ default: false })
  aiFakeReviewDetection: boolean;

  @Column({ default: false })
  aiNegotiation: boolean;

  @Column({ default: false })
  aiVirtualTryonClothes: boolean;

  @Column({ default: false })
  aiVirtualTryonAccessories: boolean;

  @Column({ default: false })
  aiSmartSearch: boolean;

  @Column({ default: false })
  aiChatbotSupport: boolean;
}
