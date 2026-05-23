import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompareProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

interface CompareStore {
  items: CompareProduct[];
  addItem: (product: CompareProduct) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  isCompareOpen: boolean;
  setCompareOpen: (isOpen: boolean) => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCompareOpen: false,
      addItem: (product) => {
        const items = get().items;
        if (items.length >= 4) {
          // Keep max 4
          return;
        }
        if (!items.find(i => i.id === product.id)) {
          set({ items: [...items, product] });
        }
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
      clearItems: () => set({ items: [] }),
      setCompareOpen: (isOpen) => set({ isCompareOpen: isOpen }),
    }),
    {
      name: 'cobra-compare-storage',
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
