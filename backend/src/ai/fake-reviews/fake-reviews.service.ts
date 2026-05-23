import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class FakeReviewsService {
  private readonly logger = new Logger(FakeReviewsService.name);
  private readonly FREE_MODEL = 'claude-haiku-4-5-20251001';
  private readonly PAID_MODEL = 'claude-sonnet-4-6';
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
    this.model = config.get('AI_MODE') === 'paid' ? this.PAID_MODEL : this.FREE_MODEL;
  }

  async analyze(review: string, productName: string): Promise<{
    isFake: boolean;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
  } | null> {
    try {
      const res = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `هل الريفيو ده يبان مزيف لمنتج "${productName}"؟\nالريفيو: "${review}"\nعلامات الريفيو المزيف: عام جداً، مبالغ فيه، مش بيذكر تفاصيل المنتج، لغة غير طبيعية.\nرد بـ JSON فقط: {"isFake":true,"confidence":"high|medium|low","reason":""}`,
        }],
      });
      const content = res.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');
      const text = content.text.replace(/```json|```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`FakeReviews failed: ${error.message}`);
      return null;
    }
  }
}
