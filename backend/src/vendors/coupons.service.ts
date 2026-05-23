import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponsRepository: Repository<Coupon>,
  ) {}

  async findAllForVendor(vendorId: string): Promise<Coupon[]> {
    return this.couponsRepository.find({ where: { vendorId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, vendorId: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne({ where: { id, vendorId } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async create(vendorId: string, data: any): Promise<Coupon> {
    const coupon = this.couponsRepository.create({ ...data, vendorId });
    return this.couponsRepository.save(coupon as any);
  }

  async update(id: string, vendorId: string, data: any): Promise<Coupon> {
    const coupon = await this.findOne(id, vendorId);
    Object.assign(coupon, data);
    return this.couponsRepository.save(coupon as any);
  }

  async delete(id: string, vendorId: string): Promise<void> {
    const coupon = await this.findOne(id, vendorId);
    await this.couponsRepository.remove(coupon);
  }
}
