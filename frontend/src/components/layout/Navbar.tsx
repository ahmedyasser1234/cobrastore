import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import LanguageToggle from '../ui/LanguageToggle';
import Button from '../ui/Button';
import NotificationBell from '../ui/NotificationBell';

interface NavbarProps {
  opaque?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ opaque }) => {
  const { t, lang } = useTranslation();
  const { items, openCartDrawer } = useCartStore();
  const { isAuthenticated, user: authUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  
  const isOpaque = scrolled || opaque;

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'home', path: '/' },
    { name: 'shop', path: '/shop' },
    { name: 'departments', path: '/departments' },
    { name: 'vendors', path: '/vendors' },
    { name: 'about', path: '/about' },
  ];

  const textColor = isOpaque ? 'text-[#0F172A]' : 'text-white';
  const hoverColor = 'hover:text-primary';
  const iconColor = isOpaque ? 'text-[#0F172A]' : 'text-white';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-500"
      style={{
        background: isOpaque
          ? 'rgba(255,255,255,0.97)'
          : 'transparent',
        backdropFilter: isOpaque ? 'blur(14px)' : 'none',
        borderBottom: isOpaque ? '1px solid rgba(226,232,240,0.8)' : '1px solid transparent',
        boxShadow: isOpaque ? '0 2px 24px rgba(0,0,0,0.07)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full flex items-center justify-between">

        {/* LEFT: Logo */}
        <Link to="/" className="flex items-center group shrink-0">
          <div className="relative h-12 w-auto">
            <img src="/cobra-logo-dark.png" alt="Cobra Store" className="h-full w-auto transition-transform group-hover:scale-110 object-contain" />
          </div>
        </Link>

        {/* CENTER: Desktop Links */}
        <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-300 group ${textColor} ${hoverColor}`}
            >
              {t(`common.${link.name}`)}
              <span className="absolute -bottom-1 left-0 w-0 h-[0.5px] bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden md:flex items-center">
            <LanguageToggle />
          </div>

          <div className={`h-4 w-[1px] hidden md:block transition-colors duration-500 ${isOpaque ? 'bg-slate-200' : 'bg-white/30'}`} />

          {/* Cart & User */}
          <div className="flex items-center gap-3">
            <button 
              onClick={openCartDrawer} 
              className={`relative p-2 transition-colors group active:scale-90 ${iconColor} ${hoverColor}`}
            >
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {items.length}
                </span>
              )}
            </button>

            <NotificationBell iconColor={iconColor} hoverColor={hoverColor} />

            {isAuthenticated ? (
              <Link 
                to={`/dashboard/${authUser?.role?.toLowerCase() || 'customer'}`} 
                className={`flex items-center gap-2 p-2 transition-colors active:scale-90 ${iconColor} ${hoverColor}`}
              >
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                  <User size={16} className="text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                  {t('common.dashboard') || 'Dashboard'}
                </span>
              </Link>
            ) : (
              <Link to="/login" className={`p-2 transition-colors active:scale-90 ${iconColor} ${hoverColor}`}>
                <User size={20} />
              </Link>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 transition-all ml-1 ${iconColor} ${hoverColor}`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[72px] bg-white z-40 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col p-8 gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-extrabold uppercase tracking-tight text-text-main border-b border-slate-100 pb-4"
              >
                {t(`common.${link.name}`)}
              </Link>
            ))}
            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full h-14 text-lg tracking-widest uppercase rounded-xl">
                {t('common.register')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

