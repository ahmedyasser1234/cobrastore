import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Trash2, Filter, Loader2, 
  ArrowUpRight, BarChart3, Plus, X, Package, ExternalLink
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';

const ProductsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { t, lang } = useTranslation();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products', { params: { search } });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/products/${deleteId}`);
      toast.success(lang === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
      fetchProducts();
    } catch (error) {
      // toast handled by api interceptor
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header Area */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${lang === 'ar' ? '' : 'md:flex-row-reverse'}`}>
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className={`text-3xl font-black uppercase tracking-tighter text-glow-primary flex items-center gap-3 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
            {lang === 'ar' ? 'المنتجات' : 'Products'}
          </h2>
          <p className={`text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
            {lang === 'ar' ? 'إدارة الكتالوج العام والتحكم في المخزون' : 'Global Catalog & Inventory Management'}
          </p>
        </div>
        <div className="flex gap-4 self-end md:self-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-6 h-12 flex items-center gap-2 text-xs"
          >
            <Plus size={18} />
            {lang === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex-grow w-full relative group">
        <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all rounded-[24px]" />
        <div className="relative glass rounded-[24px] p-1 border-border/50 flex items-center">
          <div className="flex-grow relative">
            <Search className={`absolute ${lang === 'ar' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors`} size={18} />
            <input 
              type="text" 
              placeholder={lang === 'ar' ? 'البحث عن منتج بالاسم أو الكود...' : 'Search product by name or code...'}
              className={`w-full bg-transparent border-none py-4 text-sm focus:ring-0 outline-none font-bold placeholder:text-text-muted/50 ${lang === 'ar' ? 'pr-14 pl-6 text-right' : 'pl-14 pr-6 text-left'}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>


      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="glass rounded-[32px] border-border/50 overflow-hidden shadow-xl">
          <table className={`w-full border-collapse ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="border-b border-border/50 bg-background/30 backdrop-blur-md">
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted/60 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted/60 text-center">{lang === 'ar' ? 'المتجر' : 'Vendor'}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted/60 text-center">{lang === 'ar' ? 'السعر' : 'Price'}</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted/60 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{lang === 'ar' ? 'التحكم' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {items.map((product) => (
                <tr key={product.id} className="group hover:bg-primary/[0.02] transition-all">
                  <td className={`px-8 py-5 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center justify-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-primary overflow-hidden group-hover:border-primary/30 transition-all shrink-0">
                        {product.images?.[0] ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover" /> : <Package size={20} />}
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">{product.name}</div>
                        <div className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{product.category?.name || (lang === 'ar' ? 'بدون تصنيف' : 'Uncategorized')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-mono font-bold text-primary border border-primary/20 bg-primary/5 px-3 py-1 rounded-full">
                      {product.vendor?.storeName || 'كوبرا سيستم'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="text-sm font-mono font-bold tracking-tight">{product.basePrice} {lang === 'ar' ? 'ج.م' : 'EGP'}</div>
                  </td>
                  <td className={`px-8 py-5 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                    <div className={`flex items-center gap-2 transition-all ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 border border-red-500/20 transition-all">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-primary/10 rounded-xl text-primary border border-primary/20 transition-all">
                        <ExternalLink size={16} />
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
                <ShoppingBag size={28} className="text-text-muted opacity-30" />
              </div>
              <div className="space-y-1">
                <div className="text-xl font-black uppercase tracking-tighter">{lang === 'ar' ? 'الكتالوج فارغ' : 'Catalog Empty'}</div>
                <div className="text-[9px] text-text-muted font-black uppercase tracking-widest">{lang === 'ar' ? 'لم يتم العثور على أي منتجات تتوافق مع معايير البحث' : 'No products found matching your search'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal (Placeholder for UI) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="glass w-full max-w-2xl rounded-[40px] p-10 animate-in zoom-in-95 duration-300 relative border-primary/20">
            <button onClick={() => setIsModalOpen(false)} className={`absolute top-8 ${lang === 'ar' ? 'left-8' : 'right-8'} text-text-muted hover:text-white transition-colors`}>
              <X size={24} />
            </button>
            <div className={lang === 'ar' ? 'text-right mb-8' : 'text-left mb-8'}>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-glow-primary">{lang === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}</h3>
              <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">{lang === 'ar' ? 'أضف تفاصيل المنتج بدقة للظهور في المتجر' : 'Add product details accurately to appear in store'}</p>
            </div>
            <form className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mx-1">{lang === 'ar' ? 'اسم المنتج' : 'Product Name'}</label>
                <input 
                  type="text" 
                  className={`w-full bg-background border border-border rounded-2xl p-5 text-sm focus:border-primary transition-all outline-none font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder={lang === 'ar' ? 'اسم المنتج' : 'Product Name'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mx-1">{lang === 'ar' ? 'السعر' : 'Price'}</label>
                <input 
                  type="number" 
                  className={`w-full bg-background border border-border rounded-2xl p-5 text-sm focus:border-primary transition-all outline-none font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder={lang === 'ar' ? '0.00 ج.م' : '0.00 EGP'}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mx-1">{lang === 'ar' ? 'الوصف' : 'Description'}</label>
                <textarea 
                  className={`w-full bg-background border border-border rounded-2xl p-5 text-sm focus:border-primary transition-all outline-none font-bold h-32 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder={lang === 'ar' ? 'وصف المنتج...' : 'Product Description...'}
                />
              </div>
              <div className="pt-4 md:col-span-2">
                <button type="submit" className="w-full btn-primary h-16 text-lg">
                  <Plus size={24} />
                  {lang === 'ar' ? 'تثبيت المنتج في النظام' : 'Install Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="glass w-full max-w-md rounded-[32px] p-8 animate-in zoom-in-95 duration-300 relative border-red-500/20 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-glow-primary mb-2">{lang === 'ar' ? 'تأكيد مسح المنتج' : 'Confirm Deletion'}</h3>
            <p className="text-text-muted text-sm font-bold uppercase tracking-widest mb-8 leading-relaxed">
              {lang === 'ar' ? 'هل أنت متأكد من مسح هذا المنتج تماماً من النظام؟ هذا الإجراء لا يمكن التراجع عنه.' : 'Are you sure you want to permanently delete this product? This action cannot be undone.'}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteId(null)} 
                className="flex-1 bg-surface border border-border hover:bg-surface/80 text-text-main font-bold py-4 rounded-2xl transition-all"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20"
              >
                {lang === 'ar' ? 'نعم، احذف' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
