import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Department } from './department.entity';
import { SubCategory } from './sub-category.entity';
import { CategoryAttribute } from './category-attribute.entity';

@Entity('categories')
export class Category {
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

  @Column()
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories: SubCategory[];

  @OneToMany(() => CategoryAttribute, (attribute) => attribute.category)
  attributes: CategoryAttribute[];

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
