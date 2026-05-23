import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import WavyDivider from '../ui/WavyDivider';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="relative h-16 md:h-24 w-full bg-transparent overflow-hidden">
        <WavyDivider color="fill-[#0F172A]" position="bottom" />
      </div>
      <footer className="relative bg-[#0F172A] pt-20 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Newsletter */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center">
              <img src="/cobra-logo-dark.png" alt="Cobra Store" className="h-10 w-auto cobra-glow" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              {t('hero.subtitle')}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-primary/50 text-slate-400 hover:text-primary transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-primary/50 text-slate-400 hover:text-primary transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-primary/50 text-slate-400 hover:text-primary transition-all">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6 border-l-2 border-primary pl-3">{t('footer.links')}</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-400 font-medium">
              <li><Link to="/shop" className="hover:text-primary transition-colors">{t('common.shop')}</Link></li>
              <li><Link to="/vendors" className="hover:text-primary transition-colors">{t('common.top_vendors')}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">{t('common.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('common.contact')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6 border-l-2 border-primary pl-3">{t('footer.support')}</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-400 font-medium">
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary" />
                <span>+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary" />
                <span>support@cobrastore.com</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-primary" />
                <span>Cairo, Egypt</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6 border-l-2 border-primary pl-3">{t('common.newsletter')}</h4>
            <p className="text-sm text-slate-400 font-medium mb-4">Subscribe to get special offers and once-in-a-lifetime deals.</p>
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl outline-none focus:border-primary transition-all text-white placeholder:text-slate-500"
              />
              <button className="btn-primary w-full h-12 font-medium">
                {t('common.subscribe')}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-widest">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
};

export default Footer;
