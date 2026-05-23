import { useLanguageStore } from '../store/useLanguageStore';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

type TranslationKeys = typeof en;

export const useTranslation = () => {
  const { lang, dir } = useLanguageStore();
  const translations = lang === 'ar' ? ar : en;

  const t = (path: string) => {
    const keys = path.split('.');
    let value: any = translations;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path;
      }
    }

    return value as string;
  };

  const formatPrice = (price: number) => {
    return lang === 'ar' 
      ? `${price.toLocaleString('ar-EG')} ج.م` 
      : `${price.toLocaleString('en-US')} EGP`;
  };

  return { t, lang, dir, formatPrice };
};
