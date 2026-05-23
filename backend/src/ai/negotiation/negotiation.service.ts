import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class NegotiationService {
  private readonly logger = new Logger(NegotiationService.name);
  private readonly FREE_MODEL = 'claude-haiku-4-5-20251001';
  private readonly PAID_MODEL = 'claude-sonnet-4-6';
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
    this.model = config.get('AI_MODE') === 'paid' ? this.PAID_MODEL : this.FREE_MODEL;
  }

  async negotiate(
    userOffer: string,
    productName: string,
    listedPrice: number,
    minPrice: number,
    history: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<{ reply: string } | null> {
    try {
      const res = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        system: `أنت وسيط تفاوض ذكي لمنتج "${productName}".\nالسعر المعروض: ${listedPrice} جنيه.\nالحد الأدنى السري: ${minPrice} جنيه — لا تذكره للمشتري أبداً.\nلو العرض فوق الحد الأدنى: اقبل أو اعرض سعر وسط.\nلو تحت الحد الأدنى: ارفض بلطف واقترح سعر أعلى.`,
        messages: [
          ...history,
          { role: 'user', content: userOffer },
        ],
      });
      const content = res.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');
      return { reply: content.text };
    } catch (error) {
      this.logger.error(`Negotiation failed: ${error.message}`);
      return null;
    }
  }
}
