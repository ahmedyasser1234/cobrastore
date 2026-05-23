import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCategory } from '../entities/sub-category.entity';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
  ) {}

  async findAll(categoryId?: string): Promise<SubCategory[]> {
    const where = categoryId ? { categoryId } : {};
    return this.subCategoryRepo.find({ where, order: { nameEn: 'ASC' } });
  }

  async findOne(id: string): Promise<SubCategory> {
    const subCat = await this.subCategoryRepo.findOne({ where: { id } });
    if (!subCat) throw new NotFoundException('SubCategory not found');
    return subCat;
  }

  async create(data: Partial<SubCategory>): Promise<SubCategory> {
    const subCat = this.subCategoryRepo.create(data);
    return this.subCategoryRepo.save(subCat);
  }

  async update(id: string, data: Partial<SubCategory>): Promise<SubCategory> {
    const subCat = await this.findOne(id);
    Object.assign(subCat, data);
    return this.subCategoryRepo.save(subCat);
  }

  async remove(id: string): Promise<void> {
    const subCat = await this.findOne(id);
    await this.subCategoryRepo.remove(subCat);
  }
}
