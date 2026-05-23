import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMyWishlist(@Req() req: any) {
    return this.wishlistService.findByUser(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':productId')
  async addToWishlist(@Param('productId') productId: string, @Req() req: any) {
    return this.wishlistService.add(req.user.id, productId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':productId')
  async removeFromWishlist(@Param('productId') productId: string, @Req() req: any) {
    return this.wishlistService.remove(req.user.id, productId);
  }
}
