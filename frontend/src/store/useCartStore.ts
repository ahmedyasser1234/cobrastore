import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { cartService } from '../services/cartService';

interface CartItem {
  id?: string;
  productId: string;
  variationId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  attributes?: any;
}

interface CartStore {
  items: CartItem[];
  sessionId: string;
  loading: boolean;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (itemId: string, productId: string, variationId?: string) => Promise<void>;
  updateQuantity: (itemId: string, productId: string, variationId: string | undefined, qty: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: uuidv4(),
      loading: false,
      isCartDrawerOpen: false,

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),
      toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

      fetchCart: async () => {
        set({ loading: true });
        try {
          const data = await cartService.getCart();
          // Transform backend items to CartItem interface if necessary
          const formattedItems = data.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            variationId: item.variationId,
            name: item.product?.nameAr || item.product?.nameEn || item.product?.name || 'Product',
            price: Number(item.price || item.product?.basePrice || item.product?.price || 0),
            quantity: item.quantity,
            image: item.product?.images?.[0]?.imageUrl || item.product?.image || ''
          }));
          set({ items: formattedItems, loading: false });
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          set({ loading: false });
        }
      },

      addItem: async (newItem) => {
        set({ loading: true });
        try {
          const data = await cartService.addItem(newItem.productId, newItem.quantity, newItem.variationId);
          await get().fetchCart(); // Re-fetch to get consistent state and IDs
        } catch (error) {
          console.error('Failed to add item:', error);
        } finally {
          set({ loading: false });
          get().openCartDrawer();
        }
      },

      removeItem: async (itemId, productId, variationId) => {
        set({ loading: true });
        try {
          await cartService.removeItem(itemId);
          set((state) => ({
            items: state.items.filter(i => i.id !== itemId)
          }));
        } catch (error) {
          console.error('Failed to remove item:', error);
        } finally {
          set({ loading: false });
        }
      },

      updateQuantity: async (itemId, productId, variationId, qty) => {
        if (qty < 1) return get().removeItem(itemId, productId, variationId);
        
        set({ loading: true });
        try {
          await cartService.updateQuantity(itemId, qty);
          set((state) => ({
            items: state.items.map(i => i.id === itemId ? { ...i, quantity: qty } : i)
          }));
        } catch (error) {
          console.error('Failed to update quantity:', error);
        } finally {
          set({ loading: false });
        }
      },

      clearCart: () => set({ items: [] }),
    }),
    { name: 'elkoko-cart' }
  )
);
