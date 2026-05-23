import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async findOrCreateCart(sessionId: string, userId?: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({ 
      where: userId ? { userId } : { sessionId },
      relations: ['items', 'items.product', 'items.product.images', 'items.variation']
    });

    if (!cart) {
      cart = this.cartRepository.create({ sessionId, userId });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async addItem(sessionId: string, itemData: any, userId?: string): Promise<Cart> {
    const cart = await this.findOrCreateCart(sessionId, userId);
    
    let item = cart.items.find(i => 
      i.productId === itemData.productId && i.variationId === itemData.variationId
    );

    if (item) {
      item.quantity += itemData.quantity;
      await this.cartItemRepository.save(item);
    } else {
      item = this.cartItemRepository.create({
        ...itemData,
        cartId: cart.id
      } as any) as any;
      await this.cartItemRepository.save(item);
    }

    return this.findOrCreateCart(sessionId, userId);
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.cartItemRepository.delete(itemId);
    } else {
      await this.cartItemRepository.update(itemId, { quantity });
    }
  }

  async removeItem(itemId: string): Promise<void> {
    await this.cartItemRepository.delete(itemId);
  }

  async mergeCarts(sessionId: string, userId: string): Promise<Cart> {
    const guestCart = await this.cartRepository.findOne({ 
      where: { sessionId },
      relations: ['items']
    });

    const userCart = await this.findOrCreateCart(sessionId, userId);

    if (guestCart && guestCart.items.length > 0) {
      for (const guestItem of guestCart.items) {
        const existingUserItem = userCart.items.find(i => 
          i.productId === guestItem.productId && i.variationId === guestItem.variationId
        );

        if (existingUserItem) {
          existingUserItem.quantity += guestItem.quantity;
          await this.cartItemRepository.save(existingUserItem);
        } else {
          guestItem.cartId = userCart.id;
          await this.cartItemRepository.save(guestItem);
        }
      }
      // Delete guest cart after merge
      await this.cartRepository.delete(guestCart.id);
    }

    return this.findOrCreateCart(sessionId, userId);
  }
}
