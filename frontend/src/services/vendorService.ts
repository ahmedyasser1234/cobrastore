import api from './api';

export const vendorService = {
  getVendors: async () => {
    const response = await api.get('/vendors/public');
    return response.data;
  },

  getVendorBySlug: async (slug: string) => {
    const response = await api.get(`/vendors/${slug}`);
    return response.data;
  }
};
