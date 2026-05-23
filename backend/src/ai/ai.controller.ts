import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AiChatbotService } from './chatbot/ai-chatbot.service';
import { NegotiationService } from './negotiation/negotiation.service';
import { FakeReviewsService } from './fake-reviews/fake-reviews.service';
import { SmartSearchService } from './smart-search/smart-search.service';
import { ProductsService } from '../products/products.service';

@UseGuards(AuthGuard('jwt'), ThrottlerGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly chatbotService: AiChatbotService,
    private readonly negotiationService: NegotiationService,
    private readonly fakeReviewsService: FakeReviewsService,
    private readonly smartSearchService: SmartSearchService,
    private readonly productsService: ProductsService,
  ) {}

  @Post('chatbot')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async handleChatbot(
    @Body('message') message: string,
    @Body('history') history: { role: 'user' | 'assistant'; content: string }[] = [],
  ) {
    if (!message) {
      return { reply: 'عذراً، لم أتلق أي رسالة.' };
    }
    
    const response = await this.chatbotService.chat(message, history);
    
    if (!response) {
      return { reply: 'عذراً، أواجه مشكلة في الاتصال حالياً. يرجى المحاولة لاحقاً.' };
    }
    
    return { reply: response.reply };
  }

  @Post('negotiation')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async handleNegotiation(
    @Body('userOffer') userOffer: string,
    @Body('productName') productName: string,
    @Body('listedPrice') listedPrice: number,
    @Body('history') history: any[],
  ) {
    const minPrice = listedPrice * 0.8; // Assume 20% max discount for demo
    const result = await this.negotiationService.negotiate(userOffer, productName, listedPrice, minPrice, history);
    
    let agreedPrice = null;
    if (result && (result.reply.includes('موافق') || result.reply.includes('قبلت') || result.reply.toLowerCase().includes('agree') || result.reply.toLowerCase().includes('deal'))) {
      const numbers = userOffer.match(/\d+/g);
      if (numbers) {
        agreedPrice = Math.max(...numbers.map(Number));
      }
    }
    
    return { reply: result?.reply || 'حدث خطأ أثناء التفاوض', agreedPrice };
  }

  @Post('fake-reviews')
  async handleFakeReviews(
    @Body('review') review: string,
    @Body('productName') productName: string,
  ) {
    const result = await this.fakeReviewsService.analyze(review, productName);
    return result || { isFake: false, confidence: 'low', reason: 'Failed to analyze' };
  }

  @Post('visual-search')
  async handleVisualSearch(
    @Body('image') image: string, // base64 string
  ) {
    if (!image) return { keywords: [], products: [] };
    
    // Extract base64 and media type
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return { keywords: [], products: [] };
    }
    const mediaType = matches[1];
    const base64Data = matches[2];

    const keywords = await this.smartSearchService.visualSearch(base64Data, mediaType);
    
    if (keywords.length === 0) return { keywords: [], products: [] };

    // Search products using the keywords
    const result = await this.productsService.findAll({ search: keywords[0], limit: 12 });
    // In a real app we'd construct an OR query for all keywords, but for demo we just use the most prominent one or use a full-text search.
    
    return { keywords, products: result.items };
  }
}
