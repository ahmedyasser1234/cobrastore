import React from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';

const LanguageToggle: React.FC = () => {
  const { lang, toggleLanguage } = useLanguageStore();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold uppercase tracking-widest hover:text-primary transition-colors"
    >
      <span className={lang === 'en' ? 'text-primary' : 'text-text-muted'}>EN</span>
      <span className="text-slate-300">|</span>
      <span className={lang === 'ar' ? 'text-primary' : 'text-text-muted'}>AR</span>
    </button>
  );
};

export default LanguageToggle;
