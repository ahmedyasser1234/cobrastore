import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async findByUser(userId: string): Promise<Address[]> {
    return this.addressRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async create(userId: string, addressData: Partial<Address>): Promise<Address> {
    if (addressData.isDefault) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    }
    const address = this.addressRepository.create({ ...addressData, userId });
    return this.addressRepository.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.addressRepository.remove(address);
  }

  async setAsDefault(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');

    await this.addressRepository.update({ userId }, { isDefault: false });
    address.isDefault = true;
    return this.addressRepository.save(address);
  }
}
