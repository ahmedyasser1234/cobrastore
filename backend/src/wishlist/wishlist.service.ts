import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async findByUser(userId: string): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { userId },
      relations: ['product', 'product.images'],
      order: { createdAt: 'DESC' },
    });
  }

  async add(userId: string, productId: string): Promise<Wishlist> {
    const existing = await this.wishlistRepository.findOne({ where: { userId, productId } });
    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }
    const item = this.wishlistRepository.create({ userId, productId });
    return this.wishlistRepository.save(item);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const item = await this.wishlistRepository.findOne({ where: { userId, productId } });
    if (!item) {
      throw new NotFoundException('Product not in wishlist');
    }
    await this.wishlistRepository.remove(item);
  }
}
