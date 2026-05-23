import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);
  private readonly FREE_MODEL = 'claude-haiku-4-5-20251001';
  private readonly PAID_MODEL = 'claude-sonnet-4-6';
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly deeplKey: string;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
    this.model = config.get('AI_MODE') === 'paid' ? this.PAID_MODEL : this.FREE_MODEL;
    this.deeplKey = config.get('DEEPL_API_KEY');
  }

  async translate(text: string, targetLang: 'en' | 'fr' | 'ar'): Promise<string | null> {
    try {
      if (this.model === this.PAID_MODEL && this.deeplKey) {
        return await this.translateDeepL(text, targetLang);
      }
      return await this.translateClaude(text, targetLang);
    } catch (error) {
      this.logger.error(`Translate failed: ${error.message}`);
      return null;
    }
  }

  private async translateClaude(text: string, targetLang: string): Promise<string> {
    const langName = { en: 'الإنجليزية', fr: 'الفرنسية', ar: 'العربية' }[targetLang];
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `ترجم النص ده للـ ${langName} بأسلوب تسويقي احترافي — مش ترجمة حرفية.\nالنص: "${text}"\nرد بالنص المترجم فقط بدون أي إضافات.`,
      }],
    });
    const content = res.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');
    return content.text.trim();
  }

  private async translateDeepL(text: string, lang: string): Promise<string> {
    const res = await fetch('https://api.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.deeplKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: [text], target_lang: lang.toUpperCase() }),
    });
    const data = await res.json();
    return data.translations[0].text;
  }
}
