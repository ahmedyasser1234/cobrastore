import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
  ) {}

  async findAllForVendor(vendorId: string): Promise<Offer[]> {
    return this.offersRepository.find({ where: { vendorId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, vendorId: string): Promise<Offer> {
    const offer = await this.offersRepository.findOne({ where: { id, vendorId } });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async create(vendorId: string, data: any): Promise<Offer> {
    const offer = this.offersRepository.create({ ...data, vendorId });
    return this.offersRepository.save(offer as any);
  }

  async update(id: string, vendorId: string, data: any): Promise<Offer> {
    const offer = await this.findOne(id, vendorId);
    Object.assign(offer, data);
    return this.offersRepository.save(offer as any);
  }

  async delete(id: string, vendorId: string): Promise<void> {
    const offer = await this.findOne(id, vendorId);
    await this.offersRepository.remove(offer);
  }
}
