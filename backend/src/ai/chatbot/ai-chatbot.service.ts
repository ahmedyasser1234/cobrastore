import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiChatbotService {
  private readonly logger = new Logger(AiChatbotService.name);
  private readonly FREE_MODEL = 'claude-haiku-4-5-20251001';
  private readonly PAID_MODEL = 'claude-sonnet-4-6';
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
    this.model = config.get('AI_MODE') === 'paid' ? this.PAID_MODEL : this.FREE_MODEL;
  }

  async chat(
    userMessage: string,
    history: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<{ reply: string; model: string } | null> {
    try {
      const res = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        system: `أنت مساعد خدمة عملاء ذكي لمنصة تسوق إلكترونية عربية متعددة المتاجر.\nمهامك: الرد على استفسارات المنتجات، الشحن، الإرجاع، والدفع.\nردودك: قصيرة، ودودة، وباللهجة المناسبة للعميل.\nلو السؤال خارج نطاق صلاحياتك: قل للعميل إنك هتحوله للدعم البشري.`,
        messages: [
          ...history,
          { role: 'user', content: userMessage },
        ],
      });
      const content = res.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');
      return { reply: content.text, model: this.model };
    } catch (error) {
      this.logger.error(`AiChatbot failed: ${error.message}`);
      return null;
    }
  }
}
