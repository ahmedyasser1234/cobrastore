import React, { useState } from 'react';
import { X, Loader2, RotateCcw } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import Button from './Button';
import toast from 'react-hot-toast';

interface ReturnModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReturnModal: React.FC<ReturnModalProps> = ({ order, isOpen, onClose, onSuccess }) => {
  const { lang } = useTranslation();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await api.post('/returns', { orderId: order.id, reason });
      toast.success(lang === 'ar' ? 'تم تقديم طلب الإرجاع بنجاح' : 'Return request submitted successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-3xl w-full max-w-md shadow-2xl relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-red-500 bg-surface p-2 rounded-full transition-colors">
          <X size={18} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <RotateCcw size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {lang === 'ar' ? 'طلب إرجاع' : 'Return Request'}
              </h2>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 font-mono">
                #{order.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
                  {lang === 'ar' ? 'سبب الإرجاع الأساسي' : 'Primary Reason'}
                </label>
                <select
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-colors"
                >
                  <option value="">{lang === 'ar' ? 'اختر السبب...' : 'Select a reason...'}</option>
                  <option value="defective">{lang === 'ar' ? 'منتج معيب / تالف' : 'Defective / Damaged'}</option>
                  <option value="wrong item">{lang === 'ar' ? 'استلمت منتج خطأ' : 'Wrong item received'}</option>
                  <option value="changed mind">{lang === 'ar' ? 'غيرت رأيي' : 'Changed my mind'}</option>
                  <option value="other">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
                  {lang === 'ar' ? 'تفاصيل إضافية (اختياري)' : 'Additional Details (Optional)'}
                </label>
                <textarea
                  placeholder={lang === 'ar' ? 'يرجى توضيح سبب الإرجاع بالتفصيل...' : 'Please explain the reason for your return...'}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-colors min-h-[80px] resize-none"
                />
              </div>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-border">
              <div className="flex justify-between items-center text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                <span>{lang === 'ar' ? 'المبلغ المسترد المتوقع' : 'Estimated Refund'}</span>
                <span className="text-primary">{Number(order.total || order.totalAmount).toLocaleString()} EGP</span>
              </div>
              <p className="text-[10px] text-text-muted font-medium">
                {lang === 'ar' ? 'سيتم إرجاع المبلغ إلى وسيلة الدفع الأصلية بعد فحص المنتج.' : 'The amount will be refunded to your original payment method after inspection.'}
              </p>
            </div>

            <Button type="submit" disabled={loading || !reason.trim()} className="w-full py-4 text-sm font-black uppercase tracking-widest">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (lang === 'ar' ? 'تأكيد طلب الإرجاع' : 'Confirm Return')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;
