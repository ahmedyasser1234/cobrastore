import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product, ProductStatus } from '../../entities/product.entity';

@Injectable()
export class VisualSearchService {
  private readonly logger = new Logger(VisualSearchService.name);
  private readonly client: Anthropic;

  constructor(
    private config: ConfigService,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
  }

  async searchByImage(imageBase64: string, mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'): Promise<Product[]> {
    try {
      // Use Claude Vision to analyze the image
      const res = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022', // Use Sonnet 3.5 for vision
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: 'Extract the main product type and key visual features from this image. Return ONLY a comma-separated list of 3-5 keywords in English (e.g., "sneakers, red, running shoes"). Do not include any other text.',
              }
            ],
          }
        ],
      });

      const content = res.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');
      
      const keywords = content.text.split(',').map(k => k.trim().toLowerCase());
      this.logger.log(`Visual Search extracted keywords: ${keywords.join(', ')}`);

      // Search products matching these keywords
      // Build an OR condition for each keyword matching nameEn, nameAr, or description
      const whereConditions = keywords.flatMap(keyword => [
        { nameEn: ILike(`%${keyword}%`), status: ProductStatus.APPROVED },
        { nameAr: ILike(`%${keyword}%`), status: ProductStatus.APPROVED },
        { descriptionEn: ILike(`%${keyword}%`), status: ProductStatus.APPROVED },
        { descriptionAr: ILike(`%${keyword}%`), status: ProductStatus.APPROVED },
      ]);

      if (whereConditions.length === 0) return [];

      const products = await this.productsRepository.find({
        where: whereConditions,
        take: 10,
        relations: ['images', 'vendor', 'department'],
      });

      return products;
    } catch (error) {
      this.logger.error(`Visual Search failed: ${error.message}`);
      return [];
    }
  }
}
