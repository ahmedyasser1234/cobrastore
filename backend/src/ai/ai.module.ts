import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductDescService } from './product-desc/product-desc.service';
import { SmartCategoriesService } from './smart-categories/smart-categories.service';
import { TranslateService } from './translate/translate.service';
import { AiChatbotService } from './chatbot/ai-chatbot.service';
import { SmartSearchService } from './smart-search/smart-search.service';
import { FakeReviewsService } from './fake-reviews/fake-reviews.service';
import { NegotiationService } from './negotiation/negotiation.service';
import { BackgroundRemoverService } from './background-remover/background-remover.service';
import { ReviewSummarizerService } from './review-summarizer/review-summarizer.service';
import { AiController } from './ai.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ConfigModule, ProductsModule],
  controllers: [AiController],
  providers: [
    ProductDescService,
    SmartCategoriesService,
    TranslateService,
    AiChatbotService,
    SmartSearchService,
    FakeReviewsService,
    NegotiationService,
    BackgroundRemoverService,
    ReviewSummarizerService,
  ],
  exports: [
    ProductDescService,
    SmartCategoriesService,
    TranslateService,
    AiChatbotService,
    SmartSearchService,
    FakeReviewsService,
    NegotiationService,
    BackgroundRemoverService,
  ],
})
export class AiModule {}
