import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Store, ShoppingBag, 
  Settings, BarChart3, Package, Heart, History, User as UserIcon, LayoutGrid, Layout, Monitor,
  Shield, DollarSign, CheckSquare, MessageSquare, Bell, Search, Menu, LogOut, Languages, Plus
} from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { useLanguageStore } from '../../../store/useLanguageStore';
import NotificationBell from '../../ui/NotificationBell';

const AdminLayout: React.FC = () => {
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
    if (!user) return [];
    
    const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin';
    const isSupport = user?.role === 'support';
    const isProductManager = user?.role === 'product_manager';

    const menu = [];

    // Main Management
    if (isSuperAdmin || isSupport) {
      menu.push({ 
        section: t('dashboard.sidebar.main_management'),
        items: [
          { name: t('dashboard.sidebar.overview'), icon: <LayoutDashboard size={18} />, path: '/dashboard/admin' },
          { name: t('dashboard.sidebar.users'), icon: <Users size={18} />, path: '/dashboard/admin/users' },
          { name: t('dashboard.sidebar.vendors'), icon: <Store size={18} />, path: '/dashboard/admin/vendors' },
          { name: t('dashboard.sidebar.orders'), icon: <ShoppingBag size={18} />, path: '/dashboard/admin/orders' },
          { name: t('dashboard.sidebar.products'), icon: <Package size={18} />, path: '/dashboard/admin/products' },
          { name: t('dashboard.sidebar.chat'), icon: <MessageSquare size={18} />, path: '/dashboard/admin/chat' },
          { name: t('dashboard.sidebar.notifications'), icon: <Bell size={18} />, path: '/dashboard/admin/notifications' },
          { name: t('dashboard.sidebar.settings'), icon: <Settings size={18} />, path: '/dashboard/admin/settings' },
        ]
      });
    }

    // Content Management (Taxonomy & Approval)
    if (isSuperAdmin || isProductManager) {
      menu.push({ 
        section: t('dashboard.sidebar.content_management'),
        items: [
          { name: lang === 'ar' ? 'الهيكلة والتصنيفات' : 'Taxonomy', icon: <LayoutGrid size={18} />, path: '/dashboard/admin/taxonomy' },
          { name: t('dashboard.sidebar.approval'), icon: <CheckSquare size={18} />, path: '/dashboard/admin/approval' },
        ]
      });
    }

    // Finance & Marketing
    if (isSuperAdmin) {
      menu.push({ 
        section: t('dashboard.sidebar.marketing_finance'),
        items: [
          { name: t('dashboard.sidebar.coupons'), icon: <Heart size={18} />, path: '/dashboard/admin/coupons' },
          { name: t('dashboard.sidebar.reviews'), icon: <MessageSquare size={18} />, path: '/dashboard/admin/reviews' },
          { name: t('dashboard.sidebar.ads'), icon: <Monitor size={18} />, path: '/dashboard/admin/ads' },
          { name: lang === 'ar' ? 'العمولات' : 'Commissions', icon: <DollarSign size={18} />, path: '/dashboard/admin/commissions' },
          { name: t('dashboard.sidebar.payouts'), icon: <DollarSign size={18} />, path: '/dashboard/admin/payouts' },
          { name: t('dashboard.sidebar.audit_logs'), icon: <Shield size={18} />, path: '/dashboard/admin/audit-logs' },
        ]
      });
    }

    return menu;
  };

  const menuItems = getMenuItems();

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

          <nav className="flex-grow px-4 space-y-8 overflow-y-auto custom-scrollbar pb-8 overflow-x-hidden">
            {menuItems.map((section: any) => (
              <div key={section.section} className={`space-y-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/50 mb-4">
                  {section.section}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item: any) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link 
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${isActive ? 'bg-primary text-black shadow-glow-primary' : 'text-text-muted hover:text-primary hover:bg-primary/5'}`}
                      >
                        <div className={`${isActive ? 'text-black' : 'text-primary'} transition-colors shrink-0`}>
                          {item.icon}
                        </div>
                        <span className="font-bold uppercase text-[10px] tracking-widest flex-grow">{item.name}</span>
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
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={20} />
              <span className="font-bold uppercase text-[10px] tracking-widest flex-grow text-start">
                {t('dashboard.sidebar.logout')}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className={`h-20 bg-surface/50 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-40 shrink-0 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex items-center gap-4 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-background rounded-lg">
              <Menu size={24} />
            </button>

            <div className={`hidden md:flex items-center gap-4 bg-background border border-border px-4 py-2 rounded-xl w-96 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <Search size={18} className="text-text-muted" />
              <input 
                type="text" 
                placeholder={t('dashboard.topbar.search_placeholder')} 
                className={`bg-transparent outline-none text-sm w-full font-bold placeholder:text-text-muted/50 ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
              />
            </div>
          </div>

          <div className={`flex items-center gap-4 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Translation Button */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl hover:border-primary transition-all text-xs font-bold uppercase tracking-widest group"
            >
              <Languages size={18} className="text-primary group-hover:rotate-180 transition-transform duration-500" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <NotificationBell />
            <div className={`flex items-center gap-3 ${lang === 'ar' ? 'mr-2 flex-row-reverse' : 'ml-2 flex-row'}`}>
              <div className={`${lang === 'ar' ? 'text-right' : 'text-left'} hidden sm:block`}>
                <div className="text-sm font-bold">{user?.name}</div>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest opacity-70">
                  {t('dashboard.topbar.access_role')} {user?.role}
                </div>
              </div>
              <div className="w-10 h-10 bg-primary/20 border border-primary/50 rounded-xl flex items-center justify-center text-primary font-black shadow-glow-primary/20">
                {user?.name?.substring(0, 2).toUpperCase() || 'M'}
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

export default AdminLayout;
