import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2, Tag, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';

const CouponsPage: React.FC = () => {
  const { t, lang } = useTranslation();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    usageLimit: 0,
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors/coupons');
      setCoupons(res.data);
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل تحميل الكوبونات' : 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon?: any) => {
    if (coupon) {
      setEditingId(coupon.id);
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        usageLimit: coupon.usageLimit,
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
        isActive: coupon.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        usageLimit: 0,
        startDate: '',
        endDate: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      if (editingId) {
        await api.put(`/vendors/coupons/${editingId}`, payload);
        toast.success(lang === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully');
      } else {
        await api.post('/vendors/coupons', payload);
        toast.success(lang === 'ar' ? 'تمت الإضافة بنجاح' : 'Added successfully');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
    try {
      await api.delete(`/vendors/coupons/${id}`);
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted successfully');
      fetchCoupons();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter">
          {lang === 'ar' ? 'إدارة الكوبونات' : 'Coupons Management'}
        </h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={18} />
          {lang === 'ar' ? 'إضافة كوبون' : 'Add Coupon'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white p-6 rounded-2xl shadow-sm border border-border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{coupon.code}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {coupon.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(coupon)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{coupon.discountValue} {coupon.discountType === 'percentage' ? '%' : (lang === 'ar' ? 'ج.م' : 'EGP')}</span>
                <span>{lang === 'ar' ? 'خصم' : 'Discount'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                <span>{lang === 'ar' ? 'الاستخدام:' : 'Usage:'} {coupon.usedCount} / {coupon.usageLimit || '∞'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <span>{lang === 'ar' ? 'ينتهي في:' : 'Ends:'} {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') : (lang === 'ar' ? 'بدون تاريخ انتهاء' : 'No Expiry')}</span>
              </div>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 font-bold">
            {lang === 'ar' ? 'لا توجد كوبونات حالياً' : 'No coupons found'}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-black">{editingId ? (lang === 'ar' ? 'تعديل الكوبون' : 'Edit Coupon') : (lang === 'ar' ? 'إضافة كوبون جديد' : 'Add New Coupon')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">{lang === 'ar' ? 'كود الخصم' : 'Coupon Code'}</label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full border border-border rounded-xl px-4 py-3" placeholder="e.g. SUMMER20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">{lang === 'ar' ? 'نوع الخصم' : 'Discount Type'}</label>
                  <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3 bg-white">
                    <option value="percentage">{lang === 'ar' ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                    <option value="fixed">{lang === 'ar' ? 'مبلغ ثابت' : 'Fixed Amount'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{lang === 'ar' ? 'قيمة الخصم' : 'Discount Value'}</label>
                  <input required type="number" min="0" step="0.01" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: parseFloat(e.target.value)})} className="w-full border border-border rounded-xl px-4 py-3" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{lang === 'ar' ? 'حد الاستخدام (0 = غير محدود)' : 'Usage Limit (0 = Unlimited)'}</label>
                <input type="number" min="0" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: parseInt(e.target.value)})} className="w-full border border-border rounded-xl px-4 py-3" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">{lang === 'ar' ? 'تاريخ البدء' : 'Start Date'}</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{lang === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3" />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-primary" />
                <label htmlFor="isActive" className="font-bold text-sm">{lang === 'ar' ? 'الكوبون نشط' : 'Coupon is Active'}</label>
              </div>

              <div className="pt-4 border-t border-border mt-6">
                <Button type="submit" className="w-full py-4 text-lg">{lang === 'ar' ? 'حفظ الكوبون' : 'Save Coupon'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
