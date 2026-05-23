import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Loader2, CreditCard } from 'lucide-react';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';

const VendorPayoutsPage: React.FC = () => {
  const { t, lang } = useTranslation();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    paidOut: 0,
    pending: 0
  });
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      
      const [payoutsRes, ordersRes, profileRes] = await Promise.all([
        api.get('/vendors/payouts/me'),
        api.get('/orders/vendor/me'),
        api.get('/vendors/profile/me')
      ]);

      const vendor = profileRes.data;
      const vendorOrders = ordersRes.data || [];
      
      let totalEarned = 0;
      vendorOrders.forEach((order: any) => {
        const vendorItems = order.items?.filter((item: any) => item.vendorId === vendor.id) || [];
        const orderSubtotal = vendorItems.reduce((sum: number, item: any) => sum + (Number(item.unitPrice) * item.quantity), 0);
        const commission = vendor.commissionPercentage ? Number(vendor.commissionPercentage) / 100 : 0.10;
        totalEarned += orderSubtotal * (1 - commission);
      });

      const payoutsList = payoutsRes.data || [];
      setPayouts(payoutsList);

      const paid = payoutsList
        .filter((p: any) => p.status === 'completed')
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      setStats({
        totalEarnings: totalEarned,
        paidOut: paid,
        pending: totalEarned - paid > 0 ? totalEarned - paid : 0
      });
    } catch (err: any) {
      console.error(err);
      const status = err.response?.status;
      if (status === 404) {
        toast.error(lang === 'ar' ? 'بيانات البائع غير موجودة (404)' : 'Vendor profile not found (404)');
      } else {
        toast.error(lang === 'ar' ? 'فشل تحميل المدفوعات' : 'Failed to load payouts');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (stats.pending <= 0) return;
    try {
      setRequesting(true);
      await api.post('/vendors/payouts/request', { amount: stats.pending });
      toast.success(lang === 'ar' ? 'تم تقديم طلب السحب بنجاح' : 'Payout requested successfully');
      fetchPayouts();
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || (lang === 'ar' ? `فشل الطلب (${status || 'Unknown'})` : `Request failed (${status || 'Unknown'})`);
      toast.error(msg);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {lang === 'ar' ? 'الأرباح والمدفوعات' : 'Earnings & Payouts'}
        </h1>
        {stats.pending > 0 && (
          <button 
            onClick={handleRequestPayout} 
            disabled={requesting}
            className="btn-primary h-10 px-6 text-xs whitespace-nowrap"
          >
            {requesting ? <Loader2 className="animate-spin" size={16} /> : <DollarSign size={16} />}
            {lang === 'ar' ? 'طلب سحب رصيد' : 'Request Payout'}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="p-3 w-fit rounded-xl bg-primary/10 border border-primary/20 text-primary mb-4">
            <DollarSign size={20} />
          </div>
          <div className="text-2xl font-black mb-1">
            {stats.totalEarnings.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
          </div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {lang === 'ar' ? 'إجمالي الأرباح' : 'Total Revenue'}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/40 transition-all">
          <div className="p-3 w-fit rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 mb-4">
            <CreditCard size={20} />
          </div>
          <div className="text-2xl font-black mb-1">
            {stats.paidOut.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
          </div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {lang === 'ar' ? 'تم تحويلها' : 'Paid Out'}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/40 transition-all">
          <div className="p-3 w-fit rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 mb-4">
            <FileText size={20} />
          </div>
          <div className="text-2xl font-black mb-1">
            {stats.pending.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
          </div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {lang === 'ar' ? 'رصيد معلق' : 'Pending Balance'}
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl">
        <h3 className={`text-sm font-black uppercase tracking-widest mb-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          {lang === 'ar' ? 'سجل المدفوعات' : 'Payout History'}
        </h3>

        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="border-b border-border text-text-muted uppercase tracking-widest text-[10px]">
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'طريقة الدفع' : 'Method'}</th>
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(payout => (
                  <tr key={payout.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-[11px] text-text-muted">
                      {new Date(payout.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="py-4 px-4 font-black text-primary">
                      {Number(payout.amount).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
                    </td>
                    <td className="py-4 px-4 font-bold uppercase text-[10px]">
                      {payout.method || 'Bank Transfer'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        payout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        payout.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-text-muted">
                      {payout.notes || '-'}
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted text-xs uppercase tracking-widest font-bold">
                      {lang === 'ar' ? 'لا يوجد سجل مدفوعات' : 'No payout history'}
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

export default VendorPayoutsPage;
