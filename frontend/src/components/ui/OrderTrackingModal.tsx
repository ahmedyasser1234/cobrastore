import React, { useState, useEffect } from 'react';
import { X, Loader2, Package, Truck, MapPin, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

interface OrderTrackingModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ orderId, isOpen, onClose }) => {
  const { lang } = useTranslation();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchTracking();
    }
  }, [isOpen, orderId]);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      setTrackingData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const statuses = [
    { id: 'draft', label: lang === 'ar' ? 'تم الطلب' : 'Ordered', icon: <Package /> },
    { id: 'processing', label: lang === 'ar' ? 'قيد المعالجة' : 'Processing', icon: <Package /> },
    { id: 'shipped', label: lang === 'ar' ? 'تم الشحن' : 'Shipped', icon: <Truck /> },
    { id: 'delivered', label: lang === 'ar' ? 'تم التوصيل' : 'Delivered', icon: <CheckCircle2 /> }
  ];

  const getStatusIndex = (status: string) => {
    if (status === 'delivered') return 3;
    if (status === 'shipped') return 2;
    if (status === 'processing') return 1;
    return 0; // draft, paid, etc.
  };

  const currentIndex = trackingData ? getStatusIndex(trackingData.status) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-3xl w-full max-w-lg shadow-2xl relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-red-500 bg-surface p-2 rounded-full transition-colors z-10">
          <X size={18} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {lang === 'ar' ? 'تتبع الطلب' : 'Track Order'}
              </h2>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 font-mono">
                #{orderId.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : trackingData ? (
            <div className="space-y-8">
              {/* Progress Line */}
              <div className="relative flex justify-between items-center mb-12">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-surface -translate-y-1/2 z-0 rounded-full" />
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 shadow-glow-primary rounded-full" 
                  style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                />
                
                {statuses.map((step, idx) => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                        idx <= currentIndex 
                        ? 'bg-primary text-white shadow-glow-primary scale-110' 
                        : 'bg-surface border border-border text-text-muted'
                      }`}
                    >
                      {React.cloneElement(step.icon as React.ReactElement, { size: 18 })}
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest absolute -bottom-6 w-24 text-center ${
                      idx <= currentIndex ? 'text-primary' : 'text-text-muted'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status Logs */}
              <div className="bg-surface rounded-2xl border border-border p-6 mt-12">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b border-border/50 pb-2">
                  {lang === 'ar' ? 'سجل الحالات' : 'Status History'}
                </h3>
                <div className="space-y-4">
                  {trackingData.statusLogs?.length > 0 ? trackingData.statusLogs.map((log: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 shadow-glow-primary" />
                      <div>
                        <div className="text-sm font-bold capitalize text-text-main">{log.toStatus}</div>
                        {log.note && <div className="text-xs text-text-muted font-medium mt-0.5">{log.note}</div>}
                        <div className="text-[10px] text-text-muted font-mono mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-xs font-bold text-text-muted text-center py-2">
                      {lang === 'ar' ? 'لا يوجد سجل متاح حالياً' : 'No logs available'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
             <div className="text-center py-10 text-red-500 text-sm font-bold">Failed to load tracking data</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;
