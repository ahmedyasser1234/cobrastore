import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { Product, ProductStatus } from '../entities/product.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<any[]> {
    const depts = await this.departmentRepository.find({ 
      order: { order: 'ASC' },
      relations: ['categories'] 
    });
    // Append product count per department
    const results = await Promise.all(depts.map(async (dept) => {
      const productCount = await this.productRepository.count({
        where: { departmentId: dept.id, status: ProductStatus.APPROVED }
      });
      return { ...dept, productCount };
    }));
    return results;
  }

  async findOne(id: string): Promise<Department> {
    const dept = await this.departmentRepository.findOne({ 
      where: { id },
      relations: ['categories']
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(data: any): Promise<Department> {
    const dept = this.departmentRepository.create(data as any);
    return this.departmentRepository.save(dept) as any;
  }

  async update(id: string, data: any): Promise<Department> {
    await this.departmentRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const dept = await this.findOne(id);
    await this.departmentRepository.remove(dept);
  }
}
