import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad } from '../entities/ad.entity';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad)
    private adsRepository: Repository<Ad>,
  ) {}

  async findAll() {
    return this.adsRepository.find();
  }

  async findOne(id: string) {
    const ad = await this.adsRepository.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }

  async create(createAdDto: CreateAdDto) {
    const ad = this.adsRepository.create(createAdDto);
    return this.adsRepository.save(ad);
  }

  async update(id: string, updateAdDto: UpdateAdDto) {
    const ad = await this.findOne(id);
    Object.assign(ad, updateAdDto);
    return this.adsRepository.save(ad);
  }

  async delete(id: string) {
    const ad = await this.findOne(id);
    await this.adsRepository.remove(ad);
    return { message: 'Ad deleted successfully' };
  }
}
