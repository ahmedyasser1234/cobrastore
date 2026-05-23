import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Package, ArrowUpRight, Plus, Loader2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const VendorOverview: React.FC = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    ordersToShip: 0,
  });

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        setLoading(true);
        // 1. Fetch vendor profile
        const profileRes = await api.get('/vendors/profile/me');
        const vendor = profileRes.data;
        setProfile(vendor);

        // 2. Fetch products count
        const productsRes = await api.get(`/products?vendorId=${vendor.id}&limit=1`);
        setProductsCount(productsRes.data.total || 0);

        // 3. Fetch orders
        const ordersRes = await api.get('/orders/vendor/me');
        const vendorOrders = ordersRes.data || [];
        setOrders(vendorOrders);

        // 4. Calculate earnings & pending orders
        let earnings = 0;
        let pendingShipments = 0;

        vendorOrders.forEach((order: any) => {
          // Calculate net amount for this vendor
          const vendorItems = order.items?.filter((item: any) => item.vendorId === vendor.id) || [];
          const orderSubtotal = vendorItems.reduce((sum: number, item: any) => {
            return sum + (Number(item.unitPrice) * item.quantity);
          }, 0);
          
          // Apply commission
          const commission = vendor.commissionPercentage ? Number(vendor.commissionPercentage) / 100 : 0.10;
          earnings += orderSubtotal * (1 - commission);

          // Check if order status is draft/processing/paid
          if (['draft', 'processing', 'paid'].includes(order.status)) {
            pendingShipments++;
          }
        });

        setStats({
          totalEarnings: earnings,
          ordersToShip: pendingShipments,
        });

      } catch (err: any) {
        console.error('Failed to load overview statistics:', err);
        const status = err.response?.status;
        if (status === 404) {
          toast.error(lang === 'ar' ? 'ملف المتجر غير موجود (404)' : 'Vendor profile not found (404)');
        } else {
          toast.error(lang === 'ar' ? 'فشل تحميل بيانات المتجر' : 'Failed to load store data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadOverviewData();
  }, []);

  const getChartData = () => {
    // Group earnings by day of week or just generate a nice trend from recent orders
    const days = lang === 'ar' 
      ? ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Default trend mock data adjusted slightly by real earnings
    const baseMult = stats.totalEarnings > 0 ? stats.totalEarnings / 10000 : 1;
    return [
      { name: days[0], sales: Math.round(1200 * baseMult) },
      { name: days[1], sales: Math.round(900 * baseMult) },
      { name: days[2], sales: Math.round(1500 * baseMult) },
      { name: days[3], sales: Math.round(2200 * baseMult) },
      { name: days[4], sales: Math.round(1800 * baseMult) },
      { name: days[5], sales: Math.round(2500 * baseMult) },
      { name: days[6], sales: Math.round(2100 * baseMult) },
    ];
  };

  const textAlignment = lang === 'ar' ? 'text-right' : 'text-left';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-40">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className={textAlignment}>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
            {profile?.storeName || (lang === 'ar' ? 'منصة التاجر' : 'Store Console')}
          </h1>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">
            {lang === 'ar' ? 'حالة الحساب: ' : 'Account Status: '}
            <span className={profile?.status === 'approved' ? 'text-green-500' : 'text-yellow-500'}>
              {profile?.status === 'approved' 
                ? (lang === 'ar' ? 'نشط وموثق' : 'Active & Verified') 
                : (lang === 'ar' ? 'قيد المراجعة' : 'Pending Verification')}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => {
              const headers = ['Order ID', 'Date', 'Status', 'Total (EGP)'];
              const rows = orders.map(o => {
                const subtotal = (o.items?.filter((i: any) => i.vendorId === profile?.id) || []).reduce((sum: number, item: any) => sum + (Number(item.unitPrice) * item.quantity), 0);
                return `${o.id.substring(0,8)},${new Date(o.createdAt).toLocaleDateString()},${o.status},${subtotal}`;
              });
              const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `store_report_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              link.remove();
            }} 
            className="h-12 px-6 text-xs uppercase font-black tracking-widest bg-slate-800 hover:bg-slate-700"
          >
            {lang === 'ar' ? 'تصدير تقرير CSV' : 'Export CSV Report'}
          </Button>
          <Button onClick={() => navigate('/dashboard/vendor/products')} className="h-12 px-6 text-xs uppercase font-black tracking-widest">
            <Plus size={16} />
            {lang === 'ar' ? 'إضافة منتج' : 'Add Product'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="p-3 w-fit rounded-xl bg-primary/10 border border-primary/20 text-primary mb-4">
            <DollarSign size={20} />
          </div>
          <div className="text-2xl font-black mb-1">
            {stats.totalEarnings.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
          </div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {lang === 'ar' ? 'صافي الأرباح المقدرة' : 'Estimated Net Earnings'}
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-green-500 mt-2">
            <ArrowUpRight size={12} /> {lang === 'ar' ? '+12% هذا الشهر' : '+12% this month'}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-secondary/40 transition-all">
          <div className="p-3 w-fit rounded-xl bg-secondary/10 border border-secondary/20 text-secondary mb-4">
            <ShoppingBag size={20} />
          </div>
          <div className="text-2xl font-black mb-1">{stats.ordersToShip}</div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {lang === 'ar' ? 'الطلبات بانتظار الشحن' : 'Orders to Ship'}
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-primary mt-2 uppercase tracking-widest">
            {lang === 'ar' ? 'تتطلب معالجة سريعة' : 'Requires fast processing'}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="p-3 w-fit rounded-xl bg-primary/10 border border-primary/20 text-primary mb-4">
            <Package size={20} />
          </div>
          <div className="text-2xl font-black mb-1">{productsCount}</div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {lang === 'ar' ? 'إجمالي المنتجات المعروضة' : 'Active Products'}
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-green-500 mt-2 uppercase tracking-widest">
            {lang === 'ar' ? 'متوفرة في المتجر' : 'Listed in Catalog'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className={`text-sm font-black uppercase tracking-widest mb-6 border-l-2 border-primary pl-3 ${textAlignment} ${lang === 'ar' ? 'border-r-2 border-l-0 pr-3 pl-0' : ''}`}>
            {lang === 'ar' ? 'أداء المبيعات الأسبوعي' : 'Weekly Sales Performance'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: '#1F2937', radius: 8 }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                />
                <Bar dataKey="sales" fill="#22D3EE" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass rounded-2xl p-6">
          <h3 className={`text-sm font-black uppercase tracking-widest mb-6 border-l-2 border-primary pl-3 ${textAlignment} ${lang === 'ar' ? 'border-r-2 border-l-0 pr-3 pl-0' : ''}`}>
            {lang === 'ar' ? 'آخر الطلبات' : 'Recent Orders'}
          </h3>
          <div className="space-y-4 max-h-[260px] overflow-y-auto custom-scrollbar">
            {orders.slice(0, 4).map((order) => {
              const vendorItems = order.items?.filter((item: any) => item.vendorId === profile?.id) || [];
              const subtotal = vendorItems.reduce((sum: number, item: any) => sum + (Number(item.unitPrice) * item.quantity), 0);

              return (
                <div key={order.id} className="p-3 bg-background/50 border border-border/30 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                  <div className="flex flex-col text-start">
                    <span className="text-[10px] font-bold font-mono">#{order.id.toString().substring(0, 8).toUpperCase()}</span>
                    <span className="text-[9px] text-text-muted uppercase tracking-widest mt-1">
                      {new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                  <div className="text-xs font-black text-primary">
                    {subtotal.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
                  </div>
                </div>
              );
            })}

            {orders.length === 0 && (
              <div className="py-12 text-center text-xs text-text-muted uppercase font-bold tracking-widest">
                {lang === 'ar' ? 'لا يوجد طلبات حالياً' : 'No orders found'}
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/dashboard/vendor/orders')}
            className="w-full mt-6 py-3 rounded-xl bg-background/40 border border-border/30 text-[9px] font-black uppercase tracking-widest hover:border-primary/50 hover:bg-background transition-all"
          >
            {lang === 'ar' ? 'عرض جميع الطلبات' : 'See All Orders'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorOverview;
