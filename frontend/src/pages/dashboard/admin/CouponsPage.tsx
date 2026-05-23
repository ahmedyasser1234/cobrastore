import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit3, Loader2, X, Check,
  Tag, ToggleLeft, ToggleRight, CreditCard
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';

const CouponsPage: React.FC = () => {
  const { t, lang, dir } = useTranslation();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '', discountPercent: '', maxUses: '', expiresAt: '', isActive: true
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/coupons');
      setCoupons(res.data);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        discountPercent: Number(formData.discountPercent),
        maxUses: Number(formData.maxUses),
      };
      if (editingId) {
        await api.patch(`/admin/coupons/${editingId}`, payload);
        toast.success(t('dashboard.coupons.save_success'));
      } else {
        await api.post('/admin/coupons', payload);
        toast.success(t('dashboard.coupons.create_success'));
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ code: '', discountPercent: '', maxUses: '', expiresAt: '', isActive: true });
      fetchCoupons();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشلت العملية' : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('dashboard.coupons.delete_confirm'))) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success(t('dashboard.coupons.delete_success'));
      fetchCoupons();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل الحذف' : 'Delete failed');
    }
  };

  const openEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      maxUses: coupon.maxUses || '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const textAlignment = lang === 'ar' ? 'text-right' : 'text-left';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className={textAlignment}>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
            {t('dashboard.coupons.title')}
          </h2>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">
            {t('dashboard.coupons.subtitle')}
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setFormData({ code: '', discountPercent: '', maxUses: '', expiresAt: '', isActive: true }); setIsModalOpen(true); }}
          className="btn-primary px-5 h-11 flex items-center gap-2 text-xs self-end md:self-auto"
        >
          <Plus size={16} />
          {t('dashboard.coupons.add_new')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="glass rounded-2xl border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-background/40">
                  <th className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted ${textAlignment}`}>{t('dashboard.coupons.table_code')}</th>
                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted text-center">{t('dashboard.coupons.table_discount')}</th>
                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted text-center">{t('dashboard.coupons.table_uses')}</th>
                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted text-center">{t('dashboard.coupons.table_expires')}</th>
                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted text-center">{t('dashboard.coupons.table_status')}</th>
                  <th className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{t('dashboard.coupons.table_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="group hover:bg-primary/5 transition-all">
                    <td className="px-5 py-4">
                      <div className={`flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                          <Tag size={14} />
                        </div>
                        <span className="text-xs font-black font-mono uppercase tracking-widest">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-black text-primary">{coupon.discountPercent}%</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-xs font-bold text-text-muted">{coupon.usedCount || 0} / {coupon.maxUses || '∞'}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-[10px] font-bold text-text-muted">
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${coupon.isActive ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                        <div className={`w-1 h-1 rounded-full ${coupon.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        {coupon.isActive ? t('dashboard.coupons.status_active') : t('dashboard.coupons.status_inactive')}
                      </span>
                    </td>
                    <td className={`px-5 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                      <div className={`flex items-center gap-2 ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
                        <button onClick={() => handleDelete(coupon.id)} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"><Trash2 size={14} /></button>
                        <button onClick={() => openEdit(coupon)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-all"><Edit3 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {coupons.length === 0 && (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto border border-border opacity-30">
                <CreditCard size={28} />
              </div>
              <div className="space-y-1">
                <div className="text-lg font-black uppercase tracking-tighter text-glow-primary">{t('dashboard.coupons.empty_title')}</div>
                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">{t('dashboard.coupons.empty_subtitle')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass w-full max-w-md rounded-2xl p-6 animate-in zoom-in-95 duration-300 relative border-primary/20">
            <button onClick={() => setIsModalOpen(false)} className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} text-text-muted hover:text-white transition-colors`}>
              <X size={20} />
            </button>
            <div className={`${textAlignment} mb-6`}>
              <h3 className="text-lg font-black uppercase tracking-tighter text-glow-primary">
                {editingId ? t('dashboard.coupons.edit_title') : t('dashboard.coupons.create_title')}
              </h3>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">{t('dashboard.coupons.modal_subtitle')}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest text-text-muted block ${textAlignment}`}>{t('dashboard.coupons.label_code')}</label>
                <input type="text" value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-black font-mono ${textAlignment}`}
                  placeholder="SAVE20" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-text-muted block ${textAlignment}`}>{t('dashboard.coupons.label_discount')}</label>
                  <input type="number" min="1" max="100" value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${textAlignment}`}
                    placeholder="20" required />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-text-muted block ${textAlignment}`}>{t('dashboard.coupons.label_max_uses')}</label>
                  <input type="number" min="1" value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${textAlignment}`}
                    placeholder="100" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest text-text-muted block ${textAlignment}`}>{t('dashboard.coupons.label_expires')}</label>
                <input type="date" value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${textAlignment}`} />
              </div>
              <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })} className="text-primary">
                  {formData.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-text-muted" />}
                </button>
                <span className="text-xs font-bold text-text-muted">
                  {formData.isActive ? t('dashboard.coupons.status_active') : t('dashboard.coupons.status_inactive')}
                </span>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary h-11 text-xs">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  {editingId ? t('dashboard.coupons.submit_save') : t('dashboard.coupons.submit_create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
