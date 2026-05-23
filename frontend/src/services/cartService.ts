import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addItem: async (productId: string, quantity: number, variationId?: string) => {
    const response = await api.post('/cart/items', { productId, quantity, variationId });
    return response.data;
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  removeItem: async (itemId: string) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  mergeCart: async () => {
    const response = await api.post('/cart/merge');
    return response.data;
  }
};
