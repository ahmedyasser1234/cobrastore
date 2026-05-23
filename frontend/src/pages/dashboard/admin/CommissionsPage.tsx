import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Store, Loader2, Calendar, ShoppingBag
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';

const CommissionsPage: React.FC = () => {
  const { t, lang, dir } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAdminCommissions: 0,
    totalVendorEarnings: 0
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      // Calculate derived stats directly from orders
      let totalSales = 0;
      let totalAdminCommissions = 0;
      let totalVendorEarnings = 0;

      const completedOrders = res.data.filter((o: any) => o.status !== 'draft' && o.status !== 'cancelled');

      completedOrders.forEach((order: any) => {
        totalSales += Number(order.total) || 0;
        if (order.items && order.items.length > 0) {
          order.items.forEach((item: any) => {
            totalAdminCommissions += Number(item.adminCommission) || 0;
            totalVendorEarnings += Number(item.vendorEarnings) || 0;
          });
        }
      });

      setStats({
        totalSales,
        totalAdminCommissions,
        totalVendorEarnings
      });

      setOrders(completedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error(lang === 'ar' ? 'فشل تحميل العمولات' : 'Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const textAlignment = lang === 'ar' ? 'text-right' : 'text-left';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      <div className={textAlignment}>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {lang === 'ar' ? 'العمولات والأرباح' : 'Commissions & Earnings'}
        </h2>
        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">
          {lang === 'ar' ? 'نظرة عامة على أرباح المنصة من عمولات المتاجر' : 'Overview of platform earnings from vendor commissions'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Sales */}
        <div className="glass p-6 rounded-3xl border-border/50 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
          <div className={`flex items-center justify-between mb-4 relative z-10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-black uppercase tracking-widest text-text-muted">
              {lang === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}
            </span>
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className={`text-3xl font-black tracking-tighter relative z-10 ${textAlignment}`}>
            {stats.totalSales.toFixed(2)} {t('dashboard.overview.currency')}
          </div>
        </div>

        {/* Admin Commissions */}
        <div className="glass p-6 rounded-3xl border-orange-500/20 shadow-glow-orange/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors" />
          <div className={`flex items-center justify-between mb-4 relative z-10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-black uppercase tracking-widest text-orange-500">
              {lang === 'ar' ? 'أرباح المنصة (العمولة)' : 'Platform Earnings'}
            </span>
            <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-500">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className={`text-3xl font-black tracking-tighter text-orange-500 relative z-10 ${textAlignment}`}>
            {stats.totalAdminCommissions.toFixed(2)} {t('dashboard.overview.currency')}
          </div>
        </div>

        {/* Vendor Earnings */}
        <div className="glass p-6 rounded-3xl border-border/50 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          <div className={`flex items-center justify-between mb-4 relative z-10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-black uppercase tracking-widest text-text-muted">
              {lang === 'ar' ? 'مستحقات المتاجر' : 'Vendor Earnings'}
            </span>
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Store size={20} />
            </div>
          </div>
          <div className={`text-3xl font-black tracking-tighter relative z-10 ${textAlignment}`}>
            {stats.totalVendorEarnings.toFixed(2)} {t('dashboard.overview.currency')}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="glass rounded-[32px] border-border/50 overflow-hidden shadow-xl">
          <div className={`px-8 py-6 border-b border-border/50 ${textAlignment}`}>
            <h3 className="text-lg font-black uppercase tracking-tighter">
              {lang === 'ar' ? 'سجل العمولات الأخير' : 'Recent Commission History'}
            </h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
            <table className="w-full text-right border-collapse relative">
              <thead className="sticky top-0 z-20 bg-background/90 backdrop-blur-md shadow-sm">
                <tr className="border-b border-border/50">
                  <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted ${textAlignment}`}>
                    {lang === 'ar' ? 'الطلب' : 'Order'}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">
                    {lang === 'ar' ? 'إجمالي الطلب' : 'Order Total'}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-orange-500 text-center">
                    {lang === 'ar' ? 'عمولة المنصة' : 'Platform Commission'}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">
                    {lang === 'ar' ? 'مستحقات التاجر' : 'Vendor Earning'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {orders.map((order) => {
                  let orderAdminComm = 0;
                  let orderVendorEarn = 0;
                  if (order.items) {
                    order.items.forEach((item: any) => {
                      orderAdminComm += Number(item.adminCommission) || 0;
                      orderVendorEarn += Number(item.vendorEarnings) || 0;
                    });
                  }

                  return (
                    <tr key={order.id} className="group hover:bg-primary/5 transition-all">
                      <td className="px-8 py-5">
                        <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary flex-shrink-0">
                            <ShoppingBag size={18} />
                          </div>
                          <div className={textAlignment}>
                            <div className="text-xs font-black uppercase tracking-tight">
                              #{order.id.split('-')[0]}
                            </div>
                            <div className={`text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                              <span>{new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                              <Calendar size={10} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="text-sm font-black tracking-tighter">
                          {Number(order.total).toFixed(2)} {t('dashboard.overview.currency')}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="text-sm font-black tracking-tighter text-orange-500 bg-orange-500/10 inline-block px-3 py-1 rounded-lg">
                          + {orderAdminComm.toFixed(2)} {t('dashboard.overview.currency')}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="text-sm font-black tracking-tighter text-slate-500">
                          {orderVendorEarn.toFixed(2)} {t('dashboard.overview.currency')}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto border border-border opacity-30 shadow-inner">
                  <DollarSign size={28} />
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-black uppercase tracking-tighter text-glow-primary">
                    {lang === 'ar' ? 'لا توجد عمولات بعد' : 'No Commissions Yet'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionsPage;
