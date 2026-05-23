import api from './api';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  department?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  vendorId?: string;
}

export const productService = {
  getProducts: async (params: ProductQuery) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductBySlug: async (slug: string) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get('/products', { params: { limit: 8, sort: 'rating' } });
    return response.data.items;
  }
};
