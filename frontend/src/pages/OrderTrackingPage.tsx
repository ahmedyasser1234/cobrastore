import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import { Loader2, ArrowLeft, ArrowRight, Package, Truck, CheckCircle2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { lang } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<any>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        // Using get tracking details from API, fallback to order details if tracking specific endpoint fails
        const res = await api.get(`/orders/${orderId}/tracking`).catch(() => api.get(`/orders/${orderId}`));
        setTrackingData(res.data);
      } catch (err) {
        toast.error(lang === 'ar' ? 'فشل تحميل بيانات التتبع' : 'Failed to load tracking data');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchTracking();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-text-muted font-bold">
        {lang === 'ar' ? 'الطلب غير موجود' : 'Order not found'}
      </div>
    );
  }

  // Determine current step index (0: ordered, 1: paid, 2: shipped, 3: delivered)
  const status = trackingData.status?.toLowerCase() || 'processing';
  let currentStepIdx = 0;
  if (status === 'paid' || status === 'processing') currentStepIdx = 1;
  else if (status === 'shipped') currentStepIdx = 2;
  else if (status === 'delivered') currentStepIdx = 3;

  const steps = [
    { id: 'ordered', labelAr: 'تم الطلب', labelEn: 'Ordered', icon: <Package size={20} />, completed: currentStepIdx >= 0 },
    { id: 'paid', labelAr: 'تم الدفع', labelEn: 'Paid', icon: <CreditCard size={20} />, completed: currentStepIdx >= 1 },
    { id: 'shipped', labelAr: 'تم الشحن', labelEn: 'Shipped', icon: <Truck size={20} />, completed: currentStepIdx >= 2 },
    { id: 'delivered', labelAr: 'تم التوصيل', labelEn: 'Delivered', icon: <CheckCircle2 size={20} />, completed: currentStepIdx >= 3 },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar opaque />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 mt-6">
        <Link to="/dashboard/customer/orders" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-bold mb-8">
          {lang === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          {lang === 'ar' ? 'العودة للطلبات' : 'Back to Orders'}
        </Link>

        <div className="bg-white border border-border rounded-[32px] p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary mb-1">
                {lang === 'ar' ? 'تتبع الطلب' : 'Track Order'}
              </h1>
              <p className="text-text-muted text-sm font-mono font-bold">#{orderId?.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
              <span className="text-xs text-text-muted uppercase tracking-widest block mb-1">
                {lang === 'ar' ? 'تاريخ التوصيل المتوقع' : 'Estimated Delivery'}
              </span>
              <span className="text-sm font-black text-primary">
                {trackingData.estimatedDelivery ? new Date(trackingData.estimatedDelivery).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') : (lang === 'ar' ? 'قريباً' : 'Soon')}
              </span>
            </div>
          </div>

          {/* Timeline UI */}
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center py-4 mb-12 gap-8 md:gap-0">
            {/* Horizontal Line for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
            <div 
              className="hidden md:block absolute top-1/2 left-0 h-1 bg-primary shadow-glow-primary -translate-y-1/2 z-0 transition-all duration-1000" 
              style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            />

            {/* Vertical Line for Mobile */}
            <div className="md:hidden absolute left-[23px] top-4 bottom-4 w-1 bg-slate-100 z-0" />
            <div 
              className="md:hidden absolute left-[23px] top-4 w-1 bg-primary shadow-glow-primary z-0 transition-all duration-1000" 
              style={{ height: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const isCurrent = idx === currentStepIdx;
              const isCompleted = idx < currentStepIdx;
              
              let circleClass = "bg-white border-2 border-slate-200 text-slate-300";
              if (isCompleted) circleClass = "bg-primary border-primary text-white shadow-glow-primary";
              if (isCurrent) circleClass = "bg-white border-4 border-primary text-primary shadow-glow-primary animate-pulse";

              return (
                <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${circleClass}`}>
                    {step.icon}
                  </div>
                  <div className="flex flex-col md:items-center">
                    <span className={`text-sm font-black uppercase tracking-widest ${isCompleted || isCurrent ? 'text-text-main' : 'text-slate-400'}`}>
                      {lang === 'ar' ? step.labelAr : step.labelEn}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-primary font-bold uppercase mt-1">
                        {lang === 'ar' ? 'الحالة الحالية' : 'Current Status'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <span className="text-xs text-text-muted uppercase tracking-widest block mb-2">{lang === 'ar' ? 'شركة الشحن' : 'Carrier'}</span>
              <span className="text-lg font-black text-text-main">{trackingData.carrier || 'Cobra Logistics'}</span>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6">
              <span className="text-xs text-text-muted uppercase tracking-widest block mb-2">{lang === 'ar' ? 'رقم التتبع' : 'Tracking Number'}</span>
              <span className="text-lg font-black text-text-main font-mono">{trackingData.trackingNumber || trackingData.id?.substring(0, 12).toUpperCase()}</span>
            </div>
          </div>
          
          {trackingData.trackingUrl && (
            <div className="mt-8 flex justify-center">
              <a 
                target="_blank" 
                rel="noreferrer"
                href={trackingData.trackingUrl} 
                className="bg-primary hover:bg-primary-dark text-white rounded-cobra px-8 py-4 font-bold uppercase tracking-widest transition-all shadow-glow-primary inline-flex items-center gap-2"
              >
                {lang === 'ar' ? 'تتبع على موقع الشركة' : 'Track on Carrier Website'}
                {lang === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
