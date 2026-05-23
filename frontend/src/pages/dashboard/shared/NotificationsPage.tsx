import React, { useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { Bell, Package, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const { t, lang } = useTranslation();
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package size={20} className="text-blue-500" />;
      case 'chat': return <MessageCircle size={20} className="text-green-500" />;
      default: return <AlertCircle size={20} className="text-primary" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary flex items-center gap-2">
          <Bell className="text-primary" />
          {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
        </h1>
        
        {notifications.some(n => !n.read) && (
          <button 
            onClick={() => markAllAsRead()}
            className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest flex items-center gap-1"
          >
            <CheckCircle2 size={16} />
            {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
          </button>
        )}
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl max-w-5xl mx-auto shadow-2xl border border-border/50">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold">{lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications yet'}</h3>
            <p className="text-sm mt-2">{lang === 'ar' ? 'سنقوم بإبلاغك بأي تحديثات جديدة' : 'We will notify you of any new updates'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => !notif.read && markAsRead(notif.id)}
                className={`p-5 rounded-2xl flex gap-4 transition-all duration-300 cursor-pointer ${
                  notif.read ? 'bg-slate-50 border border-slate-100 opacity-80' : 'bg-white shadow-lg shadow-primary/5 border border-primary/20 scale-[1.01]'
                }`}
              >
                <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${notif.read ? 'bg-slate-100' : 'bg-primary/10'}`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-black tracking-tight ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(notif.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm ${notif.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                    {notif.message}
                  </p>
                </div>
                
                {!notif.read && (
                  <div className="h-3 w-3 shrink-0 rounded-full bg-primary shadow-glow-primary mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
