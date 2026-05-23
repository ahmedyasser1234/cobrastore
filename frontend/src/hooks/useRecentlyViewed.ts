import { useState, useEffect } from 'react';

export interface RecentlyViewedProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  image: string;
  slug: string;
}

const STORAGE_KEY = 'cobra_recently_viewed';
const MAX_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently viewed products', e);
      }
    }
  }, []);

  const addProduct = (product: RecentlyViewedProduct) => {
    setRecentlyViewed(prev => {
      // Remove if it already exists to put it at the front
      const filtered = prev.filter(p => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewed([]);
  };

  return {
    recentlyViewed,
    addProduct,
    clearRecentlyViewed
  };
};
