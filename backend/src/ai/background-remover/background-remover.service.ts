import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BackgroundRemoverService {
  private readonly logger = new Logger(BackgroundRemoverService.name);
  private readonly mode: string;
  private readonly rembgUrl: string;
  private readonly pixaKey: string;

  constructor(private config: ConfigService) {
    this.mode = this.config.get('AI_MODE') ?? 'free';
    this.rembgUrl = this.config.get('REMBG_SERVICE_URL') ?? 'http://localhost:5001';
    this.pixaKey = this.config.get('PIXA_API_KEY');
  }

  async removeBg(imageBase64: string): Promise<string | null> {
    try {
      if (this.mode === 'paid') return await this.removeBgPaid(imageBase64);
      return await this.removeBgFree(imageBase64);
    } catch (error) {
      this.logger.error(`BackgroundRemover failed: ${error.message}`);
      return null;
    }
  }

  private async removeBgFree(imageBase64: string): Promise<string> {
    const res = await fetch(`${this.rembgUrl}/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 }),
    });
    const data = await res.json();
    return data.result_base64;
  }

  private async removeBgPaid(imageBase64: string): Promise<string> {
    const buffer = Buffer.from(imageBase64, 'base64');
    const formData = new FormData();
    formData.append('image', new Blob([buffer], { type: 'image/jpeg' }), 'product.jpg');
    const res = await fetch('https://api.developer.pixelcut.ai/v1/remove-background', {
      method: 'POST',
      headers: { 'X-API-KEY': this.pixaKey, 'Accept': 'application/json' },
      body: formData,
    });
    const data = await res.json();
    return data.result_url;
  }
}
