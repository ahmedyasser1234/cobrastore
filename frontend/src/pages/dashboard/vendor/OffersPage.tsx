import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2, Zap, Target, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';

const OffersPage: React.FC = () => {
  const { t, lang } = useTranslation();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // States to populate dropdowns
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    discountType: 'percentage',
    discountValue: 0,
    targetType: 'product',
    targetId: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchOffers();
    fetchOptions();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors/offers');
      setOffers(res.data);
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل تحميل العروض' : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [prodRes, colRes, catRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/vendors/collections'),
        api.get('/vendors/categories')
      ]);
      setProducts(prodRes.data.items || []);
      setCollections(colRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.warn('Could not load options for target select', err);
    }
  };

  const handleOpenModal = (offer?: any) => {
    if (offer) {
      setEditingId(offer.id);
      setFormData({
        name: offer.name,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        targetType: offer.targetType,
        targetId: offer.targetId || '',
        startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
        endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
        isActive: offer.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        discountType: 'percentage',
        discountValue: 0,
        targetType: 'store',
        targetId: '',
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
        targetId: formData.targetType === 'store' ? null : formData.targetId,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      if (editingId) {
        await api.put(`/vendors/offers/${editingId}`, payload);
        toast.success(lang === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully');
      } else {
        await api.post('/vendors/offers', payload);
        toast.success(lang === 'ar' ? 'تمت الإضافة بنجاح' : 'Added successfully');
      }
      setIsModalOpen(false);
      fetchOffers();
    } catch (err) {
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving offer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
    try {
      await api.delete(`/vendors/offers/${id}`);
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted successfully');
      fetchOffers();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  const renderTargetName = (offer: any) => {
    if (offer.targetType === 'store') return lang === 'ar' ? 'كل المنتجات' : 'All Products';
    if (offer.targetType === 'product') {
      const prod = products.find(p => p.id === offer.targetId);
      return prod ? (lang === 'ar' ? prod.nameAr : prod.nameEn) : 'Product';
    }
    if (offer.targetType === 'collection') {
      const col = collections.find(c => c.id === offer.targetId);
      return col ? (lang === 'ar' ? col.nameAr : col.nameEn) : 'Collection';
    }
    if (offer.targetType === 'category') {
      const cat = categories.find(c => c.id === offer.targetId);
      return cat ? (lang === 'ar' ? cat.nameAr : cat.nameEn) : 'Category';
    }
    return offer.targetType;
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
          {lang === 'ar' ? 'العروض التلقائية' : 'Automated Offers'}
        </h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={18} />
          {lang === 'ar' ? 'إضافة عرض' : 'Add Offer'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white p-6 rounded-2xl shadow-sm border border-border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{offer.name}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${offer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {offer.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(offer)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(offer.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-black text-orange-500 text-lg">{offer.discountValue}{offer.discountType === 'percentage' ? '%' : (lang === 'ar' ? ' ج.م' : ' EGP')}</span>
                <span>{lang === 'ar' ? 'خصم مباشر' : 'Direct Discount'}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                <Target size={16} className="text-slate-400" />
                <span className="font-bold">{lang === 'ar' ? 'يطبق على:' : 'Applies to:'} {renderTargetName(offer)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <span>{lang === 'ar' ? 'المدة:' : 'Duration:'} {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'Now'} - {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'Forever'}</span>
              </div>
            </div>
          </div>
        ))}
        {offers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 font-bold">
            {lang === 'ar' ? 'لا توجد عروض حالياً' : 'No offers found'}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-black">{editingId ? (lang === 'ar' ? 'تعديل العرض' : 'Edit Offer') : (lang === 'ar' ? 'إضافة عرض جديد' : 'Add New Offer')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">{lang === 'ar' ? 'اسم العرض' : 'Offer Name'}</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3" placeholder={lang === 'ar' ? 'مثال: عرض الصيف' : 'e.g. Summer Sale'} />
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
                <label className="block text-sm font-bold mb-2">{lang === 'ar' ? 'يطبق على' : 'Applies to'}</label>
                <select value={formData.targetType} onChange={e => setFormData({...formData, targetType: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3 bg-white mb-3">
                  <option value="store">{lang === 'ar' ? 'كل منتجات المتجر' : 'All Store Products'}</option>
                  <option value="product">{lang === 'ar' ? 'منتج محدد' : 'Specific Product'}</option>
                  <option value="collection">{lang === 'ar' ? 'كولكشن (تشكيلة) محدد' : 'Specific Collection'}</option>
                  <option value="category">{lang === 'ar' ? 'تصنيف محدد' : 'Specific Category'}</option>
                </select>

                {formData.targetType === 'product' && (
                  <select required value={formData.targetId} onChange={e => setFormData({...formData, targetId: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3 bg-white">
                    <option value="">{lang === 'ar' ? 'اختر المنتج...' : 'Select Product...'}</option>
                    {products.map(p => <option key={p.id} value={p.id}>{lang === 'ar' ? p.nameAr : p.nameEn}</option>)}
                  </select>
                )}
                {formData.targetType === 'collection' && (
                  <select required value={formData.targetId} onChange={e => setFormData({...formData, targetId: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3 bg-white">
                    <option value="">{lang === 'ar' ? 'اختر الكولكشن...' : 'Select Collection...'}</option>
                    {collections.map(c => <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.nameEn}</option>)}
                  </select>
                )}
                {formData.targetType === 'category' && (
                  <select required value={formData.targetId} onChange={e => setFormData({...formData, targetId: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3 bg-white">
                    <option value="">{lang === 'ar' ? 'اختر التصنيف...' : 'Select Category...'}</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.nameEn}</option>)}
                  </select>
                )}
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
                <input type="checkbox" id="isActiveOffer" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-primary" />
                <label htmlFor="isActiveOffer" className="font-bold text-sm">{lang === 'ar' ? 'العرض نشط' : 'Offer is Active'}</label>
              </div>

              <div className="pt-4 border-t border-border mt-6">
                <Button type="submit" className="w-full py-4 text-lg bg-orange-500 hover:bg-orange-600 text-white border-0">{lang === 'ar' ? 'حفظ العرض' : 'Save Offer'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersPage;
