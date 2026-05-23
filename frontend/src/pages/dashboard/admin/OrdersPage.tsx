import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, Loader2, 
  ArrowUpRight, Eye, CheckCircle, XCircle, 
  Clock, Package, Truck, CreditCard, ChevronRight
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { t, lang, dir } = useTranslation();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders', { params: { search } });
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      toast.success(lang === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated');
      fetchOrders();
    } catch (error) {
      // toast handled by api interceptor
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      {/* Header Area */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${lang === 'ar' ? '' : 'md:flex-row-reverse'}`}>
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">{lang === 'ar' ? 'الطلبات' : 'Orders'}</h2>
          <p className={`text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
            {lang === 'ar' ? 'مراقبة جميع عمليات الشراء في النظام اللحظي' : 'Monitor all purchases in real-time'}
          </p>
        </div>
        <div className={`flex items-center gap-3 bg-background border border-border px-4 py-2 rounded-xl w-full md:w-80 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <Search size={16} className="text-text-muted shrink-0" />
          <input 
            type="text" 
            placeholder={lang === 'ar' ? 'بحث برقم الطلب أو اسم العميل...' : 'Search by order ID or customer...'} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`bg-transparent outline-none text-xs w-full font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="glass rounded-[24px] border-border/50 overflow-hidden shadow-glow-primary/5">
          <table className={`w-full border-collapse ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="border-b border-border/50 bg-background/40">
                <th className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'الطلب والعميل' : 'Order & Customer'}</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">{lang === 'ar' ? 'القيمة' : 'Amount'}</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{lang === 'ar' ? 'التحكم' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {orders.map((order) => (
                <tr key={order.id} className="group hover:bg-primary/5 transition-all">
                  <td className="px-4 py-4">
                    <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-glow-primary/5 shrink-0">
                        <ShoppingBag size={16} />
                      </div>
                      <div className={`space-y-0.5 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        <div className="text-sm font-bold uppercase tracking-tight">#{order.id.slice(-6).toUpperCase()}</div>
                        <div className={`text-[9px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1.5 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                          {order.user?.name || order.customer?.name || (lang === 'ar' ? 'زائر' : 'Guest')}
                          <div className="w-1 h-1 rounded-full bg-border" />
                          {new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="text-sm font-bold tracking-tighter text-primary">{order.total} {lang === 'ar' ? 'ج.م' : 'EGP'}</div>
                      <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">{order.itemsCount} {lang === 'ar' ? 'قطع' : 'Items'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                        order.status === 'processing' ? 'bg-primary/10 text-primary border-primary/30' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                      }`}>
                        <Clock size={10} />
                        {order.status === 'pending' ? (lang === 'ar' ? 'في الانتظار' : 'Pending') : order.status === 'processing' ? (lang === 'ar' ? 'قيد التنفيذ' : 'Processing') : (lang === 'ar' ? 'تم التسليم' : 'Delivered')}
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                    <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
                      <button className="p-2 hover:bg-primary/10 rounded-xl text-primary border border-primary/20 transition-all group/btn">
                        <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button onClick={() => updateStatus(order.id, 'processing')} className="p-2 hover:bg-green-500/10 rounded-xl text-green-500 border border-green-500/20 transition-all group/btn">
                        <CheckCircle size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto border border-border shadow-inner">
                <Package size={20} className="text-text-muted opacity-30" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-black uppercase tracking-tighter">{lang === 'ar' ? 'قاعدة البيانات فارغة' : 'Database Empty'}</div>
                <div className="text-[9px] text-text-muted font-black uppercase tracking-widest">{lang === 'ar' ? 'لا توجد طلبات مسجلة حالياً تتوافق مع معايير البحث' : 'No orders found matching your search criteria'}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
