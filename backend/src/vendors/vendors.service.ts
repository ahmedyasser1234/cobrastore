import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor, VendorStatus } from '../entities/vendor.entity';
import { VendorPayout } from '../entities/vendor-payout.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorsRepository: Repository<Vendor>,
    @InjectRepository(VendorPayout)
    private payoutRepository: Repository<VendorPayout>,
    private usersService: UsersService,
  ) {}

  async findPayoutsByVendorId(vendorId: string): Promise<VendorPayout[]> {
    return this.payoutRepository.find({
      where: { vendorId },
      order: { createdAt: 'DESC' }
    });
  }

  async requestPayout(vendorId: string, amount: number): Promise<VendorPayout> {
    const payout = this.payoutRepository.create({
      vendorId,
      amount,
      status: 'pending',
      method: 'Bank Transfer'
    } as any);
    return this.payoutRepository.save(payout) as any;
  }

  async apply(userId: string, vendorData: any): Promise<Vendor> {
    const existing = await this.vendorsRepository.findOne({ 
      where: [{ userId }, { slug: vendorData.slug }] 
    });
    if (existing) {
      throw new ConflictException('Vendor application already exists or slug taken');
    }

    const vendor = this.vendorsRepository.create({
      ...vendorData,
      userId,
      status: VendorStatus.PENDING,
    } as any);
    return this.vendorsRepository.save(vendor) as any;
  }

  async findBySlug(slug: string): Promise<Vendor> {
    const vendor = await this.vendorsRepository.findOne({ 
      where: { slug },
      relations: ['user']
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async findByUserId(userId: string): Promise<Vendor> {
    const vendor = await this.vendorsRepository.findOne({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  async updateStatus(id: string, status: VendorStatus): Promise<Vendor> {
    const vendor = await this.vendorsRepository.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    vendor.status = status;
    return this.vendorsRepository.save(vendor) as any;
  }

  async updateProfile(id: string, updateData: any): Promise<Vendor> {
    await this.vendorsRepository.update(id, updateData);
    return this.vendorsRepository.findOne({ where: { id } }) as any;
  }

  async findAll(status?: VendorStatus): Promise<Vendor[]> {
    if (status) {
      return this.vendorsRepository.find({ where: { status } });
    }
    return this.vendorsRepository.find();
  }

  async delete(id: string): Promise<void> {
    const vendor = await this.vendorsRepository.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    await this.vendorsRepository.remove(vendor);
  }
}
