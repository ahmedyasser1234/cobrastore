import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.id);
  }

  @Get('history/:otherUserId')
  async getHistory(@Param('otherUserId') otherUserId: string, @Request() req) {
    return this.chatService.getMessages(req.user.id, otherUserId);
  }

  @Post('send')
  async sendMessage(@Body() body: { receiverId: string, content: string }, @Request() req) {
    return this.chatService.saveMessage(req.user.id, body.receiverId, body.content);
  }
}
