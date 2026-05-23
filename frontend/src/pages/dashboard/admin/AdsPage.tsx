import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit3, Loader2, X, Check,
  Monitor, ToggleLeft, ToggleRight, Image
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';

const AdsPage: React.FC = () => {
  const { t, lang, dir } = useTranslation();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', link: '', imageUrl: '', position: 'homepage', isActive: true
  });

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/ads');
      setAds(res.data);
    } catch (err) {
      console.error('Failed to fetch ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingId) {
        await api.patch(`/admin/ads/${editingId}`, formData);
        toast.success(t('dashboard.ads.save_success'));
      } else {
        await api.post('/admin/ads', formData);
        toast.success(t('dashboard.ads.create_success'));
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', link: '', imageUrl: '', position: 'homepage', isActive: true });
      fetchAds();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشلت العملية' : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('dashboard.ads.delete_confirm'))) return;
    try {
      await api.delete(`/admin/ads/${id}`);
      toast.success(t('dashboard.ads.delete_success'));
      fetchAds();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل الحذف' : 'Delete failed');
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/ads/${id}/status`, { isActive: !currentStatus });
      toast.success(!currentStatus ? t('dashboard.ads.toggle_activate') : t('dashboard.ads.toggle_deactivate'));
      fetchAds();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشلت العملية' : 'Operation failed');
    }
  };

  const openEdit = (ad: any) => {
    setEditingId(ad.id);
    setFormData({
      title: ad.title,
      link: ad.link || '',
      imageUrl: ad.imageUrl || '',
      position: ad.position || 'homepage',
      isActive: ad.isActive,
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
            {t('dashboard.ads.title')}
          </h2>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">
            {t('dashboard.ads.subtitle')}
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setFormData({ title: '', link: '', imageUrl: '', position: 'homepage', isActive: true }); setIsModalOpen(true); }}
          className="btn-primary px-5 h-11 flex items-center gap-2 text-xs self-end md:self-auto"
        >
          <Plus size={16} />
          {t('dashboard.ads.add_new')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div key={ad.id} className="glass p-5 rounded-2xl border-border/50 hover:border-primary/30 transition-all group">
              {/* Banner Preview */}
              <div className="w-full h-32 rounded-xl bg-background border border-border overflow-hidden mb-4">
                {ad.imageUrl ? (
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted/30">
                    <Image size={32} />
                  </div>
                )}
              </div>

              <div className={`space-y-2 ${textAlignment}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                    {ad.title}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${ad.isActive ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                    <div className={`w-1 h-1 rounded-full ${ad.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    {ad.isActive ? t('dashboard.ads.status_active') : t('dashboard.ads.status_inactive')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted uppercase tracking-widest">
                  <Monitor size={10} />
                  <span>{ad.position}</span>
                </div>
              </div>

              <div className={`flex items-center gap-2 mt-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => handleToggle(ad.id, ad.isActive)}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${ad.isActive ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-black' : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-black'}`}
                >
                  {ad.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                  {ad.isActive ? t('dashboard.ads.toggle_deactivate') : t('dashboard.ads.toggle_activate')}
                </button>
                <button onClick={() => openEdit(ad)} className="p-2 hover:bg-primary/10 text-primary rounded-xl border border-primary/20 transition-all">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(ad.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {ads.length === 0 && (
            <div className="col-span-2 p-16 text-center space-y-4 glass rounded-2xl">
              <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto border border-border opacity-30">
                <Monitor size={28} />
              </div>
              <div className="space-y-1">
                <div className="text-lg font-black uppercase tracking-tighter text-glow-primary">{t('dashboard.ads.empty_title')}</div>
                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">{t('dashboard.ads.empty_subtitle')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ad Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass w-full max-w-md rounded-2xl p-6 animate-in zoom-in-95 duration-300 relative border-primary/20">
            <button onClick={() => setIsModalOpen(false)} className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} text-text-muted hover:text-white transition-colors`}>
              <X size={20} />
            </button>
            <div className={`${textAlignment} mb-6`}>
              <h3 className="text-lg font-black uppercase tracking-tighter text-glow-primary">
                {editingId ? t('dashboard.ads.edit_title') : t('dashboard.ads.create_title')}
              </h3>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">{t('dashboard.ads.modal_subtitle')}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'title', label: t('dashboard.ads.label_title'), placeholder: 'Summer Sale Banner' },
                { key: 'link', label: t('dashboard.ads.label_link'), placeholder: 'https://...' },
                { key: 'imageUrl', label: t('dashboard.ads.label_image'), placeholder: 'https://cdn.../banner.jpg' },
              ].map(field => (
                <div key={field.key} className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-text-muted block ${textAlignment}`}>{field.label}</label>
                  <input
                    type="text"
                    value={(formData as any)[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${textAlignment}`}
                    placeholder={field.placeholder}
                    required={field.key === 'title'}
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest text-text-muted block ${textAlignment}`}>{t('dashboard.ads.label_position')}</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${textAlignment}`}
                >
                  <option value="homepage">Homepage</option>
                  <option value="shop">Shop Page</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
              <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })} className="text-primary">
                  {formData.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-text-muted" />}
                </button>
                <span className="text-xs font-bold text-text-muted">
                  {formData.isActive ? t('dashboard.ads.status_active') : t('dashboard.ads.status_inactive')}
                </span>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary h-11 text-xs">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  {editingId ? t('dashboard.ads.submit_save') : t('dashboard.ads.submit_create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsPage;
