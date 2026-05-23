import React, { useState } from 'react';
import { useDepartments, useCategories, useSubCategories, useAddCategory, useAddSubCategory, useAddDepartment, useUpdateDepartment } from '../../../hooks/api/useTaxonomy';
import { ChevronRight, ChevronLeft, ChevronDown, Plus, Edit2, Image as ImageIcon, Loader2, X, UploadCloud } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const TaxonomyTree: React.FC = () => {
  const { t, lang } = useTranslation();
  const { data: departments, isLoading } = useDepartments();

  const addDepartment = useAddDepartment();
  const updateDepartment = useUpdateDepartment();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    imageUrl: '',
    requiresSizes: false,
    requiresColors: false,
    aiBackgroundRemover: true,
    aiAutoDescription: true,
    aiSmartCategory: true,
    aiAutoTranslate: true,
    aiFakeReviewDetection: true,
    aiNegotiation: true,
    aiVirtualTryonClothes: false,
    aiVirtualTryonAccessories: false,
    aiSmartSearch: true,
    aiChatbotSupport: true,
  });

  const AI_FEATURES = [
    {
      key: 'aiBackgroundRemover',
      label: 'إزالة الخلفية تلقائياً',
      description: 'يشيل خلفية صور المنتجات ويخليها احترافية فوراً',
    },
    {
      key: 'aiAutoDescription',
      label: 'وصف المنتج تلقائي',
      description: 'يكتب وصف احترافي وتاجز SEO من صورة المنتج',
    },
    {
      key: 'aiSmartCategory',
      label: 'تصنيف ذكي للمنتجات',
      description: 'يحط المنتج في القسم الصح تلقائي',
    },
    {
      key: 'aiAutoTranslate',
      label: 'ترجمة تلقائية',
      description: 'عربي / إنجليزي / فرنساوي تلقائي',
    },
    {
      key: 'aiFakeReviewDetection',
      label: 'كشف الريفيوهات المزيفة',
      description: 'يحمي المشترين من الريفيوهات الوهمية',
    },
    {
      key: 'aiNegotiation',
      label: 'تفاوض AI على السعر',
      description: 'المشتري يتفاوض في الحدود اللي أنت تحددها',
    },
    {
      key: 'aiVirtualTryonClothes',
      label: 'قياس افتراضي للملابس',
      description: 'المشتري يجرب الهدوم قبل الشراء',
    },
    {
      key: 'aiVirtualTryonAccessories',
      label: 'قياس افتراضي للإكسسوارات',
      description: 'نظارات، ساعات، مجوهرات',
    },
    {
      key: 'aiSmartSearch',
      label: 'بحث ذكي بالعامية',
      description: 'المستخدم يكتب بالعامية والـ AI يفهم',
    },
    {
      key: 'aiChatbotSupport',
      label: 'دعم عملاء AI',
      description: 'يرد على العملاء تلقائي 24/7',
    },
  ];

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.nameEn) return;
    
    const slug = formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const mutation = editingDeptId ? updateDepartment : addDepartment;
    const payload = editingDeptId ? { id: editingDeptId, ...formData, slug } : { ...formData, slug };

    mutation.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        setEditingDeptId(null);
        setFormData({
          nameAr: '', nameEn: '', imageUrl: '', requiresSizes: false, requiresColors: false, 
          aiBackgroundRemover: true, aiAutoDescription: true, aiSmartCategory: true, 
          aiAutoTranslate: true, aiFakeReviewDetection: true, aiNegotiation: true, 
          aiVirtualTryonClothes: false, aiVirtualTryonAccessories: false, aiSmartSearch: true, aiChatbotSupport: true
        });
      }
    });
  };

  const openAddModal = () => {
    setEditingDeptId(null);
    setFormData({
      nameAr: '', nameEn: '', imageUrl: '', requiresSizes: false, requiresColors: false, 
      aiBackgroundRemover: true, aiAutoDescription: true, aiSmartCategory: true, 
      aiAutoTranslate: true, aiFakeReviewDetection: true, aiNegotiation: true, 
      aiVirtualTryonClothes: false, aiVirtualTryonAccessories: false, aiSmartSearch: true, aiChatbotSupport: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: any) => {
    setEditingDeptId(dept.id);
    setFormData({
      nameAr: dept.nameAr || '',
      nameEn: dept.nameEn || '',
      imageUrl: dept.imageUrl || '',
      requiresSizes: dept.requiresSizes || false,
      requiresColors: dept.requiresColors || false,
      aiBackgroundRemover: dept.aiBackgroundRemover ?? true,
      aiAutoDescription: dept.aiAutoDescription ?? true,
      aiSmartCategory: dept.aiSmartCategory ?? true,
      aiAutoTranslate: dept.aiAutoTranslate ?? true,
      aiFakeReviewDetection: dept.aiFakeReviewDetection ?? true,
      aiNegotiation: dept.aiNegotiation ?? true,
      aiVirtualTryonClothes: dept.aiVirtualTryonClothes || false,
      aiVirtualTryonAccessories: dept.aiVirtualTryonAccessories || false,
      aiSmartSearch: dept.aiSmartSearch ?? true,
      aiChatbotSupport: dept.aiChatbotSupport ?? true,
    });
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {lang === 'ar' ? 'إدارة الهيكلة والتصنيفات' : 'Taxonomy Management'}
        </h1>
        <button 
          onClick={openAddModal}
          className="bg-primary text-black px-4 py-2 font-bold text-xs uppercase tracking-widest rounded-lg flex items-center gap-2"
        >
          <Plus size={16} />
          {lang === 'ar' ? 'إضافة قسم' : 'Add Department'}
        </button>
      </div>

      <div className="glass p-6 rounded-2xl">
        <p className="text-xs text-text-muted mb-6 uppercase tracking-widest font-bold">
          {lang === 'ar' ? 'الهيكل الديناميكي للمنصة' : 'Global Platform Hierarchy'}
        </p>
        <div className="space-y-2">
          {departments?.map((dept: any) => (
            <DepartmentNode key={dept.id} dept={dept} lang={lang} onEdit={() => openEditModal(dept)} />
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[24px] p-6 animate-in zoom-in-95 duration-300 relative shadow-2xl border border-border h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 left-4 p-2 bg-surface hover:bg-gray-100 rounded-full text-text-muted hover:text-black transition-colors z-10">
              <X size={20} />
            </button>
            <div className="text-right mb-6 pr-2">
              <h3 className="text-xl font-black uppercase tracking-tighter text-glow-primary">
                {editingDeptId ? (lang === 'ar' ? 'تعديل القسم' : 'Edit Department') : (lang === 'ar' ? 'إضافة قسم جديد' : 'Add New Department')}
              </h3>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">
                {lang === 'ar' ? 'أدخل تفاصيل القسم والإعدادات الخاصة به' : 'Enter department details and settings'}
              </p>
            </div>
            
            <form onSubmit={handleAddDepartment} className="space-y-5 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">الاسم (عربي)</label>
                  <input required type="text" value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-xs focus:border-primary transition-all outline-none font-bold text-right" placeholder="أزياء" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">الاسم (إنجليزي)</label>
                  <input required type="text" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-xs focus:border-primary transition-all outline-none font-bold text-left" placeholder="Fashion" dir="ltr" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">رابط صورة القسم (URL)</label>
                <div className="flex gap-2">
                  <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="flex-1 bg-background border border-border rounded-xl p-3 text-xs focus:border-primary transition-all outline-none text-left" placeholder="https://example.com/image.jpg" dir="ltr" />
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 overflow-hidden">
                    {formData.imageUrl ? <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-text-muted" />}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-1">إعدادات المنتجات في هذا القسم</h4>
                
                <div className="space-y-2.5">
                  <label className={`flex items-start gap-3 cursor-pointer group p-2.5 rounded-lg border transition-all ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'} ${formData.requiresSizes ? 'bg-white border-primary/30 shadow-sm' : 'border-transparent hover:bg-gray-100/50'}`}>
                    <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 ${formData.requiresSizes ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 group-hover:border-primary/50'}`}>
                      {formData.requiresSizes && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-black text-gray-800 block">المنتجات تحتاج مقاسات</span>
                      <span className="text-[9px] text-gray-500 font-bold">مثل (S, M, L) للملابس أو (40, 41) للأحذية</span>
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.requiresSizes} onChange={e => setFormData({...formData, requiresSizes: e.target.checked})} />
                  </label>

                  <label className={`flex items-start gap-3 cursor-pointer group p-2.5 rounded-lg border transition-all ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'} ${formData.requiresColors ? 'bg-white border-primary/30 shadow-sm' : 'border-transparent hover:bg-gray-100/50'}`}>
                    <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 ${formData.requiresColors ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 group-hover:border-primary/50'}`}>
                      {formData.requiresColors && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-black text-gray-800 block">المنتجات تحتوي على ألوان متعددة</span>
                      <span className="text-[9px] text-gray-500 font-bold">سيتمكن التاجر من إضافة صور مستقلة لكل لون للمنتج</span>
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.requiresColors} onChange={e => setFormData({...formData, requiresColors: e.target.checked})} />
                  </label>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-1">ميزات الذكاء الاصطناعى الإضافية ✨</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AI_FEATURES.filter(f => f.key === 'aiVirtualTryonClothes' || f.key === 'aiVirtualTryonAccessories').map((feature) => (
                    <label key={feature.key} className={`flex items-start gap-3 cursor-pointer group p-2.5 rounded-lg border transition-all ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'} ${(formData as any)[feature.key] ? 'bg-white border-primary/30 shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                      <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 ${(formData as any)[feature.key] ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 group-hover:border-primary/50'}`}>
                        {(formData as any)[feature.key] && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-black text-gray-800 block">{feature.label}</span>
                        <span className="text-[8px] text-gray-500 font-bold leading-tight block mt-0.5">{feature.description}</span>
                      </div>
                      <input type="checkbox" className="hidden" checked={(formData as any)[feature.key]} onChange={e => setFormData({...formData, [feature.key]: e.target.checked})} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent border border-border hover:bg-surface text-text-main font-bold py-3 rounded-xl transition-all text-xs">
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={addDepartment.isPending || updateDepartment.isPending} className="flex-1 bg-primary hover:bg-primary/90 text-black font-black py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs">
                  {addDepartment.isPending || updateDepartment.isPending ? <Loader2 size={16} className="animate-spin" /> : (editingDeptId ? <Edit2 size={16} /> : <Plus size={16} />)}
                  {editingDeptId ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (lang === 'ar' ? 'حفظ وإضافة' : 'Save Department')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DepartmentNode = ({ dept, lang, onEdit }: { dept: any, lang: string, onEdit: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const { data: categories, isLoading } = useCategories(expanded ? dept.id : undefined);
  const addCategory = useAddCategory();

  const handleAddCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nameAr = window.prompt(lang === 'ar' ? 'اسم التصنيف (بالعربية):' : 'Category Name (Arabic):');
    if (!nameAr) return;
    const nameEn = window.prompt(lang === 'ar' ? 'اسم التصنيف (بالانجليزية):' : 'Category Name (English):');
    if (!nameEn) return;
    
    // Generate slug from English name
    const slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    addCategory.mutate({
      nameAr,
      nameEn,
      slug,
      departmentId: dept.id
    });
    setExpanded(true);
  };

  return (
    <div className="border border-border/50 rounded-xl bg-background overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={18} className="text-primary" /> : (lang === 'ar' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)}
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center overflow-hidden">
             {dept.imageUrl ? <img src={dept.imageUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-text-muted" />}
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-wide">{lang === 'ar' ? dept.nameAr : dept.nameEn}</h3>
            <span className="text-[10px] text-text-muted">{dept.slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }} 
            className="p-2 text-primary hover:bg-primary/10 rounded-lg"
            title={lang === 'ar' ? 'تعديل القسم' : 'Edit Department'}
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={handleAddCategory}
            disabled={addCategory.isPending}
            className="p-2 text-secondary hover:bg-secondary/10 rounded-lg disabled:opacity-50"
            title={lang === 'ar' ? 'إضافة تصنيف' : 'Add Category'}
          >
            {addCategory.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-surface/30 p-4 border-t border-border/50 pl-12">
          {isLoading ? <Loader2 size={16} className="animate-spin text-primary" /> : (
            <div className="space-y-2">
              {categories?.map((cat: any) => (
                <CategoryNode key={cat.id} cat={cat} lang={lang} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryNode = ({ cat, lang }: { cat: any, lang: string }) => {
  const [expanded, setExpanded] = useState(false);
  const { data: subCategories, isLoading } = useSubCategories(expanded ? cat.id : undefined);
  const addSubCategory = useAddSubCategory();

  const handleAddSubCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nameAr = window.prompt(lang === 'ar' ? 'اسم التصنيف الفرعي (بالعربية):' : 'SubCategory Name (Arabic):');
    if (!nameAr) return;
    const nameEn = window.prompt(lang === 'ar' ? 'اسم التصنيف الفرعي (بالانجليزية):' : 'SubCategory Name (English):');
    if (!nameEn) return;
    
    const slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    addSubCategory.mutate({
      nameAr,
      nameEn,
      slug,
      categoryId: cat.id
    });
    setExpanded(true);
  };

  return (
    <div className="border-l-2 border-primary/30 pl-4 py-2">
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-surface rounded-lg transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={14} className="text-secondary" /> : (lang === 'ar' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />)}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest">{lang === 'ar' ? cat.nameAr : cat.nameEn}</span>
            <div className="text-[10px] text-text-muted">{lang === 'ar' ? `السمات الإضافية: ${cat.attributes?.length || 0}` : `Dynamic Attributes: ${cat.attributes?.length || 0}`}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 text-primary hover:bg-primary/10 rounded-md"><Edit2 size={12} /></button>
          <button 
            onClick={handleAddSubCategory}
            disabled={addSubCategory.isPending}
            className="p-1 text-secondary hover:bg-secondary/10 rounded-md disabled:opacity-50"
            title={lang === 'ar' ? 'إضافة تصنيف فرعي' : 'Add SubCategory'}
          >
            {addSubCategory.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pl-6 space-y-2">
          {isLoading ? <Loader2 size={12} className="animate-spin text-secondary" /> : (
            subCategories?.map((subCat: any) => (
              <div key={subCat.id} className="flex items-center justify-between p-2 bg-background border border-border/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-border flex items-center justify-center bg-surface overflow-hidden">
                    {subCat.backgroundImage ? <img src={subCat.backgroundImage} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={10} className="text-text-muted" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{lang === 'ar' ? subCat.nameAr : subCat.nameEn}</span>
                </div>
                <button className="text-[9px] uppercase tracking-widest text-primary hover:underline">{lang === 'ar' ? 'تعديل الخلفية' : 'Edit Background'}</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TaxonomyTree;
