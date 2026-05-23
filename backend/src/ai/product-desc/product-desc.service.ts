import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ProductDescService {
  private readonly logger = new Logger(ProductDescService.name);
  private readonly FREE_MODEL = 'claude-haiku-4-5-20251001';
  private readonly PAID_MODEL = 'claude-sonnet-4-6';
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
    this.model = config.get('AI_MODE') === 'paid' ? this.PAID_MODEL : this.FREE_MODEL;
  }

  async generate(imageBase64: string, productName: string): Promise<{
    description: string;
    shortDesc: string;
    tags: string[];
    category: string;
    features: string[];
  } | null> {
    try {
      const res = await this.client.messages.create({
        model: this.model,
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
            },
            {
              type: 'text',
              text: `اكتب وصف تسويقي احترافي بالعربي لمنتج اسمه: "${productName}"\nرد بـ JSON فقط بدون أي كلام تاني:\n{"description":"","shortDesc":"","tags":[],"category":"","features":[]}`,
            },
          ],
        }],
      });
      const content = res.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');
      const text = content.text.replace(/```json|```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`ProductDesc failed: ${error.message}`);
      return null;
    }
  }
}
