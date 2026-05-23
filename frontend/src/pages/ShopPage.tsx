import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useTranslation } from '../hooks/useTranslation';
import ProductCard from '../components/ui/ProductCard';
import WavyDivider from '../components/ui/WavyDivider';
import FlashSaleCountdown from '../components/ui/FlashSaleCountdown';
import { Filter, ChevronDown, LayoutGrid, List, Search, Loader2, Camera, X } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';

const ShopPage: React.FC = () => {
  const { t, lang, formatPrice } = useTranslation();
  const [searchParams] = useSearchParams();
  const departmentParam = searchParams.get('department');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [visualSearchModalOpen, setVisualSearchModalOpen] = useState(false);
  const [visualSearchLoading, setVisualSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({ id: departmentParam || 'All', nameAr: 'الكل', nameEn: 'All' });
  const [categories, setCategories] = useState<{ id: string, nameAr: string, nameEn: string }[]>([]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const itemsPerPage = 40;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getDepartments();
        setCategories(data);
        if (departmentParam) {
          const matched = data.find((d: any) => d.id === departmentParam);
          if (matched) setSelectedCategory(matched);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, [departmentParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let finalQueryString = searchQuery;
        if (searchQuery && (selectedCategory as any).aiSmartSearch !== false) {
          try {
            const res = await Promise.race([
              fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3005'}/ai/smart-search`, {
                method: 'POST',
                body: JSON.stringify({ query: searchQuery }),
                headers: { 'Content-Type': 'application/json' }
              }),
              new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))
            ]);
            const data = await (res as Response).json();
            if (data.keywords && data.keywords.length > 0) {
              finalQueryString = data.keywords.join(' ');
            }
          } catch (err) {
            console.warn('Smart search failed or timed out, falling back to original query');
          }
        }

        const query: any = {
          page: currentPage,
          limit: itemsPerPage,
          search: finalQueryString || undefined,
          department: selectedCategory.id !== 'All' ? selectedCategory.id : undefined,
          maxPrice: maxPrice || undefined,
          sort: sortBy
        };
        const data = await productService.getProducts(query);
        if (currentPage === 1) {
          setProducts(data.items);
        } else {
          setProducts(prev => {
            const newItems = data.items.filter((item: any) => !prev.some(p => p.id === item.id));
            return [...prev, ...newItems];
          });
        }
        setTotalProducts(data.total);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, searchQuery ? 500 : 0);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, selectedCategory, maxPrice, sortBy]);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleVisualSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Max 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setVisualSearchModalOpen(false);
      setLoading(true);
      setVisualSearchLoading(true);
      try {
        const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3005'}/ai/visual-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ image: reader.result })
        });
        const data = await res.json();
        
        if (data.keywords && data.keywords.length > 0) {
          setSearchQuery(data.keywords[0]);
          setCurrentPage(1);
          toast.success(lang === 'ar' ? `تم البحث عن: ${data.keywords[0]}` : `Searching for: ${data.keywords[0]}`);
        } else {
          toast.error(lang === 'ar' ? 'لم يتم التعرف على المنتج' : 'Product not recognized');
        }
      } catch (err) {
        console.error('Visual search failed', err);
        toast.error('Visual search failed');
      } finally {
        setVisualSearchLoading(false);
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getHeroImage = () => {
    const catName = selectedCategory.nameEn;
    switch(catName) {
      case 'Electronics': return 'https://images.unsplash.com/photo-1550745165-9bc0b252729f?q=80&w=1200';
      case 'Fashion': return 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200';
      case 'Accessories': return 'https://images.unsplash.com/photo-1512113569143-1466a9a08236?q=80&w=1200';
      default: return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200';
    }
  };

  return (
    <Layout>
      {/* 🚀 CATEGORY HERO */}
      <section 
        className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden transition-all duration-1000"
        style={{
          backgroundImage: `url(${getHeroImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-normal text-white uppercase tracking-tighter drop-shadow-2xl">
            {selectedCategory.id === 'All' ? t('common.shop') : (lang === 'ar' ? selectedCategory.nameAr : selectedCategory.nameEn)}
          </h1>
          <div className="h-1 w-24 bg-primary mx-auto mt-6 shadow-glow-primary" />
        </div>
        <WavyDivider color="fill-background" position="bottom" />
      </section>

      <div className="bg-background relative z-10 py-20 px-4 md:px-8 max-w-7xl mx-auto min-h-[80vh]">
        {/* Header/Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.3em]">
            {t('common.showing')} {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalProducts)} {t('common.of')} {totalProducts} {t('common.results')}
          </p>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-96 flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
              <input 
                type="text" 
                placeholder={t('common.search')} 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-primary transition-all shadow-sm"
              />
              {loading && !visualSearchLoading && <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />}
              
              <button 
                onClick={() => document.getElementById('visual-search-input')?.click()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors p-1.5 bg-primary/10 rounded-lg"
                title={lang === 'ar' ? 'البحث بالصور' : 'Visual Search'}
              >
                {visualSearchLoading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input 
                type="file" 
                id="visual-search-input" 
                accept="image/*" 
                className="hidden" 
                onChange={handleVisualSearch}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:w-52 xl:w-56 flex-shrink-0 space-y-8">
            {/* Category Filter */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-main mb-6 border-l-4 border-primary pl-4">
                {lang === 'ar' ? 'الأقسام' : 'Categories'}
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={() => { setSelectedCategory({ id: 'All', nameAr: 'الكل', nameEn: 'All' }); setCurrentPage(1); }}
                  className={`w-full text-start px-4 py-3 rounded-xl transition-all text-sm font-medium ${selectedCategory.id === 'All' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {lang === 'ar' ? 'الكل' : 'All'}
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                    className={`w-full text-start px-4 py-3 rounded-xl transition-all text-sm font-medium ${selectedCategory.id === cat.id ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {lang === 'ar' ? cat.nameAr : cat.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-main mb-6 border-l-4 border-primary pl-4">
                {lang === 'ar' ? 'السعر' : 'Price Range'}
              </h3>
              <div className="space-y-6">
                <input 
                  type="range" 
                  min="0" 
                  max="50000" 
                  step="500"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(parseInt(e.target.value)); setCurrentPage(1); }}
                  className="w-full accent-primary h-1.5 bg-slate-100 rounded-full appearance-none outline-none cursor-pointer" 
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-widest">{formatPrice(0)}</div>
                  <div className="text-xs font-bold text-primary uppercase tracking-widest">{formatPrice(maxPrice)}</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-grow">
            {/* Sorting Header */}
            <div className="flex items-center justify-between mb-10 bg-white border border-slate-100 px-8 py-4 rounded-2xl shadow-sm relative group/sort">
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">
                {t('common.sort_by')}
              </div>
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-transparent pr-8 pl-4 py-2 text-xs font-bold uppercase tracking-widest outline-none cursor-pointer text-text-main hover:text-primary transition-colors"
                >
                  <option value="featured" className="text-black">{t('common.featured')}</option>
                  <option value="name-asc" className="text-black">{t('common.name_asc')}</option>
                  <option value="name-desc" className="text-black">{t('common.name_desc')}</option>
                  <option value="price-low" className="text-black">{t('common.price_low')}</option>
                  <option value="price-high" className="text-black">{t('common.price_high')}</option>
                  <option value="rating-high" className="text-black">{t('common.rating_high')}</option>
                  <option value="best-selling" className="text-black">{t('common.best_selling')}</option>
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
              </div>
            </div>

            {loading && products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Arsenal...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* ⚡ Flash Sale Banner */}
                {currentPage === 1 && products.length > 0 && (
                  <FlashSaleCountdown 
                    endTime={new Date(new Date().getTime() + 1000 * 60 * 60 * 5 + 1000 * 60 * 23)} // 5 hours 23 mins from now
                  />
                )}
                
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={{
                      id: p.id,
                      name: lang === 'ar' ? p.nameAr : p.nameEn,
                      price: Number(p.basePrice || p.price),
                      image: p.images?.[0]?.imageUrl || p.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400',
                      rating: Number(p.rating ?? 5.0),
                      category: lang === 'ar' ? (p.vendorCategory?.nameAr || p.department?.nameAr || 'قسم') : (p.vendorCategory?.nameEn || p.department?.nameEn || 'Category'),
                      slug: p.slug || p.id,
                      discount: p.discount || (currentPage === 1 ? 15 : undefined) // Mock discount for flash sale
                    }} />
                  ))}
                  {products.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center">
                      <Search size={48} className="mx-auto text-slate-200 mb-6" />
                      <p className="text-text-muted font-medium uppercase tracking-widest">{lang === 'ar' ? 'لا توجد منتجات مطابقة' : 'No products found'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pagination Implementation */}
            {products.length < totalProducts && (
              <div className="mt-24 pt-12 border-t border-slate-100 flex justify-center gap-3">
                <button 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={loading}
                  className="px-8 h-12 rounded-2xl border border-slate-200 bg-white font-bold text-text-muted uppercase tracking-widest hover:border-primary hover:text-primary transition-all disabled:opacity-50"
                >
                  {loading ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...') : (lang === 'ar' ? 'مشاهدة المزيد' : 'Load More')}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
