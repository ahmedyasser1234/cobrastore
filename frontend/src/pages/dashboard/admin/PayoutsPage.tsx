import React, { useState, useEffect } from 'react';
import { 
  DollarSign, CheckCircle, ArrowUpRight, 
  Loader2, Store, CreditCard, Calendar
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';

const PayoutsPage: React.FC = () => {
  const { t, lang, dir } = useTranslation();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payouts');
      setPayouts(res.data);
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'paid' | 'rejected') => {
    try {
      await api.patch(`/admin/payouts/${id}/status`, { status });
      toast.success(status === 'paid' ? t('dashboard.payouts.msg_paid_success') : t('dashboard.payouts.msg_rejected_success'));
      fetchPayouts();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(lang === 'ar' ? 'فشلت العملية' : 'Operation failed');
    }
  };

  const textAlignment = lang === 'ar' ? 'text-right' : 'text-left';

  // Calculate total paid and pending payouts
  const totalPaid = payouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      <div className={textAlignment}>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {t('dashboard.payouts.title')}
        </h2>
        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">
          {t('dashboard.payouts.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border-border/50">
          <div className={`flex items-center gap-3 mb-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <DollarSign size={16} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">
              {t('dashboard.payouts.total_paid')}
            </span>
          </div>
          <div className={`text-2xl font-black tracking-tighter ${textAlignment}`}>
            {totalPaid} {t('dashboard.overview.currency')}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="glass rounded-2xl border-border/50 overflow-hidden shadow-glow-primary/5">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-background/40">
                  <th className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted ${textAlignment}`}>
                    {t('dashboard.payouts.table_store')}
                  </th>
                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted text-center">
                    {t('dashboard.payouts.table_amount')}
                  </th>
                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted text-center">
                    {t('dashboard.payouts.table_status')}
                  </th>
                  <th className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                    {t('dashboard.payouts.table_actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="group hover:bg-primary/5 transition-all">
                    <td className="px-5 py-4">
                      <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary flex-shrink-0">
                          <Store size={18} />
                        </div>
                        <div className={textAlignment}>
                          <div className="text-xs font-black uppercase tracking-tight">
                            {payout.vendor?.storeName}
                          </div>
                          <div className={`text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                            <span>{new Date(payout.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                            <Calendar size={10} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="text-sm font-black tracking-tighter text-primary">
                        {payout.amount} {t('dashboard.overview.currency')}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          payout.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                          payout.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                          'bg-red-500/10 text-red-500 border-red-500/30'
                        }`}>
                          <div className={`w-1 h-1 rounded-full ${payout.status === 'paid' ? 'bg-green-500' : payout.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          {payout.status === 'pending' ? t('dashboard.payouts.status_pending') : 
                           payout.status === 'paid' ? t('dashboard.payouts.status_paid') : 
                           t('dashboard.payouts.status_rejected')}
                        </span>
                      </div>
                    </td>
                    <td className={`px-5 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                      {payout.status === 'pending' && (
                        <div className={`flex items-center gap-2 ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
                          <button 
                            onClick={() => handleStatusUpdate(payout.id, 'paid')}
                            className="p-2 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 hover:bg-green-500 hover:text-black transition-all"
                            title={t('dashboard.payouts.action_confirm')}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(payout.id, 'rejected')}
                            className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-black transition-all"
                            title={t('dashboard.payouts.action_reject')}
                          >
                            <ArrowUpRight size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {payouts.length === 0 && (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto border border-border opacity-30 shadow-inner">
                <CreditCard size={28} />
              </div>
              <div className="space-y-1">
                <div className="text-lg font-black uppercase tracking-tighter text-glow-primary">
                  {t('dashboard.payouts.empty_title')}
                </div>
                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">
                  {t('dashboard.payouts.empty_subtitle')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayoutsPage;
