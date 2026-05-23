import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface NotificationBellProps {
  iconColor?: string;
  hoverColor?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ iconColor = 'text-text-main', hoverColor = 'hover:text-primary' }) => {
  const { lang } = useTranslation();
  const { notifications, unreadCount, fetchNotifications, addNotification } = useNotificationStore();
  const { user, isAuthenticated } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();

      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
      const socketUrl = apiUrl.replace('/api', '');
      
      const newSocket = io(socketUrl, {
        reconnectionDelayMax: 10000,
      });

      newSocket.on('connect', () => {
        newSocket.emit('authenticate', { userId: user.id });
      });

      newSocket.on('new_notification', (data: any) => {
        addNotification(data);
        toast.success(data.title, {
          icon: '🔔',
          style: {
            borderRadius: '16px',
            background: '#0F172A',
            color: '#fff',
          },
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return null;

  return (
    <Link 
      to={`/dashboard/${user?.role?.toLowerCase() || 'customer'}/notifications`} 
      className={`relative p-2 transition-colors group active:scale-90 ${iconColor} ${hoverColor}`}
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
