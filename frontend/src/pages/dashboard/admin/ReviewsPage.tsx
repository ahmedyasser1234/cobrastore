import React, { useState, useEffect } from 'react';
import {
  Loader2, Star, CheckCircle, EyeOff, 
  MessageSquare, Package, User
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';

const ReviewsPage: React.FC = () => {
  const { t, lang, dir } = useTranslation();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleAction = async (id: string, status: 'approved' | 'hidden') => {
    try {
      await api.patch(`/admin/reviews/${id}/status`, { status });
      toast.success(status === 'approved' ? t('dashboard.reviews.msg_approved') : t('dashboard.reviews.msg_hidden'));
      fetchReviews();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشلت العملية' : 'Operation failed');
    }
  };

  const textAlignment = lang === 'ar' ? 'text-right' : 'text-left';

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);

  const statusStyle = (status: string) => {
    if (status === 'approved') return 'bg-green-500/10 text-green-500 border-green-500/30';
    if (status === 'hidden') return 'bg-red-500/10 text-red-500 border-red-500/30';
    return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
  };

  const filterBtns = [
    { key: 'all', label: t('dashboard.reviews.filter_all') },
    { key: 'pending', label: t('dashboard.reviews.filter_pending') },
    { key: 'approved', label: t('dashboard.reviews.filter_approved') },
    { key: 'hidden', label: t('dashboard.reviews.filter_hidden') },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      {/* Header */}
      <div className={textAlignment}>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {t('dashboard.reviews.title')}
        </h2>
        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">
          {t('dashboard.reviews.subtitle')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className={`flex gap-2 flex-wrap ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
        {filterBtns.map(btn => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === btn.key
                ? 'bg-primary text-black border-primary'
                : 'bg-background border-border text-text-muted hover:border-primary hover:text-primary'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div key={review.id} className="glass p-5 rounded-2xl border-border/50 hover:border-primary/30 transition-all">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Customer & Product info */}
                <div className={`flex-grow space-y-2 ${textAlignment}`}>
                  <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                      {review.user?.name?.charAt(0) || <User size={14} />}
                    </div>
                    <div className={textAlignment}>
                      <div className="text-xs font-black uppercase tracking-tight">{review.user?.name || '—'}</div>
                      <div className={`flex items-center gap-1 mt-0.5 ${lang === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                        <Package size={10} className="text-text-muted" />
                        <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider truncate max-w-[160px]">
                          {review.product?.name || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className={`flex gap-0.5 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    {[1,2,3,4,5].map(star => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= (review.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-border'}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {review.comment || '—'}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className={`flex md:flex-col items-center md:items-end gap-2 flex-shrink-0 ${lang === 'ar' ? 'md:items-start' : ''}`}>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyle(review.status || 'pending')}`}>
                    <div className={`w-1 h-1 rounded-full ${review.status === 'approved' ? 'bg-green-500' : review.status === 'hidden' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    {review.status === 'approved'
                      ? t('dashboard.reviews.status_approved')
                      : review.status === 'hidden'
                      ? t('dashboard.reviews.status_hidden')
                      : t('dashboard.reviews.status_pending')}
                  </span>
                  <div className="flex gap-1.5">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleAction(review.id, 'approved')}
                        className="p-1.5 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 hover:bg-green-500 hover:text-black transition-all"
                        title={t('dashboard.reviews.action_approve')}
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    {review.status !== 'hidden' && (
                      <button
                        onClick={() => handleAction(review.id, 'hidden')}
                        className="p-1.5 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-black transition-all"
                        title={t('dashboard.reviews.action_hide')}
                      >
                        <EyeOff size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-16 text-center space-y-4 glass rounded-2xl">
              <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto border border-border opacity-30">
                <MessageSquare size={28} />
              </div>
              <div className="space-y-1">
                <div className="text-lg font-black uppercase tracking-tighter text-glow-primary">{t('dashboard.reviews.empty_title')}</div>
                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">{t('dashboard.reviews.empty_subtitle')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
