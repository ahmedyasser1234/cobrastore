import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  lang: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: 'en' | 'ar') => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: 'en',
      dir: 'ltr',
      setLanguage: (lang) => {
        set({ lang, dir: lang === 'ar' ? 'rtl' : 'ltr' });
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      },
      toggleLanguage: () => {
        set((state) => {
          const newLang = state.lang === 'en' ? 'ar' : 'en';
          const newDir = newLang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = newLang;
          document.documentElement.dir = newDir;
          return { lang: newLang, dir: newDir };
        });
      },
    }),
    {
      name: 'cobra-language-storage',
    }
  )
);
