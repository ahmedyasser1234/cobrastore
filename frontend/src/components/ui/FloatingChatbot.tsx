import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const FloatingChatbot: React.FC = () => {
  const { t, lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Note: For a real app, you would check if the current page/category has `aiChatbotSupport === true`
  // Here we'll assume it's true or controlled by the parent component.
  const isEnabled = true;

  useEffect(() => {
    const saved = localStorage.getItem('elkoko-ai-chat');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {}
    } else {
      setMessages([
        { role: 'assistant', content: lang === 'ar' ? 'مرحباً بك في كوبرا! كيف يمكنني مساعدتك اليوم؟' : 'Welcome to Cobra! How can I help you today?' }
      ]);
    }
  }, [lang]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('elkoko-ai-chat', JSON.stringify(messages));
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3005'}/ai/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: newHistory })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...newHistory, { role: 'assistant', content: data.reply }]);
      }
    } catch (err) {
      setMessages([...newHistory, { role: 'assistant', content: lang === 'ar' ? 'عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.' : 'Sorry, connection error. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isEnabled) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[550px] max-h-[85vh] bg-white rounded-[2rem] shadow-2xl z-50 flex flex-col border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm">{lang === 'ar' ? 'كوبرا - مساعد ذكي' : 'Cobra AI Assistant'}</h3>
                <p className="text-[10px] text-white/80 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                  {lang === 'ar' ? 'متصل الآن' : 'Online'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-bl-none shadow-sm text-slate-400 flex items-center gap-2 text-sm font-medium">
                  <Loader2 size={14} className="animate-spin" />
                  {lang === 'ar' ? 'جاري الكتابة...' : 'Typing...'}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Actions */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex justify-center">
              <button onClick={() => window.location.href = '/chat'} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                <User size={12} />
                {lang === 'ar' ? 'تحدث مع موظف حقيقي' : 'Talk to human agent'}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type a message...'}
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 h-12 outline-none focus:border-primary text-sm font-medium shadow-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-12 h-12 shrink-0 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm shadow-primary/20"
              >
                <Send size={20} className={lang === 'ar' ? '-scale-x-100' : ''} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
