import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class SmartCategoriesService {
  private readonly logger = new Logger(SmartCategoriesService.name);
  private readonly FREE_MODEL = 'claude-haiku-4-5-20251001';
  private readonly PAID_MODEL = 'claude-sonnet-4-6';
  private readonly client: Anthropic;
  private readonly model: string;

  private readonly CATEGORIES = [
    'ملابس رجالي', 'ملابس حريمي', 'ملابس أطفال',
    'أحذية', 'حقائب', 'إكسسوارات', 'ساعات', 'مجوهرات',
    'إلكترونيات', 'أثاث', 'مستلزمات منزلية', 'كتب', 'رياضة', 'أخرى',
  ];

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
    this.model = config.get('AI_MODE') === 'paid' ? this.PAID_MODEL : this.FREE_MODEL;
  }

  async classify(productName: string, imageBase64?: string): Promise<{
    category: string;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
  } | null> {
    try {
      const content: any[] = [];
      if (imageBase64) {
        content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } });
      }
      content.push({
        type: 'text',
        text: `صنّف المنتج ده في الكاتيجوري المناسبة:\nاسم المنتج: "${productName}"\nالكاتيجوريز المتاحة: ${this.CATEGORIES.join(' | ')}\nرد بـ JSON فقط: {"category":"","confidence":"high|medium|low","reason":""}`,
      });
      const res = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        messages: [{ role: 'user', content }],
      });
      const responseContent = res.content[0];
      if (responseContent.type !== 'text') throw new Error('Unexpected response type');
      const text = responseContent.text.replace(/```json|```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`SmartCategories failed: ${error.message}`);
      return null;
    }
  }
}
