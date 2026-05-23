import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { Vendor, VendorStatus } from './entities/vendor.entity';

@Controller('public')
export class PublicController {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Vendor)
    private vendorsRepository: Repository<Vendor>,
  ) {}

  @Get('stats')
  async getStats() {
    const productsCount = await this.productsRepository.count({
      where: { status: ProductStatus.APPROVED }
    });
    const vendorsCount = await this.vendorsRepository.count({
      where: { status: VendorStatus.APPROVED }
    });
    
    const ratingResult = await this.vendorsRepository
      .createQueryBuilder('vendor')
      .select('AVG(vendor.rating)', 'averageRating')
      .where('vendor.status = :status', { status: VendorStatus.APPROVED })
      .getRawOne();
      
    console.log('ratingResult:', ratingResult);

    const avgRating = ratingResult?.averageRating ? Number(ratingResult.averageRating).toFixed(1) : '0.0';

    return {
      products: productsCount > 1000 ? `${(productsCount/1000).toFixed(1)}K+` : productsCount.toString(),
      vendors: vendorsCount > 1000 ? `${(vendorsCount/1000).toFixed(1)}K+` : vendorsCount.toString(),
      rating: `${avgRating}★`
    };
  }
}

// trigger restart
