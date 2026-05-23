import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from './category.entity';

export enum AttributeType {
  ATTRIBUTE = 'attribute',
  VARIANT = 'variant',
}

@Entity('category_attributes')
export class CategoryAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nameEn: string;

  @Column()
  nameAr: string;

  @Column({
    type: 'enum',
    enum: AttributeType,
    default: AttributeType.ATTRIBUTE,
  })
  type: AttributeType;

  @Column({ type: 'jsonb', nullable: true })
  options: string[]; // e.g. ["XS", "S", "M"] or ["Red", "Blue"]

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.attributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
