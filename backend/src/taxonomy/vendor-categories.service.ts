import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorCategory } from '../entities/vendor-category.entity';

@Injectable()
export class VendorCategoriesService {
  constructor(
    @InjectRepository(VendorCategory)
    private categoryRepository: Repository<VendorCategory>,
  ) {}

  async findAll(vendorId?: string): Promise<VendorCategory[]> {
    if (vendorId) {
      return this.categoryRepository.find({ where: { vendorId } });
    }
    return this.categoryRepository.find();
  }

  async findOne(id: string): Promise<VendorCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Vendor Category #${id} not found`);
    }
    return category;
  }

  async create(data: Partial<VendorCategory>): Promise<VendorCategory> {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async update(id: string, data: Partial<VendorCategory>): Promise<VendorCategory> {
    await this.categoryRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }
}
