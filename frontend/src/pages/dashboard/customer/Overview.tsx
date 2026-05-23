import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Bell, Box, ChevronRight, User, Loader2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuthStore } from '../../../store/useAuthStore';
import { Link } from 'react-router-dom';

const CustomerOverview: React.FC = () => {
  const { lang } = useTranslation();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState('bronze');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, addressesRes, wishlistRes, profileRes] = await Promise.all([
          api.get('/orders'),
          api.get('/addresses'),
          api.get('/wishlist'),
          api.get('/users/me')
        ]);
        setOrders(ordersRes.data);
        setAddresses(addressesRes.data);
        setWishlistCount(wishlistRes.data.length);
        setPoints(profileRes.data.points || 0);
        setTier(profileRes.data.tier || 'bronze');
        setReferralCode(profileRes.data.referralCode || '');
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recentOrders = orders.slice(0, 3);
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-40">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center text-black shadow-glow-primary">
            <User size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
              {user?.name || (lang === 'ar' ? 'عميل كوكرا' : 'Cobra Citizen')}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-text-muted text-sm font-bold uppercase tracking-widest">
                {lang === 'ar' ? 'النقاط:' : 'Points:'} <span className="text-primary">{points}</span>
              </p>
              <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
                tier === 'bronze' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                tier === 'silver' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                tier === 'gold' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                'bg-primary/10 text-primary border-primary/20'
              }`}>
                {tier === 'bronze' ? 'Bronze ★' : tier === 'silver' ? 'Silver ★★' : tier === 'gold' ? 'Gold ★★★' : 'Platinum ★★★★'}
              </div>
            </div>
            {tier !== 'platinum' && (
              <div className="mt-3 max-w-[200px]">
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-primary shadow-glow-primary transition-all duration-1000" style={{ width: `${tier === 'bronze' ? Math.min((totalSpent/500)*100, 100) : tier === 'silver' ? Math.min(((totalSpent-500)/1500)*100, 100) : Math.min(((totalSpent-2000)/3000)*100, 100)}%` }} />
                </div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  {lang === 'ar' ? `يتبقى ${tier === 'bronze' ? 500 - totalSpent : tier === 'silver' ? 1500 - totalSpent : 3000 - totalSpent} نقطة لـ ${tier === 'bronze' ? 'silver' : tier === 'silver' ? 'gold' : 'platinum'}` : `${tier === 'bronze' ? 500 - totalSpent : tier === 'silver' ? 1500 - totalSpent : 3000 - totalSpent} pts to ${tier === 'bronze' ? 'silver' : tier === 'silver' ? 'gold' : 'platinum'}`}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface border border-border px-6 py-3 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
              {lang === 'ar' ? 'إجمالي المشتريات' : 'Total Spent'}
            </span>
            <span className="text-xl font-black text-primary">
              {totalSpent.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
            </span>
          </div>
          <div className="bg-surface border border-border px-6 py-3 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
              {lang === 'ar' ? 'كود الإحالة' : 'Referral Code'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-black text-green-500">{referralCode}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(referralCode);
                  import('react-hot-toast').then(m => m.default.success(lang === 'ar' ? 'تم النسخ' : 'Copied!'));
                }}
                className="text-text-muted hover:text-primary transition-colors"
                title={lang === 'ar' ? 'نسخ' : 'Copy'}
              >
                <Box size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-surface border border-border rounded-[40px] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-xl font-black uppercase tracking-tighter italic ${lang === 'ar' ? 'border-r-4 pr-4' : 'border-l-4 pl-4'} border-primary`}>
              {lang === 'ar' ? 'أحدث الطلبات' : 'Recent Shipments'}
            </h3>
            <Link to="/dashboard/customer/orders" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
              {lang === 'ar' ? 'عرض الكل' : 'View All'}
            </Link>
          </div>
          
          <div className="space-y-6">
            {recentOrders.map((order) => {
              const progress = order.status === 'delivered' ? 100 : order.status === 'shipped' ? 60 : 30;
              return (
                <div key={order.id} className="p-6 bg-background border border-border rounded-3xl group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold">
                        {order.items?.length ? `${order.items[0].productName} ${order.items.length > 1 ? `+${order.items.length - 1}` : ''}` : 'Order'}
                      </div>
                      <div className="text-[10px] text-text-muted font-bold font-mono">#{order.id.substring(0, 8).toUpperCase()}</div>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-tighter">
                      {lang === 'ar' ? (
                        order.status === 'delivered' ? 'تم التوصيل' :
                        order.status === 'shipped' ? 'تم الشحن' :
                        order.status === 'processing' ? 'قيد المعالجة' :
                        order.status === 'paid' ? 'مدفوع' : order.status
                      ) : order.status}
                    </div>
                  </div>
                  <div className="w-full h-1 bg-surface rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-primary shadow-glow-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-bold text-text-muted tracking-widest">
                    <span>{lang === 'ar' ? 'تم الطلب' : 'Ordered'}</span>
                    <span>{lang === 'ar' ? 'قيد التوصيل' : 'Delivery'}</span>
                  </div>
                </div>
              );
            })}
            {recentOrders.length === 0 && (
              <div className="text-center text-text-muted text-sm font-bold p-10">
                {lang === 'ar' ? 'لا توجد طلبات حديثة' : 'No recent orders'}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Wishlist */}
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <Link to="/dashboard/customer/wishlist" className="flex flex-col items-center justify-center gap-3 p-8 bg-surface border border-border/30 rounded-3xl hover:border-primary group transition-all relative">
              <div className="p-4 bg-background border border-border rounded-2xl text-text-muted group-hover:text-primary group-hover:scale-110 transition-all">
                <Heart size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">
                {lang === 'ar' ? 'المفضلة' : 'My Wishlist'}
              </span>
              {wishlistCount > 0 && (
                <span className="absolute top-4 right-4 bg-primary text-black text-[10px] font-black px-2 py-1 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/dashboard/customer/settings" className="flex flex-col items-center justify-center gap-3 p-8 bg-surface border border-border/30 rounded-3xl hover:border-primary group transition-all">
              <div className="p-4 bg-background border border-border rounded-2xl text-text-muted group-hover:text-primary group-hover:scale-110 transition-all">
                <User size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
            </Link>
          </div>

          <div className="bg-surface border border-border rounded-[40px] p-8">
            <h3 className={`text-xl font-black uppercase tracking-tighter mb-8 italic ${lang === 'ar' ? 'border-r-4 pr-4' : 'border-l-4 pl-4'} border-primary`}>
              {lang === 'ar' ? 'العناوين المحفوظة' : 'Saved Addresses'}
            </h3>
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="p-5 bg-background border border-border rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-surface border border-border rounded-lg text-text-muted">
                      <Box size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2">
                        {address.title}
                        {address.isDefault && (
                          <span className="bg-primary/20 text-primary text-[9px] uppercase px-2 py-0.5 rounded-full">
                            {lang === 'ar' ? 'الأساسي' : 'Default'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-text-muted mt-1 truncate max-w-[200px]">{address.details}</div>
                    </div>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && (
                <div className="text-center text-text-muted text-xs p-4">
                  {lang === 'ar' ? 'لا توجد عناوين محفوظة' : 'No saved addresses'}
                </div>
              )}
              <Link to="/dashboard/customer/addresses" className="block w-full">
                <Button variant="secondary" className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] border-dashed border-2 hover:border-primary hover:text-primary">
                  {lang === 'ar' ? 'إدارة العناوين' : 'Manage Addresses'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;
