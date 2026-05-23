import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Settings, Monitor, Bell, Search, Menu, LogOut, Languages, Heart, MapPin, MessageCircle
} from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { useLanguageStore } from '../../../store/useLanguageStore';
import api from '../../../services/api';
import NotificationBell from '../../ui/NotificationBell';

const CustomerLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { t, lang, dir } = useTranslation();
  const { toggleLanguage } = useLanguageStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    return [
      { 
        section: lang === 'ar' ? 'حسابي' : 'My Account',
        items: [
          { name: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: <LayoutDashboard size={18} />, path: '/dashboard/customer' },
          { name: lang === 'ar' ? 'طلباتي' : 'My Orders', icon: <ShoppingBag size={18} />, path: '/dashboard/customer/orders' },
          { name: lang === 'ar' ? 'الإشعارات' : 'Notifications', icon: <Bell size={18} />, path: '/dashboard/customer/notifications' },
          { name: lang === 'ar' ? 'الرسائل' : 'Messages', icon: <MessageCircle size={18} />, path: '/dashboard/customer/chat' },
          { name: lang === 'ar' ? 'المفضلة' : 'Wishlist', icon: <Heart size={18} />, path: '/dashboard/customer/wishlist' },
          { name: lang === 'ar' ? 'العناوين' : 'Addresses', icon: <MapPin size={18} />, path: '/dashboard/customer/addresses' },
          { name: lang === 'ar' ? 'الإعدادات' : 'Settings', icon: <Settings size={18} />, path: '/dashboard/customer/settings' },
        ]
      }
    ];
  };

  const menuItems = getMenuItems();
  const textAlignment = lang === 'ar' ? 'text-right' : 'text-left';

  return (
    <div className="flex h-screen bg-background text-text-main overflow-hidden" dir={dir}>
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 ${lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-72 bg-surface border-border transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}`}>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-8 pb-12 flex items-center justify-center shrink-0">
            <div className="w-20 h-20 bg-transparent flex items-center justify-center shrink-0">
              <img src="/cobra-logo-dark.png" alt="Cobra" className="h-full w-auto object-contain" />
            </div>
          </div>

          <nav className="flex-grow px-6 space-y-8 overflow-y-auto custom-scrollbar">
            {menuItems.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <div className={`px-4 text-[9px] font-black uppercase tracking-widest text-text-muted ${textAlignment}`}>
                  {section.section}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider relative group ${
                          isActive 
                            ? 'text-black bg-primary shadow-glow-primary' 
                            : 'text-text-muted hover:text-text-main hover:bg-primary/5'
                        }`}
                      >
                        <span className={isActive ? 'text-black' : 'text-primary/70 group-hover:text-primary transition-colors'}>
                          {item.icon}
                        </span>
                        <span className={`flex-grow ${textAlignment}`}>{item.name}</span>
                        {isActive && (
                          <span className={`absolute inset-y-4 w-1 bg-black rounded-full ${lang === 'ar' ? 'left-4' : 'right-4'}`} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-border mt-auto shrink-0">
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
            >
              <LogOut size={20} />
              <span className={`font-bold uppercase text-[10px] tracking-widest flex-grow ${textAlignment}`}>
                {t('dashboard.sidebar.logout')}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-surface/50 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-background rounded-lg">
              <Menu size={24} />
            </button>

            <div className="hidden md:flex items-center gap-4 bg-background border border-border px-4 py-2 rounded-xl w-96">
              <Search size={18} className="text-text-muted" />
              <input 
                type="text" 
                placeholder={t('dashboard.topbar.search_placeholder')} 
                className={`bg-transparent outline-none text-sm w-full font-bold placeholder:text-text-muted/50 ${textAlignment}`} 
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl hover:border-primary transition-all text-xs font-bold uppercase tracking-widest group"
            >
              <Monitor size={16} className="text-primary" />
              <span>{lang === 'ar' ? 'تصفح المتجر' : 'Storefront'}</span>
            </Link>

            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl hover:border-primary transition-all text-xs font-bold uppercase tracking-widest group"
            >
              <Languages size={18} className="text-primary group-hover:rotate-180 transition-transform duration-500" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <NotificationBell />

            <div className="flex items-center gap-3">
              <div className={`${textAlignment} hidden sm:block`}>
                <div className="text-sm font-bold">{user?.name}</div>
                <div className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">
                  {lang === 'ar' ? 'عميل' : 'CUSTOMER'}
                </div>
              </div>
              <div className="w-10 h-10 bg-primary/20 border border-primary/50 rounded-xl flex items-center justify-center text-primary font-black shadow-glow-primary/20">
                {(user?.name || 'C').substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-8 overflow-y-auto custom-scrollbar bg-background/50">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
        />
      )}
    </div>
  );
};

export default CustomerLayout;
