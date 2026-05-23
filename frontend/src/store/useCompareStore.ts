import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompareProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  image: string;
  category: string;
  slug: string;
  attributes?: Record<string, any>;
  rating?: number;
}

interface CompareState {
  items: CompareProduct[];
  addItem: (product: CompareProduct) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) => set((state) => {
        if (state.items.find(i => i.id === product.id)) return state;
        if (state.items.length >= 4) return { items: [...state.items.slice(1), product] }; // max 4 items
        return { items: [...state.items, product] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      clearItems: () => set({ items: [] })
    }),
    {
      name: 'cobra-compare-storage'
    }
  )
);
