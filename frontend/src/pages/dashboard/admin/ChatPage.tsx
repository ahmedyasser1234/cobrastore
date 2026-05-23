import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Search, Send, Loader2, 
  User, CheckCircle2, Clock, MoreVertical, 
  Paperclip, Image as ImageIcon, Smile
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { useLocation, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

const ChatPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    
    // Check if we were redirected with a target user
    if (location.state?.targetUser) {
      setActiveChat({
        user: location.state.targetUser,
        id: location.state.targetUser.id
      });
    } else {
      const vendorId = searchParams.get('vendor');
      if (vendorId) {
        // Fetch vendor details to display name
        api.get(`/vendors/${vendorId}`).then(res => {
          setActiveChat({
            user: { id: vendorId, name: lang === 'ar' ? res.data.storeNameAr : res.data.storeNameEn },
            id: vendorId
          });
        }).catch(() => {
          setActiveChat({
            user: { id: vendorId, name: 'Vendor' },
            id: vendorId
          });
        });
      }
    }
  }, [location.state, searchParams, lang]);

  useEffect(() => {
    if (!user?.id) return;
    
    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
    const socketUrl = apiUrl.replace('/api', '');
    
    const newSocket = io(socketUrl, {
      query: { userId: user.id }
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [user?.id]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages();
    }
  }, [activeChat]);

  useEffect(() => {
    if (!socket || !activeChat) return;
    
    // Reset online status when switching chats initially
    setIsOnline(false);
    
    // Check initial status
    socket.emit('checkStatus', { targetUserId: activeChat.user?.id });
    
    const handleStatusChange = (data: { userId: string, status: string }) => {
      if (data.userId === activeChat.user?.id) {
        setIsOnline(data.status === 'online');
      }
    };
    
    const handleNewMessage = (msg: any) => {
      if (msg.senderId === activeChat.user?.id || msg.receiverId === activeChat.user?.id) {
        setMessages((prev) => {
           if (prev.find(m => m.id === msg.id)) return prev;
           return [...prev, msg];
        });
      }
      fetchConversations();
    };
    
    socket.on('userStatus', handleStatusChange);
    socket.on('newMessage', handleNewMessage);
    
    return () => {
      socket.off('userStatus', handleStatusChange);
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/chat/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const otherUserId = activeChat.user?.id || activeChat.id;
      const res = await api.get(`/chat/history/${otherUserId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const otherUserId = activeChat.user?.id || activeChat.id;
      const res = await api.post('/chat/send', {
        receiverId: otherUserId,
        content: newMessage
      });
      console.log(`${res.status}: Message sent`);
      toast.success(lang === 'ar' ? 'تم الإرسال' : 'Sent');
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="glass h-full rounded-[24px] border-border/50 overflow-hidden flex shadow-xl">
        
        {/* Sidebar: Conversations List */}
        <div className={`w-80 border-${lang === 'ar' ? 'l' : 'r'} border-border/50 flex flex-col bg-background/20`}>
          <div className="p-4 border-b border-border/50">
            <h2 className={`text-xl font-black uppercase tracking-tight mb-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>المحادثات</h2>
            <div className="relative">
              <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-text-muted`} size={14} />
              <input 
                type="text" 
                placeholder="بحث في الرسائل..." 
                className={`w-full bg-background/50 border border-border/30 rounded-xl py-2.5 ${lang === 'ar' ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'} outline-none focus:border-primary/50 transition-all text-xs font-bold`}
              />
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {conversations.map((chat) => (
                  <button 
                    key={chat.user?.id || chat.id}
                    onClick={() => setActiveChat(chat)}
                    className={`w-full p-4 flex items-center gap-3 transition-all hover:bg-primary/5 ${activeChat?.user?.id === chat.user?.id ? `bg-primary/10 border-${lang === 'ar' ? 'r' : 'l'}-4 border-primary` : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-primary shrink-0">
                      <User size={20} />
                    </div>
                    <div className={`flex-grow overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-black uppercase tracking-tight truncate">{chat.user?.name || 'مستخدم مجهول'}</span>
                        <span className={`text-[9px] text-text-muted font-bold uppercase tracking-widest whitespace-nowrap ${lang === 'ar' ? 'mr-2' : 'ml-2'}`}>
                          {new Date(chat.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted truncate font-medium">{chat.lastMessage || 'لا توجد رسائل بعد'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-grow flex flex-col bg-background/10">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 bg-background/30 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <User size={20} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <h3 className="text-sm font-black uppercase tracking-tight">{activeChat.user?.name}</h3>
                    <div className={`flex items-center gap-1.5 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isOnline ? 'text-green-500' : 'text-text-muted'}`}>
                        {isOnline ? 'متصل الآن' : 'غير متصل'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-3 hover:bg-surface rounded-2xl transition-all">
                  <MoreVertical size={20} className="text-text-muted" />
                </button>
              </div>

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  const isArabic = lang === 'ar';
                  
                  const messageAlign = isOwn ? 'justify-start' : 'justify-end';
                  
                  let bubbleClass = isOwn ? 'bg-primary text-black' : 'bg-surface border border-border/50 text-text';
                  if (isArabic) {
                     bubbleClass += isOwn ? ' rounded-tr-sm' : ' rounded-tl-sm';
                  } else {
                     bubbleClass += isOwn ? ' rounded-tl-sm' : ' rounded-tr-sm';
                  }

                  return (
                    <div key={msg.id} className={`flex ${messageAlign}`}>
                      <div className="max-w-[75%] space-y-1">
                        <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${bubbleClass}`}>
                          {msg.content}
                        </div>
                        <div className={`text-[9px] font-bold text-text-muted px-1 ${isOwn ? (isArabic ? 'text-right' : 'text-left') : (isArabic ? 'text-left' : 'text-right')}`}>
                          {new Date(msg.createdAt).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border/50 bg-background/20">
                <form onSubmit={handleSend} className="relative">
                  <div className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 flex items-center gap-2 border-${lang === 'ar' ? 'l' : 'r'} border-border/30 ${lang === 'ar' ? 'pl-3 mr-1' : 'pr-3 ml-1'}`}>
                    <button type="button" className="text-text-muted hover:text-primary transition-colors"><Smile size={18} /></button>
                    <button type="button" className="text-text-muted hover:text-primary transition-colors"><Paperclip size={18} /></button>
                  </div>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={lang === 'ar' ? "اكتب رسالتك..." : "Type your message..."}
                    className={`w-full bg-background border border-border/50 rounded-xl py-3 ${lang === 'ar' ? 'pr-24 pl-14 text-right' : 'pl-24 pr-14 text-left'} outline-none focus:border-primary/50 transition-all text-sm shadow-inner`}
                  />
                  <button 
                    type="submit"
                    className={`absolute ${lang === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 bg-primary text-black p-2 rounded-lg shadow-glow-primary hover:scale-105 transition-all`}
                  >
                    <Send size={18} className={lang === 'ar' ? '-scale-x-100' : ''} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center space-y-6 opacity-40">
              <div className="w-32 h-32 bg-surface rounded-[40px] flex items-center justify-center border-2 border-dashed border-border">
                <MessageSquare size={64} className="text-text-muted" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight italic">اختر محادثة للبدء</h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">تواصل مباشر مع العملاء والشركاء في النظام</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
