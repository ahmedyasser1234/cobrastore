import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class SmartSearchService {
  private readonly logger = new Logger(SmartSearchService.name);
  private readonly FREE_MODEL = 'claude-haiku-4-5-20251001';
  private readonly PAID_MODEL = 'claude-sonnet-4-6';
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
    this.model = config.get('AI_MODE') === 'paid' ? this.PAID_MODEL : this.FREE_MODEL;
  }

  async parseQuery(rawQuery: string): Promise<{
    keywords: string[];
    category: string;
    priceMin: number | null;
    priceMax: number | null;
    color: string;
    synonyms: string[];
  } | null> {
    try {
      const res = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `حوّل استفسار البحث ده لـ structured query للبحث في متجر إلكتروني:\n"${rawQuery}"\nرد بـ JSON فقط:\n{"keywords":[],"category":"","priceMin":null,"priceMax":null,"color":"","synonyms":[]}`,
        }],
      });
      const content = res.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');
      const text = content.text.replace(/```json|```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`SmartSearch failed: ${error.message}`);
      return null;
    }
  }
}
