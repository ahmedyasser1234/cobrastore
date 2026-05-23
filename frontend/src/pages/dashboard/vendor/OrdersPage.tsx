import React, { useState, useEffect } from 'react';
import { Package, Search, Loader2, Download } from 'lucide-react';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';

const VendorOrdersPage: React.FC = () => {
  const { t, lang } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorId, setVendorId] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/vendors/profile/me');
      setVendorId(profileRes.data.id);
      
      const res = await api.get('/orders/vendor/me');
      setOrders(res.data);
    } catch (err: any) {
      console.error(err);
      const status = err.response?.status;
      if (status === 404) {
        toast.error(lang === 'ar' ? 'بيانات البائع غير موجودة (404)' : 'Vendor profile not found (404)');
      } else {
        toast.error(lang === 'ar' ? 'فشل تحميل الطلبات' : 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(lang === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated');
      fetchOrders();
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || (lang === 'ar' ? `فشل في تحديث الحالة (${status || 'Unknown'})` : `Failed to update status (${status || 'Unknown'})`);
      toast.error(msg);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {lang === 'ar' ? 'إدارة الطلبات' : 'Orders Management'}
        </h1>
        <Button 
          onClick={() => {
            const headers = ['Order ID', 'Date', 'Status', 'Total (EGP)'];
            const rows = orders.map(o => {
              const vendorItems = o.items?.filter((i: any) => i.vendorId === vendorId) || [];
              const subtotal = vendorItems.reduce((sum: number, item: any) => sum + (Number(item.unitPrice) * item.quantity), 0);
              return `${o.id},${new Date(o.createdAt).toLocaleString()},${o.status},${subtotal}`;
            });
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
          }} 
          className="h-10 px-4 text-xs uppercase font-black tracking-widest bg-slate-800 hover:bg-slate-700"
        >
          <Download size={16} className={lang === 'ar' ? 'ml-2' : 'mr-2'} />
          {lang === 'ar' ? 'تصدير الطلبات CSV' : 'Export Orders CSV'}
        </Button>
      </div>

      <div className="glass p-6 rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl flex-1">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder={lang === 'ar' ? 'ابحث عن طلب...' : 'Search orders by ID...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`bg-transparent outline-none text-sm w-full font-bold ${lang === 'ar' ? 'text-right pr-2' : 'text-left pl-2'}`}
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
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'الإجمالي (لمنتجاتك)' : 'Subtotal (Your Items)'}</th>
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const vendorItems = order.items?.filter((item: any) => item.vendorId === vendorId) || [];
                  const subtotal = vendorItems.reduce((sum: number, item: any) => sum + (Number(item.unitPrice) * item.quantity), 0);
                  
                  return (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                      <td className="py-4 px-4 font-bold font-mono">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 text-[11px] text-text-muted">
                        {new Date(order.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                      <td className="py-4 px-4 font-black text-primary">
                        {subtotal.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
                      </td>
                      <td className="py-4 px-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`bg-background border border-border rounded-lg px-2 py-1 text-xs font-bold uppercase outline-none ${
                            order.status === 'delivered' ? 'text-green-500' :
                            order.status === 'shipped' ? 'text-blue-500' :
                            order.status === 'processing' ? 'text-yellow-500' :
                            'text-text-muted'
                          }`}
                        >
                          <option value="draft">{lang === 'ar' ? 'مسودة' : 'Draft'}</option>
                          <option value="pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                          <option value="paid">{lang === 'ar' ? 'مدفوع' : 'Paid'}</option>
                          <option value="processing">{lang === 'ar' ? 'قيد المعالجة' : 'Processing'}</option>
                          <option value="shipped">{lang === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                          <option value="delivered">{lang === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                          <option value="cancelled">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                          <option value="refunded">{lang === 'ar' ? 'مسترجع' : 'Refunded'}</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-muted text-xs uppercase tracking-widest font-bold">
                      {lang === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
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

export default VendorOrdersPage;
