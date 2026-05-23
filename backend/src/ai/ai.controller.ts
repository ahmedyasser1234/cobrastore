import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiChatbotService } from './chatbot/ai-chatbot.service';

@Controller('ai')
export class AiController {
  constructor(private readonly chatbotService: AiChatbotService) {}

  @Post('chatbot')
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
}
