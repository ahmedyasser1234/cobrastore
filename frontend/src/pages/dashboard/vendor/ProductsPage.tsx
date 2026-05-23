import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Loader2, Sparkles, Wand2, Upload, RefreshCw } from 'lucide-react';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';
import { useDepartments, useCategories, useSubCategories, useCategoryAttributes } from '../../../hooks/api/useTaxonomy';
import BulkImportModal from '../../../components/ui/BulkImportModal';

const VendorProductsPage: React.FC = () => {
  const { t, lang } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [filterDept, setFilterDept] = useState('');
  const [filterCat, setFilterCat] = useState('');
  
  // For modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    slug: '',
    descriptionEn: '',
    descriptionAr: '',
    basePrice: '',
    type: 'simple',
    departmentId: '',
    categoryId: '',
    subCategoryId: '',
    stock: 0,
    sku: '',
    images: [] as string[]
  });

  const [bgRemoving, setBgRemoving] = useState(false);
  const [descLoading, setDescLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);

  // Dynamic variants state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);

  const { data: departments, isLoading: deptsLoading } = useDepartments();
  const { data: categories, isLoading: catsLoading } = useCategories(formData.departmentId);
  const { data: filterCategories } = useCategories(filterDept);
  const { data: subCategories, isLoading: subCatsLoading } = useSubCategories(formData.categoryId);
  const { data: attributes } = useCategoryAttributes(formData.categoryId);

  useEffect(() => {
    fetchData();
  }, [filterDept, filterCat]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/vendors/profile/me');
      const vendorId = profileRes.data.id;
      
      let url = `/products?vendorId=${vendorId}`;
      if (filterDept) url += `&department=${filterDept}`;
      if (filterCat) url += `&category=${filterCat}`;

      const productsRes = await api.get(url);
      setProducts(productsRes.data.items || productsRes.data.data || (Array.isArray(productsRes.data) ? productsRes.data : []));
    } catch (err: any) {
      console.error(err);
      toast.error(lang === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        slug: product.slug,
        descriptionEn: product.descriptionEn || '',
        descriptionAr: product.descriptionAr || '',
        basePrice: product.basePrice,
        type: product.type || 'simple',
        departmentId: product.departmentId,
        categoryId: product.vendorCategoryId || product.categoryId || '', // Assuming vendorCategoryId is mapped to Category
        subCategoryId: product.subCategoryId || '',
        stock: product.stock || 0,
        sku: product.sku || '',
        images: product.images?.length ? [product.images[0].url] : []
      });
      setGeneratedVariants(product.variations || []);
    } else {
      setEditingProduct(null);
      setFormData({
        nameEn: '',
        nameAr: '',
        slug: '',
        descriptionEn: '',
        descriptionAr: '',
        basePrice: '',
        type: 'simple',
        departmentId: '',
        categoryId: '',
        subCategoryId: '',
        stock: 0,
        sku: '',
        images: []
      });
      setSelectedOptions({});
      setGeneratedVariants([]);
    }
    setIsModalOpen(true);
  };

  // Generate Variants Logic
  const handleGenerateVariants = () => {
    if (!attributes) return;
    const variantAttrs = attributes.filter((a: any) => a.type === 'variant');
    if (variantAttrs.length === 0) return;

    // A simple generator for single or dual variants based on selected options
    // In a real scenario, this would create combinations. For now, we'll map selected.
    
    // Create combination matrix
    let combos: any[] = [{}];
    variantAttrs.forEach((attr: any) => {
      if (attr.options && attr.options.length > 0) {
        const newCombos: any[] = [];
        combos.forEach(combo => {
          attr.options.forEach((opt: string) => {
            newCombos.push({ ...combo, [attr.nameEn]: opt });
          });
        });
        combos = newCombos;
      }
    });

    const newVariants = combos.map((combo, index) => ({
      id: `new_${index}`,
      attributes: combo,
      price: formData.basePrice,
      stock: 0,
      sku: `${formData.slug}-${Object.values(combo).join('-')}`
    }));

    setGeneratedVariants(newVariants);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, images: [reader.result as string] }));
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedCategoryData = categories?.find((c: any) => c.id === formData.categoryId) || departments?.find((d: any) => d.id === formData.departmentId);

  const handleRemoveBg = async () => {
    if (!formData.images[0]) return;
    try {
      setBgRemoving(true);
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3005'}/ai/background-remover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: formData.images[0] })
      });
      const data = await res.json();
      if (data.result_base64) {
        setFormData(prev => ({ ...prev, images: [data.result_base64] }));
        toast.success(lang === 'ar' ? 'تمت إزالة الخلفية' : 'Background removed successfully');
      } else throw new Error();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشلت إزالة الخلفية' : 'Failed to remove background');
    } finally {
      setBgRemoving(false);
    }
  };

  const handleAutoDescription = async () => {
    if (!formData.nameEn && !formData.nameAr && !formData.images[0]) {
      toast.error(lang === 'ar' ? 'ارفع صورة واكتب اسم المنتج الأول' : 'Upload image and enter name first');
      return;
    }
    try {
      setDescLoading(true);
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3005'}/ai/product-desc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: formData.images[0] || '', productName: formData.nameEn || formData.nameAr })
      });
      const data = await res.json();
      if (data.description || data.shortDesc) {
        setFormData(prev => ({
          ...prev,
          descriptionEn: data.description || prev.descriptionEn,
          descriptionAr: data.descriptionAr || data.description || prev.descriptionAr
        }));
        toast.success(lang === 'ar' ? 'تم إنشاء الوصف' : 'Description generated');
      }
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل إنشاء الوصف' : 'Failed to generate description');
    } finally {
      setDescLoading(false);
    }
  };

  const handleSmartCategory = async () => {
    if (!formData.nameEn && !formData.nameAr) {
      toast.error(lang === 'ar' ? 'اكتب اسم المنتج الأول' : 'Enter product name first');
      return;
    }
    try {
      setCatLoading(true);
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3005'}/ai/smart-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: formData.nameEn || formData.nameAr, imageBase64: formData.images[0] || '' })
      });
      const data = await res.json();
      if (data.category) {
        const matched = categories?.find((c: any) => c.nameEn?.toLowerCase().includes(data.category?.toLowerCase()) || c.id === data.category);
        if (matched) {
          setFormData(prev => ({ ...prev, categoryId: matched.id }));
          if (data.confidence === 'low') toast.error(lang === 'ar' ? 'تأكد من القسم الصح' : 'Low confidence, verify category');
          else toast.success(lang === 'ar' ? 'تم اختيار القسم' : 'Category selected');
        } else {
          toast.error('Suggested category not found');
        }
      }
    } catch (err) {
      toast.error('Failed to suggest category');
    } finally {
      setCatLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!formData.nameAr && !formData.descriptionAr) {
      toast.error('Enter Arabic text first');
      return;
    }
    try {
      setTranslateLoading(true);
      const fetchTrans = async (text: string) => {
        const r = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3005'}/ai/translate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: 'en' })
        });
        return (await r.json()).translatedText || (await r.json()).text;
      };
      
      const newForm = { ...formData };
      if (formData.nameAr) newForm.nameEn = await fetchTrans(formData.nameAr) || formData.nameEn;
      if (formData.descriptionAr) newForm.descriptionEn = await fetchTrans(formData.descriptionAr) || formData.descriptionEn;
      
      setFormData(newForm);
      toast.success(lang === 'ar' ? 'تمت الترجمة' : 'Translated successfully');
    } catch (err) {
      toast.error('Translation failed');
    } finally {
      setTranslateLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        vendorCategoryId: formData.categoryId, // Map to DB column
        variations: formData.type === 'variable' ? generatedVariants : []
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success(lang === 'ar' ? 'تم التحديث بنجاح' : 'Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success(lang === 'ar' ? 'تمت الإضافة بنجاح' : 'Product created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/${deleteId}`);
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted successfully');
      fetchData();
    } catch (err: any) {
      toast.error('Error deleting product');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    (p.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) || p.nameAr?.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-in fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {lang === 'ar' ? 'إدارة المنتجات' : 'Products Management'}
        </h1>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsBulkImportOpen(true)} className="h-10 px-4 text-xs bg-slate-800 hover:bg-slate-700">
            <Upload size={16} className="mr-2" />
            {lang === 'ar' ? 'استيراد جماعي' : 'Bulk Import'}
          </Button>
          <Button onClick={() => handleOpenModal()} className="h-10 px-4 text-xs">
            <Plus size={16} />
            {lang === 'ar' ? 'إضافة منتج' : 'Add Product'}
          </Button>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl flex-1">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder={lang === 'ar' ? 'ابحث عن منتج...' : 'Search products...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-bold"
            />
          </div>
          
          <select 
            value={filterDept} 
            onChange={e => { setFilterDept(e.target.value); setFilterCat(''); }} 
            className="input-field max-w-[200px]"
          >
            <option value="">{lang === 'ar' ? 'كل الأقسام' : 'All Departments'}</option>
            {departments?.map((d: any) => (
              <option key={d.id} value={d.id}>{lang === 'ar' ? d.nameAr : d.nameEn}</option>
            ))}
          </select>

          {filterDept && (
            <select 
              value={filterCat} 
              onChange={e => setFilterCat(e.target.value)} 
              className="input-field max-w-[200px]"
            >
              <option value="">{lang === 'ar' ? 'كل التصنيفات' : 'All Categories'}</option>
              {filterCategories?.map((c: any) => (
                <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.nameEn}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase tracking-widest text-[10px]">
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'القسم' : 'Category'}</th>
                  <th className="pb-3 px-4 font-black">{lang === 'ar' ? 'السعر' : 'Price'}</th>
                  <th className="pb-3 px-4 font-black text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                    <td className="py-4 px-4 font-bold flex items-center gap-3">
                      <div className="w-10 h-10 bg-background rounded-lg border flex items-center justify-center overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-text-muted" />
                        )}
                      </div>
                      <div>
                        <div>{lang === 'ar' ? product.nameAr : product.nameEn}</div>
                        <div className="text-[10px] text-text-muted font-normal">{product.slug}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {product.vendorCategory?.nameEn || product.department?.nameEn || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-primary">
                      ${product.basePrice}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-muted text-xs uppercase font-bold">
                      {lang === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <h2 className="text-xl font-black uppercase mb-6 text-glow-primary">
                {editingProduct ? (lang === 'ar' ? 'تعديل منتج' : 'Edit Product') : (lang === 'ar' ? 'منتج جديد' : 'New Product')}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Basic Info */}
                <div className="bg-surface/50 p-4 rounded-xl border border-border/50">
                  <h3 className="text-sm font-black uppercase mb-4 text-primary">1. Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Name (EN)</label>
                      <input required type="text" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Name (AR)</label>
                      <input required type="text" value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} className="input-field" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Descriptions</label>
                    {(selectedCategoryData?.aiAutoTranslate || true) && (
                      <button type="button" onClick={handleTranslate} disabled={translateLoading} className="flex items-center gap-1 text-[10px] text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition-colors font-bold">
                        {translateLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        {lang === 'ar' ? 'ترجم تلقائياً' : 'Auto Translate'}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <textarea placeholder="Description (EN)" value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} className="input-field min-h-[100px]" />
                    <textarea placeholder="Description (AR)" value={formData.descriptionAr} onChange={e => setFormData({...formData, descriptionAr: e.target.value})} className="input-field min-h-[100px]" />
                  </div>
                  
                  <div className="mt-2 flex justify-end">
                    {(selectedCategoryData?.aiAutoDescription || true) && (
                      <button type="button" onClick={handleAutoDescription} disabled={descLoading} className="flex items-center gap-1 text-[10px] bg-secondary/10 text-secondary hover:bg-secondary/20 px-3 py-1.5 rounded-md transition-colors font-bold">
                        {descLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {lang === 'ar' ? 'اكتب الوصف تلقائياً' : 'Auto Generate Description'}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Slug</label>
                      <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Image Upload</label>
                      <div className="flex gap-2 items-start">
                        <div className="relative flex-1">
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="h-10 bg-surface border border-dashed border-primary/50 rounded-xl flex items-center justify-center text-text-muted text-xs gap-2">
                            <Upload size={14} /> Upload Product Image
                          </div>
                        </div>
                        {formData.images[0] && (
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-border">
                            <img src={formData.images[0]} alt="preview" className="w-full h-full object-cover" />
                            {bgRemoving && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 size={14} className="text-white animate-spin" /></div>}
                          </div>
                        )}
                      </div>
                      {(selectedCategoryData?.aiBackgroundRemover || true) && formData.images[0] && (
                        <button type="button" onClick={handleRemoveBg} disabled={bgRemoving} className="mt-2 w-full flex justify-center items-center gap-1 text-[10px] text-primary bg-primary/5 hover:bg-primary/10 px-2 py-1.5 rounded-md transition-colors font-bold">
                          {bgRemoving ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                          {lang === 'ar' ? 'إزالة الخلفية تلقائياً' : 'Auto Remove Background'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Taxonomy Selection */}
                <div className="bg-surface/50 p-4 rounded-xl border border-border/50 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black uppercase text-primary">2. Categorization</h3>
                    {(departments?.find((d:any)=>d.id === formData.departmentId)?.aiSmartCategory || true) && (
                      <button type="button" onClick={handleSmartCategory} disabled={catLoading} className="flex items-center gap-1 text-[10px] bg-secondary/10 text-secondary hover:bg-secondary/20 px-3 py-1.5 rounded-md transition-colors font-bold">
                        {catLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {lang === 'ar' ? 'اقترح القسم تلقائياً' : 'Suggest Category'}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Department</label>
                      <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value, categoryId: '', subCategoryId: ''})} className="input-field">
                        <option value="">Select Department</option>
                        {departments?.map((d: any) => <option key={d.id} value={d.id}>{d.nameEn}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Category</label>
                      <select required disabled={!formData.departmentId || catsLoading} value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value, subCategoryId: ''})} className="input-field">
                        <option value="">Select Category</option>
                        {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Sub Category</label>
                      <select disabled={!formData.categoryId || subCatsLoading} value={formData.subCategoryId} onChange={e => setFormData({...formData, subCategoryId: e.target.value})} className="input-field">
                        <option value="">Select Sub Category</option>
                        {subCategories?.map((s: any) => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Product Type & Pricing */}
                <div className="bg-surface/50 p-4 rounded-xl border border-border/50">
                  <h3 className="text-sm font-black uppercase mb-4 text-primary">3. Pricing & Inventory</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Product Type</label>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="input-field">
                        <option value="simple">Simple Product</option>
                        <option value="variable">Variable Product (Variants)</option>
                        <option value="digital">Digital Product</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Base Price</label>
                      <input required type="number" step="0.01" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} className="input-field" />
                    </div>
                  </div>
                  
                  {formData.type === 'simple' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">SKU</label>
                        <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Stock</label>
                        <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="input-field" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Dynamic Attributes & Variants (Only if variable) */}
                {formData.type === 'variable' && attributes && attributes.length > 0 && (
                  <div className="bg-surface/50 p-4 rounded-xl border border-border/50 border-l-4 border-l-secondary">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black uppercase text-secondary">4. Dynamic Variants Generator</h3>
                      <Button type="button" onClick={handleGenerateVariants} className="h-8 text-[10px] bg-secondary hover:bg-secondary/80">Generate Variant Matrix</Button>
                    </div>
                    
                    {generatedVariants.length > 0 && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-background text-text-muted">
                              <th className="p-2 text-left">Attributes</th>
                              <th className="p-2 text-left">SKU</th>
                              <th className="p-2 text-left">Price</th>
                              <th className="p-2 text-left">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedVariants.map((v, idx) => (
                              <tr key={idx} className="border-t border-border">
                                <td className="p-2 font-bold text-primary">
                                  {Object.entries(v.attributes).map(([key, val]) => `${key}: ${val}`).join(', ')}
                                </td>
                                <td className="p-2">
                                  <input type="text" value={v.sku} onChange={(e) => {
                                    const newV = [...generatedVariants];
                                    newV[idx].sku = e.target.value;
                                    setGeneratedVariants(newV);
                                  }} className="input-field h-8 text-xs" />
                                </td>
                                <td className="p-2">
                                  <input type="number" value={v.price} onChange={(e) => {
                                    const newV = [...generatedVariants];
                                    newV[idx].price = e.target.value;
                                    setGeneratedVariants(newV);
                                  }} className="input-field h-8 text-xs" />
                                </td>
                                <td className="p-2">
                                  <input type="number" value={v.stock} onChange={(e) => {
                                    const newV = [...generatedVariants];
                                    newV[idx].stock = parseInt(e.target.value);
                                    setGeneratedVariants(newV);
                                  }} className="input-field h-8 text-xs w-20" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4 justify-end pt-4 border-t border-border">
                  <Button type="button" onClick={() => setIsModalOpen(false)} className="bg-transparent border border-border text-text-main hover:bg-surface">
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit">
                    {lang === 'ar' ? 'حفظ المنتج' : 'Save Product'}
                  </Button>
                </div>
              </form>
            </div>
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
            <h3 className="text-2xl font-black uppercase tracking-tighter text-glow-primary mb-2">
              {lang === 'ar' ? 'تأكيد مسح المنتج' : 'Confirm Deletion'}
            </h3>
            <p className="text-text-muted text-sm font-bold uppercase tracking-widest mb-8 leading-relaxed">
              {lang === 'ar' 
                ? 'هل أنت متأكد من مسح هذا المنتج تماماً من النظام؟ هذا الإجراء لا يمكن التراجع عنه.' 
                : 'Are you sure you want to completely delete this product? This action cannot be undone.'}
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

      <BulkImportModal 
        isOpen={isBulkImportOpen} 
        onClose={() => setIsBulkImportOpen(false)} 
        onSuccess={() => fetchData()} 
      />
    </div>
  );
};

export default VendorProductsPage;
