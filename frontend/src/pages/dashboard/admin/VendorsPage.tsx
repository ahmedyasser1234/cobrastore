import React, { useState, useEffect } from 'react';
import { 
  Store, Search, Plus, Filter, Loader2, 
  CheckCircle, XCircle, Trash2, ExternalLink, 
  DollarSign, MapPin, Globe, ShieldCheck, X, AlertCircle,
  MessageSquare, UserMinus, UserCheck
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

const VendorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, lang, dir } = useTranslation();

  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Commission Modal State
  const [commissionModal, setCommissionModal] = useState<{ isOpen: boolean; vendorId: string; currentCommission: number }>({
    isOpen: false,
    vendorId: '',
    currentCommission: 10
  });
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !email || !password) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.post('/admin/vendors', { storeName, email, password });
      toast.success(lang === 'ar' ? 'تم إضافة متجر الشريك بنجاح' : 'Partner store added successfully');
      setStoreName('');
      setEmail('');
      setPassword('');
      setIsModalOpen(false);
      fetchVendors();
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/vendors', { params: { search } });
      setItems(res.data);
    } catch (error) {
      console.error('Failed to load vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [search]);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    setConfirmModal({
      isOpen: true,
      title: lang === 'ar' 
        ? (newStatus === 'rejected' ? 'إيقاف المتجر' : 'تنشيط المتجر')
        : (newStatus === 'rejected' ? 'Block Store' : 'Activate Store'),
      message: lang === 'ar' 
        ? (newStatus === 'rejected' 
          ? 'سيتم إخفاء المتجر وجميع منتجاته من الموقع فوراً.' 
          : 'سيظهر المتجر ومنتجاته للعملاء مرة أخرى.')
        : (newStatus === 'rejected'
          ? 'The store and all its products will be hidden from the public immediately.'
          : 'The store and its products will be visible to customers again.'),
      type: newStatus === 'rejected' ? 'danger' : 'success',
      onConfirm: async () => {
        try {
          const res = await api.patch(`/admin/vendors/status/${id}`, { status: newStatus });
          console.log(`${res.status}: Vendor status updated`);
          toast.success(lang === 'ar' ? 'تم تحديث حالة المتجر' : 'Store status updated');
          fetchVendors();
        } catch (error) {
          // toast handled by api interceptor
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleStatusUpdate = (id: string, status: string) => {
    setConfirmModal({
      isOpen: true,
      title: lang === 'ar' ? (status === 'approved' ? 'تفعيل المتجر' : 'إيقاف المتجر') : (status === 'approved' ? 'Activate Store' : 'Deactivate Store'),
      message: lang === 'ar' 
        ? (status === 'approved' ? 'سيتمكن المتجر من عرض منتجاته واستقبال الطلبات.' : 'سيتم إخفاء المتجر ومنتجاته عن العملاء.') 
        : (status === 'approved' ? 'The store will be able to show its products and receive orders.' : 'The store and its products will be hidden from customers.'),
      type: status === 'approved' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          const res = await api.patch(`/admin/vendors/status/${id}`, { status });
          console.log(`${res.status}: Vendor status updated`);
          toast.success(lang === 'ar' ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully');
          fetchVendors();
        } catch (error) {
          // toast handled by api interceptor
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/vendors/${commissionModal.vendorId}/commission`, { percentage: commissionModal.currentCommission });
      toast.success(lang === 'ar' ? 'تم تحديث نسبة العمولة بنجاح' : 'Commission percentage updated successfully');
      setCommissionModal({ isOpen: false, vendorId: '', currentCommission: 10 });
      fetchVendors();
    } catch (error) {
      toast.error(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: lang === 'ar' ? 'حذف المتجر' : 'Delete Store',
      message: lang === 'ar' ? 'هل أنت متأكد من مسح هذا المتجر تماماً؟ سيمحى كل ما يتعلق به نهائياً.' : 'Are you sure you want to delete this store completely? All related data will be removed permanently.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admin/vendors/${id}`);
          console.log(`${res.status}: Vendor deleted`);
          toast.success(lang === 'ar' ? 'تم حذف المتجر نهائياً' : 'Store deleted permanently');
          fetchVendors();
        } catch (error) {
          // toast handled by api interceptor
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-glow-primary">{t('dashboard.vendors.title')}</h2>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            {t('dashboard.vendors.subtitle')}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-6 h-12 flex items-center gap-2 text-xs self-end md:self-auto"
        >
          <Plus size={18} />
          {t('dashboard.vendors.add_new')}
        </button>
      </div>

      {/* Search Area */}
      <div className="flex-grow w-full relative group">
        <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all rounded-[24px]" />
        <div className="relative glass rounded-[24px] p-1 border-border/50 flex items-center">
          <div className="flex-grow relative">
            <Search className="absolute start-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t('dashboard.vendors.search_placeholder')} 
              className="w-full bg-transparent border-none py-4 ps-14 pe-6 text-sm focus:ring-0 outline-none font-bold placeholder:text-text-muted/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="glass rounded-[32px] border-border/50 overflow-hidden shadow-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-background/30 backdrop-blur-md">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted/60 text-start">
                  {t('dashboard.vendors.table_info')}
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted/60 text-center">
                  {t('dashboard.vendors.table_slug')}
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted/60 text-center">
                  {t('dashboard.vendors.table_status')}
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted/60 text-end">
                  {t('dashboard.vendors.table_actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/5">
              {items.map((vendor) => (
                <tr key={vendor.id} className="group hover:bg-primary/[0.02] transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-primary overflow-hidden group-hover:border-primary/30 transition-all shrink-0">
                        {vendor.logoUrl ? <img src={vendor.logoUrl} alt="" className="w-full h-full object-cover" /> : <Store size={20} />}
                      </div>
                      <div className="text-start">
                        <div className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">{lang === 'ar' ? vendor.storeNameAr || vendor.storeNameEn : vendor.storeNameEn || vendor.storeNameAr}</div>
                        <div className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                          {t('dashboard.vendors.since')} {new Date(vendor.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                          <Globe size={10} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-mono font-bold text-secondary">
                      {vendor.slug}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center">
                      <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
                        vendor.status === 'approved' ? 'text-green-500' : 
                        vendor.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          vendor.status === 'approved' ? 'bg-green-500 shadow-glow-green' : 
                          vendor.status === 'pending' ? 'bg-yellow-500 shadow-glow-yellow' : 'bg-red-500 shadow-glow-red'
                        }`} />
                        {vendor.status === 'approved' ? t('dashboard.vendors.status_approved') : 
                         vendor.status === 'pending' ? t('dashboard.vendors.status_pending') : t('dashboard.vendors.status_blocked')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2 transition-all">
                      {/* Toggle Block/Activate */}
                      <button 
                        onClick={() => handleToggleStatus(vendor.id, vendor.status)}
                        className={`p-2 rounded-xl border transition-all ${
                          vendor.status === 'approved' 
                            ? 'hover:bg-red-500/10 text-red-500 border-red-500/20' 
                            : 'hover:bg-green-500/10 text-green-500 border-green-500/20'
                        }`}
                        title={vendor.status === 'approved' ? (lang === 'ar' ? 'إيقاف المتجر' : 'Block Store') : (lang === 'ar' ? 'تنشيط المتجر' : 'Activate Store')}
                      >
                        {vendor.status === 'approved' ? <UserMinus size={16} /> : <UserCheck size={16} />}
                      </button>

                      {/* Chat with vendor */}
                      <button 
                        onClick={() => navigate('/dashboard/admin/chat', { state: { targetUser: { id: vendor.userId, name: vendor.storeNameEn || vendor.storeNameAr } } })}
                        className="p-2 hover:bg-primary/10 rounded-xl text-primary border border-primary/20 transition-all"
                        title={lang === 'ar' ? 'مراسلة التاجر' : 'Chat with vendor'}
                      >
                        <MessageSquare size={16} />
                      </button>

                      {/* Approve if pending */}
                      {vendor.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(vendor.id, 'approved')} className="p-2 hover:bg-green-500/10 rounded-xl text-green-500 border border-green-500/20 transition-all">
                          <CheckCircle size={16} />
                        </button>
                      )}

                      {/* Commission */}
                      <button 
                        onClick={() => setCommissionModal({ isOpen: true, vendorId: vendor.id, currentCommission: vendor.commissionPercentage || 10 })}
                        className="p-2 hover:bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/20 transition-all"
                        title={lang === 'ar' ? 'تعديل نسبة العمولة' : 'Edit Commission %'}
                      >
                        <DollarSign size={16} />
                      </button>

                      {/* Delete */}
                      <button onClick={() => handleDelete(vendor.id)} className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 border border-red-500/20 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto border border-border">
                <Store size={28} className="text-text-muted opacity-30" />
              </div>
              <div className="space-y-1">
                <div className="text-xl font-black uppercase tracking-tighter">{t('dashboard.vendors.empty_title')}</div>
                <div className="text-[9px] text-text-muted font-black uppercase tracking-widest">{t('dashboard.vendors.empty_subtitle')}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="glass w-full max-w-lg rounded-[32px] p-8 animate-in zoom-in-95 duration-300 relative border-primary/20" dir={dir}>
            <button onClick={() => setIsModalOpen(false)} className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} text-text-muted hover:text-white transition-colors`}>
              <X size={20} />
            </button>
            <div className={`mb-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">{t('dashboard.vendors.modal_title')}</h3>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">{t('dashboard.vendors.modal_subtitle')}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className={`text-[9px] font-black uppercase tracking-widest text-text-muted block ${lang === 'ar' ? 'text-right mr-1' : 'text-left ml-1'}`}>
                  {t('dashboard.vendors.label_name')}
                </label>
                <input 
                  type="text" 
                  className={`w-full bg-background border border-border rounded-xl p-4 text-xs focus:border-primary transition-all outline-none font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder={lang === 'ar' ? 'اسم المتجر الرسمي' : 'Official Store Name'}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className={`text-[9px] font-black uppercase tracking-widest text-text-muted block ${lang === 'ar' ? 'text-right mr-1' : 'text-left ml-1'}`}>
                  {t('dashboard.vendors.label_email')}
                </label>
                <input 
                  type="email" 
                  className={`w-full bg-background border border-border rounded-xl p-4 text-xs focus:border-primary transition-all outline-none font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder="vendor@cobra.sys"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className={`text-[9px] font-black uppercase tracking-widest text-text-muted block ${lang === 'ar' ? 'text-right mr-1' : 'text-left ml-1'}`}>
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <input 
                  type="password" 
                  className={`w-full bg-background border border-border rounded-xl p-4 text-xs focus:border-primary transition-all outline-none font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full btn-primary h-12 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Plus size={20} />
                      {t('dashboard.vendors.submit')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass w-full max-w-sm rounded-[40px] p-10 relative border-primary/20 text-center animate-in zoom-in-95 duration-300" dir={dir}>
            <div className="mb-8 relative inline-block">
              <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto border-2 ${
                confirmModal.type === 'danger' ? 'bg-red-500/10 border-red-500 text-red-500 shadow-glow-red/20' : 
                confirmModal.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500 shadow-glow-green/20' : 
                'bg-primary/10 border-primary text-primary shadow-glow-primary/20'
              }`}>
                <img src="/cobra-logo-dark.png" alt="Identity" className="h-10 w-auto opacity-50 grayscale" />
                <AlertCircle className="absolute -top-2 -right-2 bg-background rounded-full" size={32} />
              </div>
            </div>
            
            <h3 className={`text-2xl font-black uppercase tracking-tighter mb-2 ${
              confirmModal.type === 'danger' ? 'text-red-500' : 'text-text-main'
            }`}>
              {confirmModal.title}
            </h3>
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">
              {confirmModal.message}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="h-12 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className={`h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  confirmModal.type === 'danger' ? 'bg-red-500 text-white shadow-glow-red hover:bg-red-600' : 
                  confirmModal.type === 'success' ? 'bg-green-500 text-white shadow-glow-green hover:bg-green-600' : 
                  'bg-primary text-black shadow-glow-primary hover:bg-primary-hover'
                }`}
              >
                {lang === 'ar' ? 'تأكيد الأمر' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {commissionModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="glass w-full max-w-sm rounded-3xl p-8 relative border border-border">
            <button onClick={() => setCommissionModal(prev => ({ ...prev, isOpen: false }))} className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4 text-orange-500">
              {lang === 'ar' ? 'نسبة عمولة المنصة' : 'Platform Commission %'}
            </h3>
            <form onSubmit={handleUpdateCommission} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">
                  {lang === 'ar' ? 'النسبة המئوية (%)' : 'Percentage (%)'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  className="w-full bg-background border border-border rounded-xl p-3 text-center text-xl font-black focus:border-orange-500 outline-none"
                  value={commissionModal.currentCommission}
                  onChange={(e) => setCommissionModal(prev => ({ ...prev, currentCommission: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <button type="submit" className="w-full h-12 bg-orange-500 text-white rounded-xl font-bold uppercase hover:bg-orange-600 transition-colors">
                {lang === 'ar' ? 'حفظ التعديل' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
