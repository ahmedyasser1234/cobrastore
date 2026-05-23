import { Controller, Get, Post, Patch, Delete, Body, Param, Req, Headers, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@Headers('x-session-id') sessionId: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.cartService.findOrCreateCart(sessionId, userId);
  }

  @Post('items')
  async addItem(
    @Headers('x-session-id') sessionId: string,
    @Body() itemData: any,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.cartService.addItem(sessionId, itemData, userId);
  }

  @Patch('items/:id')
  async updateQuantity(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.cartService.updateQuantity(id, quantity);
  }

  @Delete('items/:id')
  async removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('merge')
  async mergeCarts(@Headers('x-session-id') sessionId: string, @Req() req: any) {
    return this.cartService.mergeCarts(sessionId, req.user.id);
  }
}
