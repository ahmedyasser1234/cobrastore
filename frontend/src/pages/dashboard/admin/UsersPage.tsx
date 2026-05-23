import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Filter, Loader2, MoreVertical, 
  Shield, UserMinus, UserCheck, Mail, Calendar, Hash, X,
  UserPlus, Trash2, MessageSquare, AlertCircle, CheckCircle2
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';

import { useNavigate } from 'react-router-dom';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState('customer');
  const { t, lang, dir } = useTranslation();
  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?role=${roleFilter}`);
      setUsers(res.data);
    } catch (error) {
      toast.error(lang === 'ar' ? 'فشل في جلب المستخدمين' : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?role=${roleFilter}&search=${searchTerm}`);
      setUsers(res.data);
    } catch (error) {
      toast.error(lang === 'ar' ? 'فشل البحث' : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/admin/users', formData);
      console.log(`${res.status}: User added successfully`);
      toast.success(lang === 'ar' ? 'تم إضافة المستخدم بنجاح' : 'User added successfully');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'customer' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (lang === 'ar' ? 'فشل في إضافة المستخدم' : 'Failed to add user'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: lang === 'ar' ? 'حذف المستخدم' : 'Delete User',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا المستخدم نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this user permanently? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admin/users/${id}`);
          console.log(`${res.status}: User deleted`);
          toast.success(lang === 'ar' ? 'تم حذف المستخدم' : 'User deleted');
          fetchUsers();
        } catch (error) {
          toast.error(lang === 'ar' ? 'فشل في حذف المستخدم' : 'Failed to delete user');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    setConfirmModal({
      isOpen: true,
      title: lang === 'ar' ? (newStatus === 'blocked' ? 'إيقاف الحساب' : 'تنشيط الحساب') : (newStatus === 'blocked' ? 'Block Account' : 'Activate Account'),
      message: lang === 'ar' 
        ? (newStatus === 'blocked' ? 'سيتم منع المستخدم من تسجيل الدخول تماماً.' : 'سيتمكن المستخدم من الوصول إلى حسابه مرة أخرى.') 
        : (newStatus === 'blocked' ? 'The user will be completely prevented from logging in.' : 'The user will be able to access their account again.'),
      type: newStatus === 'blocked' ? 'danger' : 'success',
      onConfirm: async () => {
        try {
          const res = await api.patch(`/admin/users/status/${id}`, { status: newStatus });
          console.log(`${res.status}: Status updated`);
          toast.success(lang === 'ar' ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully');
          fetchUsers();
        } catch (error) {
          toast.error(lang === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-glow-primary">{t('dashboard.users.title')}</h2>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">{t('dashboard.users.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-6 h-12 flex items-center gap-2 text-xs self-end md:self-auto"
        >
          <UserPlus size={18} />
          {t('dashboard.users.add_new')}
        </button>
      </div>

      {/* Search Area */}
      <div className="flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-grow w-full relative group">
          <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all rounded-[24px]" />
          <div className="relative glass rounded-[24px] p-1 border-border/50 flex items-center">
            <div className="flex-grow relative">
              <Search className="absolute start-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <form onSubmit={handleSearch}>
                <input 
                  type="text" 
                  placeholder={t('dashboard.users.search_placeholder')} 
                  className="w-full bg-transparent border-none py-4 ps-14 pe-6 text-sm focus:ring-0 outline-none font-bold placeholder:text-text-muted/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table Area */}
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/1 blur-2xl rounded-[32px] -z-10" />
        <div className="glass rounded-[32px] border-border/50 overflow-hidden shadow-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-background/30 backdrop-blur-md">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted/60 text-start">
                  {t('dashboard.users.table_user')}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted/60 text-center">
                  {t('dashboard.users.table_status')}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted/60 text-center">
                  {t('dashboard.users.table_date')}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted/60 text-end">
                  {t('dashboard.users.table_actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((userItem) => (
                  <tr key={userItem.id} className="group hover:bg-primary/[0.02] transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary group-hover:border-primary/50 transition-all relative shrink-0">
                          <Users size={18} />
                          <span className={`absolute -bottom-0.5 -inline-end-0.5 w-2.5 h-2.5 ${userItem.status === 'active' ? 'bg-green-500 shadow-glow-green' : 'bg-red-500 shadow-glow-red'} border-2 border-background rounded-full`} />
                        </div>
                        <div className="text-start">
                          <div className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">{userItem.name}</div>
                          <div className="text-[9px] text-text-muted font-bold tracking-widest lowercase">{userItem.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${userItem.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${userItem.status === 'active' ? 'bg-green-500 shadow-glow-green' : 'bg-red-500 shadow-glow-red'}`} />
                          {userItem.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'موقوف' : 'Blocked')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-bold text-center text-text-muted/80">
                        {new Date(userItem.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 transition-all">
                        <button 
                          onClick={() => handleDeleteUser(userItem.id)}
                          className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 border border-red-500/20 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(userItem.id, userItem.status)}
                          className={`p-2 rounded-xl border transition-all ${userItem.status === 'active' ? 'hover:bg-red-500/10 text-red-500 border-red-500/20' : 'hover:bg-green-500/10 text-green-500 border-green-500/20'}`}
                          title={userItem.status === 'active' ? 'Block' : 'Activate'}
                        >
                          {userItem.status === 'active' ? <UserMinus size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button 
                          onClick={() => navigate('/dashboard/admin/chat', { state: { targetUser: userItem } })}
                          className="p-2 hover:bg-primary/10 rounded-xl text-primary border border-primary/20 transition-all"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center opacity-30">
                    <div className="text-xl font-black uppercase tracking-tighter mb-1">{t('dashboard.users.no_users')}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest">{t('dashboard.users.no_results')}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="glass w-full max-w-lg rounded-[32px] p-8 animate-in zoom-in-95 duration-300 relative border-primary/20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <button onClick={() => setIsModalOpen(false)} className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} text-text-muted hover:text-white transition-colors`}>
              <X size={20} />
            </button>
            
            <div className={`mb-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <h3 className="text-2xl font-black uppercase tracking-tight text-glow-primary">{t('dashboard.users.modal_title')}</h3>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">{t('dashboard.users.modal_subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className={`block text-[10px] font-black uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'} px-1`}>
                    {t('dashboard.users.label_name')}
                  </label>
                  <input 
                    type="text" 
                    required
                    className={`w-full bg-background/50 border border-border rounded-xl px-5 py-3.5 text-sm focus:border-primary transition-all outline-none font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-[10px] font-black uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'} px-1`}>
                    {t('dashboard.users.label_email')}
                  </label>
                  <input 
                    type="email" 
                    required
                    className={`w-full bg-background/50 border border-border rounded-xl px-5 py-3.5 text-sm focus:border-primary transition-all outline-none font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-[10px] font-black uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'} px-1`}>
                    {t('dashboard.users.label_password')}
                  </label>
                  <input 
                    type="password" 
                    required
                    className={`w-full bg-background/50 border border-border rounded-xl px-5 py-3.5 text-sm focus:border-primary transition-all outline-none font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full btn-primary h-14 rounded-xl flex items-center justify-center gap-3 mt-6 shadow-glow-primary/20"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                <span className="font-black uppercase tracking-widest text-xs">{t('dashboard.users.submit')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-12 relative border-border text-center animate-in zoom-in-95 duration-300 shadow-2xl" dir={dir}>
            {/* Close Button */}
            <button 
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-6 right-8 text-text-muted hover:text-red-500 transition-colors p-2"
            >
              <X size={24} />
            </button>

            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center border-4 border-background shadow-2xl ${
                confirmModal.type === 'danger' ? 'bg-red-500 text-white shadow-glow-red' : 
                confirmModal.type === 'success' ? 'bg-green-500 text-white shadow-glow-green' : 
                'bg-primary text-black shadow-glow-primary'
              }`}>
                <AlertCircle size={40} className="animate-pulse" />
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <img src="/cobra-logo-dark.png" alt="Cobra" className="h-12 w-auto mx-auto mb-2 opacity-80" />
              <h3 className={`text-3xl font-black uppercase tracking-tighter ${
                confirmModal.type === 'danger' ? 'text-red-500' : 'text-text-main'
              }`}>
                {confirmModal.title}
              </h3>
              <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] leading-loose opacity-70">
                {confirmModal.message}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-12">
              <button 
                onClick={confirmModal.onConfirm}
                className={`h-14 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  confirmModal.type === 'danger' ? 'bg-red-500 text-white shadow-glow-red hover:bg-red-600' : 
                  confirmModal.type === 'success' ? 'bg-green-500 text-white shadow-glow-green hover:bg-green-600' : 
                  'bg-primary text-black shadow-glow-primary hover:bg-cyan-400'
                }`}
              >
                {lang === 'ar' ? 'تأكيد العملية' : 'Confirm Action'}
              </button>
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="h-14 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all text-text-muted"
              >
                {lang === 'ar' ? 'تراجع' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
