import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, Store as StoreIcon, ShoppingBag as BagIcon, DollarSign as DollarIcon, 
  ArrowUpRight as UpIcon, ArrowDownRight as DownIcon, Activity as ActivityIcon, 
  Calendar as CalendarIcon, TrendingUp as TrendingIcon, Zap as ZapIcon, Loader2 as LoaderIcon
} from 'lucide-react';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';

const Overview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, lang, dir } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, revenueRes, ordersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/revenue/monthly'),
          api.get('/admin/orders')
        ]);
        setStats(statsRes.data);
        setRevenueData(revenueRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoaderIcon className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const statCards = [
    { 
      name: t('dashboard.overview.total_sales'), 
      value: `${stats?.totalSales || 0} ${t('dashboard.overview.currency')}`, 
      icon: <DollarIcon size={24} strokeWidth={1.5} />, 
      trend: stats?.trends?.sales || '0%', 
      trendUp: !stats?.trends?.sales?.startsWith('-'),
      color: 'primary' 
    },
    { 
      name: t('dashboard.overview.total_users'), 
      value: stats?.totalUsers || 0, 
      icon: <UsersIcon size={24} strokeWidth={1.5} />, 
      trend: stats?.trends?.users || '0%', 
      trendUp: !stats?.trends?.users?.startsWith('-'),
      color: 'secondary' 
    },
    { 
      name: t('dashboard.overview.total_orders'), 
      value: stats?.totalOrders || 0, 
      icon: <BagIcon size={24} strokeWidth={1.5} />, 
      trend: stats?.trends?.orders || '0%', 
      trendUp: !stats?.trends?.orders?.startsWith('-'),
      color: 'primary' 
    },
    { 
      name: t('dashboard.overview.active_vendors'), 
      value: stats?.totalVendors || 0, 
      icon: <StoreIcon size={24} strokeWidth={1.5} />, 
      trend: stats?.trends?.vendors || '0%', 
      trendUp: !stats?.trends?.vendors?.startsWith('-'),
      color: 'secondary' 
    },
  ];

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const ago = t('dashboard.overview.time.ago');
    
    let interval = seconds / 31536000;
    if (interval > 1) return `${ago} ${t('dashboard.overview.time.year')}`;
    interval = seconds / 2592000;
    if (interval > 1) return `${ago} ${t('dashboard.overview.time.month')}`;
    interval = seconds / 86400;
    if (interval > 1) return `${ago} ${Math.floor(interval)} ${t('dashboard.overview.time.days')}`;
    interval = seconds / 3600;
    if (interval > 1) return `${ago} ${Math.floor(interval)} ${t('dashboard.overview.time.hours')}`;
    interval = seconds / 60;
    if (interval > 1) return `${ago} ${Math.floor(interval)} ${t('dashboard.overview.time.minutes')}`;
    return t('dashboard.overview.time.now');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      {/* Welcome Section */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${lang === 'ar' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-glow-primary">{t('dashboard.overview.title')}</h2>
          <p className={`text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
            {t('dashboard.overview.last_update')}: {new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US')}
            <ActivityIcon size={12} className="text-primary animate-pulse" />
          </p>
        </div>
        <div className={`flex items-center gap-2.5 bg-surface border border-border px-5 py-2.5 rounded-xl self-end md:self-auto ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <CalendarIcon size={16} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[24px] border-border/50 group hover:border-primary/30 transition-all shadow-sm relative overflow-hidden">
            <div className={`flex justify-between items-start mb-4 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="text-primary/70 group-hover:text-primary transition-colors group-hover:scale-110 transition-transform duration-500">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${stat.trendUp ? 'text-green-500' : 'text-red-500'} ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                {stat.trendUp ? <UpIcon size={10} /> : <DownIcon size={10} />}
                {stat.trend}
              </div>
            </div>
            <div className={`space-y-0.5 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="text-2xl font-black tracking-tighter">{stat.value}</div>
              <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">{stat.name}</div>
            </div>
            
            {/* Subtle Identity Accent */}
            <div className={`absolute -bottom-2 ${lang === 'ar' ? '-right-2' : '-left-2'} w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all`} />
          </div>
        ))}
      </div>

      {/* Main Analysis Section */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        <div className="lg:col-span-2 glass rounded-[32px] p-8 border-border/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className={lang === 'ar' ? 'text-right w-full' : 'text-left w-full'}>
              <h3 className="text-xl font-black uppercase tracking-tight">{t('dashboard.overview.system_pulse')}</h3>
              <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">{t('dashboard.overview.system_pulse_desc')}</p>
            </div>
          </div>
          
          <div className="h-48 w-full bg-background/30 rounded-2xl border border-border/50 flex items-center justify-center relative group">
             {revenueData.length > 0 ? (
               <>
                 <div className="absolute inset-0 flex items-end justify-around px-8 pb-3">
                    {revenueData.map((item, i) => {
                      const val = (item.revenue / (stats?.totalSales || 1) * 100);
                      return (
                        <div key={i} className="w-6 bg-primary/20 group-hover:bg-primary/40 transition-all rounded-t-md" style={{ height: `${Math.max(val, 10)}%` }}>
                          <div className="w-full h-1 bg-primary shadow-glow-primary rounded-full" />
                        </div>
                      );
                    })}
                 </div>
                 <div className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-4 bg-background/80 px-3 py-1.5 rounded-full border border-border flex items-center gap-1.5 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{t('dashboard.overview.realtime_analysis')}</span>
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                 </div>
               </>
             ) : (
               <div className="text-center space-y-3 opacity-30">
                  <TrendingIcon size={32} className="mx-auto" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-black uppercase tracking-widest">{t('dashboard.overview.empty_sales_title')}</p>
                    <p className="text-[9px] font-bold">{t('dashboard.overview.empty_sales_desc')}</p>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="glass rounded-[32px] p-8 border-border/50">
           <div className={`mb-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl font-black uppercase tracking-tight">{t('dashboard.overview.recent_activity')}</h3>
              <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">{t('dashboard.overview.recent_activity_desc')}</p>
           </div>
           
           <div className="space-y-4">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order.id} className={`flex items-center gap-3 group ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary group-hover:border-primary/50 transition-all">
                    <ZapIcon size={14} />
                  </div>
                  <div className={`flex-grow ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    <div className="text-[11px] font-black uppercase">{t('dashboard.overview.new_order')} #{order.id.toString().substring(0, 8)}</div>
                    <div className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{getTimeAgo(order.createdAt)}</div>
                  </div>
                  <div className="text-[9px] font-black text-green-500 whitespace-nowrap">+{order.total} {t('dashboard.overview.currency')}</div>
                </div>
              )) : (
                <div className="text-center py-6 opacity-30">
                  <BagIcon size={24} className="mx-auto mb-1" />
                  <p className="text-[9px] font-black uppercase">{t('dashboard.overview.empty_activity')}</p>
                </div>
              )}
           </div>

           <button className="w-full mt-8 py-3 bg-background border border-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
              {t('dashboard.overview.view_full_logs')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
