import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorCollection } from '../entities/vendor-collection.entity';

@Injectable()
export class VendorCollectionsService {
  constructor(
    @InjectRepository(VendorCollection)
    private collectionRepository: Repository<VendorCollection>,
  ) {}

  async findAll(vendorId?: string): Promise<VendorCollection[]> {
    if (vendorId) {
      return this.collectionRepository.find({ where: { vendorId } });
    }
    return this.collectionRepository.find();
  }

  async findOne(id: string): Promise<VendorCollection> {
    const collection = await this.collectionRepository.findOne({ where: { id } });
    if (!collection) {
      throw new NotFoundException(`Vendor Collection #${id} not found`);
    }
    return collection;
  }

  async create(data: Partial<VendorCollection>): Promise<VendorCollection> {
    const collection = this.collectionRepository.create(data);
    return this.collectionRepository.save(collection);
  }

  async update(id: string, data: Partial<VendorCollection>): Promise<VendorCollection> {
    await this.collectionRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const collection = await this.findOne(id);
    await this.collectionRepository.remove(collection);
  }
}
