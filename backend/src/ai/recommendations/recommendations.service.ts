import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Product, ProductStatus } from '../../entities/product.entity';

@Injectable()
export class RecommendationsAiService {
  private readonly logger = new Logger(RecommendationsAiService.name);
  private readonly client: Anthropic;

  constructor(
    private config: ConfigService,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
  }

  async getAiRecommendations(productId: string): Promise<Product[]> {
    try {
      const product = await this.productsRepository.findOne({ 
        where: { id: productId },
        relations: ['department', 'vendorCategory']
      });

      if (!product) return [];

      // Ask Claude to analyze this product and suggest 3 complementary product categories or features
      const prompt = `Analyze this product:
Name: ${product.nameEn} / ${product.nameAr}
Description: ${product.descriptionEn}
Category: ${product.vendorCategory?.nameEn || product.department?.nameEn || 'General'}

Suggest 3 keywords for COMPLEMENTARY products (things bought together). 
Return ONLY a comma-separated list of 3 short keywords in English.`;

      const res = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = res.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');
      
      const keywords = content.text.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 2);
      this.logger.log(`AI Recommendations keywords for ${product.id}: ${keywords.join(', ')}`);

      if (keywords.length === 0) return [];

      // Query products that match these keywords
      const whereConditions = keywords.map(keyword => ({
        id: Not(product.id),
        status: ProductStatus.APPROVED,
        nameEn: require('typeorm').ILike(`%${keyword}%`),
      }));

      const recommendations = await this.productsRepository.find({
        where: whereConditions,
        take: 4,
        relations: ['images', 'vendor', 'department'],
      });

      return recommendations;
    } catch (error) {
      this.logger.error(`AI Recommendations failed: ${error.message}`);
      return [];
    }
  }
}
