import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CategoryAttribute } from '../entities/category-attribute.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CategoryAttribute)
    private categoryAttributeRepository: Repository<CategoryAttribute>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ relations: ['department'] });
  }

  async findByDepartment(departmentId: string): Promise<Category[]> {
    return this.categoryRepository.find({ where: { departmentId } });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ 
      where: { id },
      relations: ['department']
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: any): Promise<Category> {
    const category = this.categoryRepository.create(data as any);
    return this.categoryRepository.save(category) as any;
  }

  async update(id: string, data: any): Promise<Category> {
    await this.categoryRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async findAttributes(categoryId: string): Promise<CategoryAttribute[]> {
    return this.categoryAttributeRepository.find({ where: { categoryId } });
  }
}
