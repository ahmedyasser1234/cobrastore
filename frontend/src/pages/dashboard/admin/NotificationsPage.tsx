import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { ShoppingBag, User, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../../services/api';

const NotificationsPage: React.FC = () => {
  const { t, lang } = useTranslation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/admin/notifications');
        setNotifications(res.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getNotificationMeta = (type: string) => {
    switch (type) {
      case 'order':
        return { icon: <ShoppingBag size={15} />, color: 'text-primary', shadow: 'group-hover:shadow-glow-primary' };
      case 'user':
        return { icon: <User size={15} />, color: 'text-secondary', shadow: 'group-hover:shadow-glow-secondary' };
      case 'success':
        return { icon: <CheckCircle2 size={15} />, color: 'text-green-500', shadow: 'group-hover:shadow-glow-success' };
      case 'system':
      default:
        return { icon: <AlertCircle size={15} />, color: 'text-red-500', shadow: 'group-hover:shadow-glow-error' };
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 0) return lang === 'ar' ? 'الآن' : 'just now';
    
    const ago = lang === 'ar' ? 'منذ' : '';
    const suffix = lang === 'ar' ? '' : ' ago';

    let interval = seconds / 31536000;
    if (interval > 1) {
      const v = Math.floor(interval);
      return lang === 'ar' 
        ? `${ago} ${v} ${v > 10 ? 'سنة' : 'سنوات'}${suffix}` 
        : `${v} year${v > 1 ? 's' : ''}${suffix}`;
    }
    
    interval = seconds / 2592000;
    if (interval > 1) {
      const v = Math.floor(interval);
      return lang === 'ar' 
        ? `${ago} ${v} ${v > 10 ? 'شهر' : 'أشهر'}${suffix}` 
        : `${v} month${v > 1 ? 's' : ''}${suffix}`;
    }
    
    interval = seconds / 86400;
    if (interval > 1) {
      const v = Math.floor(interval);
      return lang === 'ar' 
        ? `${ago} ${v} ${v > 10 ? 'يوم' : 'أيام'}${suffix}` 
        : `${v} day${v > 1 ? 's' : ''}${suffix}`;
    }
    
    interval = seconds / 3600;
    if (interval > 1) {
      const v = Math.floor(interval);
      return lang === 'ar' 
        ? `${ago} ${v} ${v > 10 ? 'ساعة' : 'ساعات'}${suffix}` 
        : `${v} hour${v > 1 ? 's' : ''}${suffix}`;
    }
    
    interval = seconds / 60;
    if (interval > 1) {
      const v = Math.floor(interval);
      return lang === 'ar' 
        ? `${ago} ${v} ${v > 10 ? 'دقيقة' : 'دقائق'}${suffix}` 
        : `${v} minute${v > 1 ? 's' : ''}${suffix}`;
    }
    
    return lang === 'ar' ? 'الآن' : 'just now';
  };

  if (loading) {
    return (
      <div className="h-full min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
        <h1 className="text-2xl font-black uppercase tracking-tight text-glow-primary">{t('dashboard.sidebar.notifications')}</h1>
        <p className="text-text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1 opacity-60">System Core Alerts & Real-time Updates</p>
      </div>

      <div className="space-y-2.5">
        {notifications.length > 0 ? (
          notifications.map((note) => {
            const meta = getNotificationMeta(note.type);
            return (
              <div key={note.id} className="glass group relative overflow-hidden p-[1px] rounded-[16px] transition-all hover:scale-[1.005] active:scale-[0.995]">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-background/40 backdrop-blur-md rounded-[15px] p-3.5 flex gap-4 items-center">
                  <div className={`w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-sm ${meta.shadow} transition-all duration-500 shrink-0`}>
                    <div className={`${meta.color} group-hover:scale-110 transition-transform duration-500`}>
                      {meta.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-3">
                      <h4 className="font-extrabold text-sm tracking-tight group-hover:text-primary transition-colors truncate">
                        {lang === 'ar' ? note.titleAr : note.title}
                      </h4>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted/50 whitespace-nowrap pt-0.5">
                        {getTimeAgo(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-text-muted text-[11px] font-medium leading-normal mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      {lang === 'ar' ? note.descAr : note.desc}
                    </p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary shadow-glow-primary transition-all shrink-0" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass rounded-[16px] p-8 text-center text-text-muted/60 text-sm">
            {lang === 'ar' ? 'لا توجد إشعارات حالياً' : 'No notifications available at the moment'}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
