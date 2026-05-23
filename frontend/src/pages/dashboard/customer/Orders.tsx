import React, { useState, useEffect } from 'react';
import { Package, Search, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';

const CustomerOrders: React.FC = () => {
  const { lang } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err: any) {
      console.error(err);
      toast.error(lang === 'ar' ? 'فشل تحميل الطلبات' : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {lang === 'ar' ? 'سجل الطلبات' : 'Order History'}
        </h1>
      </div>

      <div className="glass p-6 rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl flex-1">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder={lang === 'ar' ? 'ابحث برقم الطلب...' : 'Search by order ID...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`bg-transparent outline-none text-sm w-full font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="border-b border-border text-text-muted uppercase tracking-widest text-[10px]">
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                    <td className="py-4 px-4 font-bold font-mono">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-4 text-[11px] text-text-muted">
                      {new Date(order.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="py-4 px-4 font-black text-primary">
                      {Number(order.totalAmount).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-text-muted/20 text-text-muted'
                      }`}>
                        {lang === 'ar' ? (
                          order.status === 'delivered' ? 'تم التوصيل' :
                          order.status === 'shipped' ? 'تم الشحن' :
                          order.status === 'processing' ? 'قيد المعالجة' :
                          order.status === 'paid' ? 'مدفوع' : order.status
                        ) : order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-muted text-xs uppercase tracking-widest font-bold">
                      {lang === 'ar' ? 'لا توجد طلبات سابقة' : 'No previous orders found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
