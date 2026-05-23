import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ReviewSummarizerService {
  private readonly logger = new Logger(ReviewSummarizerService.name);
  private readonly FREE_MODEL = 'claude-haiku-4-5-20251001';
  private readonly PAID_MODEL = 'claude-sonnet-4-6';
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
    this.model = config.get('AI_MODE') === 'paid' ? this.PAID_MODEL : this.FREE_MODEL;
  }

  async summarize(reviews: string[]): Promise<string> {
    if (!reviews || reviews.length === 0) return '';
    try {
      const res = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `لخص آراء العملاء التالية في 2-3 جمل (باللغتين العربية والإنجليزية) بطريقة احترافية: \n\n${reviews.join('\n')}`,
        }],
      });
      const content = res.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');
      return content.text.trim();
    } catch (error) {
      this.logger.error(`ReviewSummarizer failed: ${error.message}`);
      return '';
    }
  }
}
