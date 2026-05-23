import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Eye, Loader2, 
  Package, Store, Clock, ShieldCheck
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';

const ApprovalPage: React.FC = () => {
  const { t, lang, dir } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products/pending');
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch pending products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/admin/products/${id}/status`, { status });
      toast.success(status === 'approved' ? t('dashboard.approval.msg_approved') : t('dashboard.approval.msg_rejected'));
      fetchPending();
    } catch (error) {
      console.error('Action failed:', error);
      toast.error(lang === 'ar' ? 'فشلت العملية' : 'Operation failed');
    }
  };

  const textAlignment = lang === 'ar' ? 'text-right' : 'text-left';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      <div className={textAlignment}>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {t('dashboard.approval.title')}
        </h2>
        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">
          {t('dashboard.approval.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <div key={product.id} className="glass p-5 rounded-2xl border-border/50 flex flex-col md:flex-row items-center gap-6 group hover:border-primary/30 transition-all">
              <div className="w-24 h-24 rounded-xl bg-background border border-border overflow-hidden flex-shrink-0 shadow-glow-primary/5">
                {product.images?.[0] ? (
                  <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package size={28} className="text-text-muted m-auto h-full flex items-center justify-center" />
                )}
              </div>
              
              <div className={`flex-grow ${textAlignment} space-y-3`}>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 text-[9px] font-black uppercase tracking-widest flex-shrink-0">
                    <Clock size={10} />
                    {t('dashboard.approval.status_pending')}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">
                      {t('dashboard.approval.label_store')}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${lang === 'ar' ? 'justify-end md:justify-start flex-row-reverse md:flex-row' : ''}`}>
                      <Store size={12} className="text-primary flex-shrink-0" />
                      <span className="truncate">{product.vendor?.storeName}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">
                      {t('dashboard.approval.label_price')}
                    </div>
                    <div className="text-xs font-black text-primary">
                      {product.basePrice}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">
                      {t('dashboard.approval.label_date')}
                    </div>
                    <div className="text-xs font-bold text-text-main">
                      {new Date(product.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-text-muted line-clamp-2 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              <div className="flex md:flex-col gap-2 flex-shrink-0 w-full md:w-auto">
                <button 
                  onClick={() => handleAction(product.id, 'approved')}
                  className="flex-1 md:flex-none p-2.5 bg-green-500/10 text-green-500 rounded-xl border border-green-500/30 hover:bg-green-500 hover:text-black transition-all shadow-md flex justify-center"
                  title={t('dashboard.approval.action_approve')}
                >
                  <CheckCircle size={18} />
                </button>
                <button 
                  onClick={() => handleAction(product.id, 'rejected')}
                  className="flex-1 md:flex-none p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/30 hover:bg-red-500 hover:text-black transition-all shadow-md flex justify-center"
                  title={t('dashboard.approval.action_reject')}
                >
                  <XCircle size={18} />
                </button>
                <button className="flex-1 md:flex-none p-2.5 bg-background/50 text-text-muted rounded-xl border border-border hover:border-primary hover:text-primary transition-all flex justify-center">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="p-20 text-center space-y-4 glass rounded-3xl">
              <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto border border-dashed border-border text-text-muted/30">
                <ShieldCheck size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tighter text-glow-primary">
                  {t('dashboard.approval.empty_title')}
                </h3>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                  {t('dashboard.approval.empty_subtitle')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalPage;
