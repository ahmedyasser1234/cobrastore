import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Zap, ShieldCheck, Truck, 
  Headphones, Laptop, Shirt, Watch, Star,
  TrendingUp, Sparkles, Store, ShoppingBag,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import ProductCard from '../components/ui/ProductCard';
import WavyDivider from '../components/ui/WavyDivider';
import api from '../services/api';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useAuthStore } from '../store/useAuthStore';

const HomePage: React.FC = () => {
  const { t, lang, dir } = useTranslation();

  const [bestSellers, setBestSellers] = React.useState<any[]>([]);
  const [newArrivals, setNewArrivals] = React.useState<any[]>([]);
  const [topVendors, setTopVendors] = React.useState<any[]>([]);
  const [vendorPage, setVendorPage] = React.useState(0);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ products: '50K+', vendors: '1.2K', rating: '4.9★' });
  const { recentlyViewed } = useRecentlyViewed();
  const { isAuthenticated } = useAuthStore();
  const [aiRecommendations, setAiRecommendations] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (isAuthenticated) {
      api.get('/ai/recommendations')
        .then(res => setAiRecommendations(res.data.products || res.data || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [bestSellersRes, newArrivalsRes, vendorsRes, deptsRes, statsRes] = await Promise.all([
          api.get('/products?isFeatured=true&limit=4'),
          api.get('/products?limit=4'),
          api.get('/vendors/public'),
          api.get('/departments'),
          api.get('/public/stats').catch(() => ({ data: { products: '50K+', vendors: '1.2K', rating: '4.9★' } }))
        ]);
        
        setBestSellers(bestSellersRes.data.items || bestSellersRes.data || []);
        setNewArrivals(newArrivalsRes.data.items || newArrivalsRes.data || []);
        setTopVendors(vendorsRes.data || []);
        
        // Map departments - show ALL of them with real data
        const FALLBACK_IMAGES = [
          'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800',
          'https://images.unsplash.com/photo-1490481651871-ab68624d5517?q=80&w=800',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
          'https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=800',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
          'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=800',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800',
        ];
        const depts = deptsRes.data || [];
        const mappedCategories = depts.map((d: any, idx: number) => ({
          id: d.id,
          slug: d.slug,
          nameAr: d.nameAr,
          nameEn: d.nameEn,
          image: d.imageUrl || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
          count: d.productCount ?? 0,
        }));
        setCategories(mappedCategories.length ? mappedCategories : [
          { nameAr: 'إلكترونيات', nameEn: 'Electronics', image: FALLBACK_IMAGES[0], count: 0 },
          { nameAr: 'أزياء', nameEn: 'Fashion', image: FALLBACK_IMAGES[1], count: 0 },
          { nameAr: 'إكسسوارات', nameEn: 'Accessories', image: FALLBACK_IMAGES[2], count: 0 },
        ]);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to load home data', err);
      }
    };
    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    if (num === null || num === undefined) return '0';
    if (num === 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <Layout>
      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* 🌌 AMBIENT BACKGROUND */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px] animate-pulse-glow" />
          <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] bg-secondary/2 rounded-full blur-[150px] animate-pulse-glow delay-1000" />
        </div>

        {/* 🚀 HERO SECTION */}
        <section
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: 'url(/cobra_store_hero_concept.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Overlay: subtle tint so image shows fully */}
          <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(180deg, rgba(10,18,35,0.28) 0%, rgba(10,18,35,0.20) 55%, rgba(10,18,35,0.55) 100%)' }} />

          {/* Content */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-12 py-32 flex flex-col items-center text-center">

            {/* Headline — gradient on both words */}
            <h1
              className="tracking-tighter leading-[1.3] mb-6 block py-4"
              style={{
                fontSize: 'clamp(2.3rem, 7vw, 5.2rem)',
                fontWeight: 400,
                textShadow: '0 4px 50px rgba(0,0,0,0.6)',
                background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 50%, #0891b2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('hero.title_part1')}{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 60%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 30px rgba(34,211,238,0.7))',
                }}
              >
                {t('hero.title_part2')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-slate-200 font-semibold max-w-xl mx-auto mb-12 leading-relaxed" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <Link to="/shop">
                <button
                  className="group inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-base tracking-widest uppercase transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                    color: '#0f172a',
                    boxShadow: '0 0 30px rgba(34,211,238,0.45)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 50px rgba(34,211,238,0.70)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(34,211,238,0.45)')}
                >
                  {t('common.shop_now')}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/register">
                <button className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-base tracking-widest uppercase border border-white/35 text-white/90 hover:border-cyan-400/70 hover:text-white hover:bg-white/10 transition-all duration-300">
                  {lang === 'ar' ? 'كن تاجراً' : 'Become a Vendor'}
                </button>
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-8 sm:gap-14">
              {[
                { val: stats.products, label: lang === 'ar' ? 'منتج' : 'Products' },
                { val: stats.vendors, label: lang === 'ar' ? 'متجر' : 'Vendors' },
                { val: stats.rating, label: lang === 'ar' ? 'تقييم' : 'Rating' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xl font-medium text-white" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>{s.val}</span>
                  <span className="text-xs font-medium text-slate-300 uppercase tracking-[0.25em] mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <WavyDivider color="fill-white" position="bottom" />
        </section>

        {/* 📦 CATEGORIES SECTION */}
        <section className="py-32 relative bg-white">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20">
              <div className="text-center md:text-left mb-8 md:mb-0">
                <h2 className="text-4xl md:text-5xl font-normal heading-gradient uppercase flex items-center gap-4 justify-center md:justify-start">
                  <TrendingUp className="text-primary" />
                  {t('common.top_categories')}
                </h2>
                <div className="h-1.5 w-32 bg-primary mt-4 rounded-full" />
              </div>
              <Link to="/shop" className="text-xs font-bold uppercase tracking-[0.3em] text-text-muted hover:text-primary transition-all flex items-center gap-2 group">
                {t('common.view_all_sectors')}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className={`grid gap-8 ${
              categories.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' :
              categories.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' :
              categories.length <= 6 ? 'grid-cols-2 sm:grid-cols-3' :
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}>
              {categories.map((cat, i) => (
                <Link
                  to={`/shop?department=${cat.id || ''}`}
                  key={cat.id || i}
                  className={`group relative rounded-[3rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700 block ${
                    categories.length <= 3 ? 'h-[450px]' : 'h-[320px]'
                  }`}
                >
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
                    <div className="p-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <span className="px-4 py-2 text-[10px] font-medium text-white uppercase tracking-widest">{t('common.view_all_sectors')}</span>
                    </div>
                    <h3 className="text-2xl font-medium text-white uppercase tracking-tighter mb-2 transform transition-transform duration-700 group-hover:-translate-y-2">{lang === 'ar' ? cat.nameAr : cat.nameEn}</h3>
                    <p className="text-sm font-medium text-primary uppercase tracking-[0.2em] opacity-80">{cat.count} {t('home.units_found')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 🤖 AI RECOMMENDATIONS SECTION */}
        {aiRecommendations.length > 0 && (
          <section className="py-20 relative bg-primary/5 border-t border-primary/10">
            <div className="max-w-7xl mx-auto px-8 lg:px-16">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-white border border-primary/20 flex items-center justify-center text-primary shadow-glow-primary">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-normal heading-gradient uppercase">
                    {lang === 'ar' ? 'مقترح لك خصيصاً' : 'Recommended For You'}
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">
                    {lang === 'ar' ? 'بناءً على نشاطك بالذكاء الاصطناعي' : 'Based on your activity via AI'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {aiRecommendations.map((product) => (
                  <ProductCard key={product.id} product={{
                    id: product.id,
                    name: lang === 'ar' ? product.nameAr : product.nameEn,
                    price: Number(product.basePrice || product.price),
                    image: product.images?.[0]?.imageUrl || product.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400',
                    rating: Number(product.rating ?? 5.0),
                    category: lang === 'ar' ? (product.category?.nameAr || product.department?.nameAr || 'قسم') : (product.category?.nameEn || product.department?.nameEn || 'Category'),
                    slug: product.slug || product.id,
                    discount: product.discount
                  }} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 🔥 BEST SELLERS SECTION */}
        <section className="py-40 relative bg-slate-950">
          <WavyDivider color="fill-white" position="top" flip />
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="text-center mb-24">
              <span className="text-primary text-[10px] font-medium uppercase tracking-[0.5em] mb-4 block">{t('home.crowd_favorites')}</span>
              <h2 className="text-5xl md:text-7xl font-normal heading-gradient uppercase">{t('home.best_sellers')}</h2>
              <div className="h-1 w-20 bg-primary mx-auto mt-6" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={{
                  id: product.id,
                  name: lang === 'ar' ? product.nameAr : product.nameEn,
                  price: Number(product.basePrice || product.price),
                  image: product.images?.[0]?.imageUrl || product.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400',
                  rating: Number(product.rating ?? 5.0),
                  category: lang === 'ar' ? (product.category?.nameAr || product.department?.nameAr || 'قسم') : (product.category?.nameEn || product.department?.nameEn || 'Category'),
                  slug: product.slug || product.id,
                  discount: product.discount
                }} />
              ))}
            </div>
          </div>
          
          <WavyDivider color="fill-white" position="bottom" />
        </section>

        {/* ✨ NEW ARRIVALS SECTION */}
        <section className="py-32 relative bg-white">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
             <div className="flex flex-col md:flex-row items-center justify-between mb-24">
              <div className="text-center md:text-left mb-8 md:mb-0">
                <h2 className="text-4xl md:text-6xl font-normal heading-gradient uppercase">{t('home.new_arrivals')}</h2>
                <p className="text-primary text-[10px] font-medium uppercase tracking-[0.4em] mt-4 opacity-80">{t('home.fresh_drops')}</p>
              </div>
              <Button variant="secondary" className="rounded-2xl px-10">{t('home.explore_feed')}</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={{
                  id: product.id,
                  name: lang === 'ar' ? product.nameAr : product.nameEn,
                  price: Number(product.basePrice || product.price),
                  image: product.images?.[0]?.imageUrl || product.image || 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=400',
                  rating: Number(product.rating ?? 5.0),
                  category: lang === 'ar' ? (product.category?.nameAr || product.department?.nameAr || 'قسم') : (product.category?.nameEn || product.department?.nameEn || 'Category'),
                  slug: product.slug || product.id,
                  discount: product.discount
                }} />
              ))}
            </div>
          </div>
        </section>

        {/* 🏪 TOP STORES SECTION */}
        <section className="py-40 relative bg-[#0f172a]">
          <WavyDivider color="fill-white" position="top" flip />
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="text-center mb-24">
              <h2 className="text-5xl md:text-7xl font-normal heading-gradient uppercase">{t('home.top_rated_stores')}</h2>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.3em] mt-4 opacity-70">{t('home.elite_marketplace_desc')}</p>
            </div>
            
            {/* Vendor Slider */}
            <div>
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {topVendors.slice(vendorPage * 3, vendorPage * 3 + 3).map((vendor) => (
                  <Link to={`/vendors/${vendor.slug}`} key={vendor.id} className="group p-1 bg-white/5 rounded-[3rem] hover:bg-gradient-to-br hover:from-primary/20 hover:to-secondary/20 transition-all duration-500 shadow-sm border border-white/5 block">
                    <div className="bg-slate-900 p-10 rounded-[2.9rem] flex flex-col items-center text-center shadow-inner">
                      <img src={vendor.storeLogo || vendor.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'} alt={vendor.storeName} className="w-24 h-24 rounded-[2rem] object-cover mb-8 grayscale group-hover:grayscale-0 transition-all duration-700 border-2 border-slate-800 group-hover:border-primary/50 shadow-2xl" />
                      <h3 className="text-2xl font-medium text-white uppercase mb-4 tracking-tight group-hover:text-primary transition-colors">{vendor.storeName}</h3>
                      <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-slate-800/50 rounded-2xl border border-white/5">
                        <Star className="text-primary fill-primary" size={14} />
                        <span className="font-semibold text-white">{Number(vendor.rating ?? 0).toFixed(1)}</span>
                        <span className="h-4 w-[1px] bg-white/10 mx-2" />
                        <span className="text-xs font-medium text-slate-400 uppercase">{formatNumber(vendor.followers ?? 0)} {lang === 'ar' ? 'متابع' : 'Followers'}</span>
                      </div>
                      <Button variant="secondary" className="w-full rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">{t('home.visit_showroom')}</Button>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Navigation Row: both arrows + dots always shown when > 3 vendors */}
              {topVendors.length > 3 && (
                <div className="flex items-center justify-center gap-5 mt-12">
                  <button
                    onClick={() => setVendorPage(p => dir === 'rtl' ? Math.min(Math.ceil(topVendors.length / 3) - 1, p + 1) : Math.max(0, p - 1))}
                    disabled={dir === 'rtl' ? vendorPage >= Math.ceil(topVendors.length / 3) - 1 : vendorPage === 0}
                    className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center transition-all hover:bg-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.ceil(topVendors.length / 3) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setVendorPage(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${vendorPage === i ? 'bg-primary w-8' : 'bg-white/20 w-2 hover:bg-white/40'}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setVendorPage(p => dir === 'rtl' ? Math.max(0, p - 1) : Math.min(Math.ceil(topVendors.length / 3) - 1, p + 1))}
                    disabled={dir === 'rtl' ? vendorPage === 0 : vendorPage >= Math.ceil(topVendors.length / 3) - 1}
                    className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center transition-all hover:bg-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <WavyDivider color="fill-white" position="bottom" />
        </section>

        {/* 🎁 OFFERS SECTION */}
        <section className="py-32 bg-background">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 rounded-[4rem] p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-16 border border-slate-100 shadow-2xl">
              {/* Slanted Background Image */}
              <div 
                className="absolute top-0 bottom-0 w-3/4 hidden lg:block pointer-events-none transition-all duration-700"
                style={{
                  [dir === 'rtl' ? 'right' : 'left']: '-5%',
                  backgroundImage: 'url(/cta-bg.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  clipPath: dir === 'rtl' ? 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 0, 70% 100%, 0 100%)',
                  opacity: 0.3,
                  mixBlendMode: 'multiply'
                }}
              />
              
              <div className="relative z-10 text-text-main max-w-4xl text-center md:text-start flex-1">
                <span className="inline-block px-5 py-2 bg-primary/10 text-primary text-[10px] font-medium rounded-full mb-8 uppercase tracking-widest border border-primary/20">Limited Edition Opportunity</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal heading-gradient mb-8 leading-[1.2] tracking-tight uppercase">
                  {t('home.join_ecosystem')}
                </h2>
                <p className="text-text-muted font-medium mb-12 text-lg leading-relaxed max-w-2xl">{t('home.scale_business_desc')}</p>
                <Link to="/register">
                  <Button className="px-16 h-20 rounded-2xl text-xl font-medium shadow-glow-primary">{t('home.apply_access')}</Button>
                </Link>
              </div>
              <div className="relative z-10 bg-white/50 backdrop-blur-xl p-12 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col items-center">
                <Store size={48} className="text-primary mb-8" />
                <span className="text-text-muted text-sm font-bold uppercase tracking-[0.4em] mb-4">{t('home.launch_timer')}</span>
                <div className="flex gap-6">
                  {[
                    { val: '14', unit: t('home.days') },
                    { val: '08', unit: t('home.hrs') },
                    { val: '45', unit: t('home.mins') }
                  ].map((t, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="text-5xl font-medium text-text-main leading-none">{t.val}</span>
                      <span className="text-xs font-medium text-text-muted uppercase tracking-widest mt-2">{t.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ⭐ TESTIMONIALS */}
        <section className="py-44 relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/10">
          <WavyDivider color="fill-white" position="top" flip />
          <div className="max-w-7xl mx-auto px-8 lg:px-16 text-center">
            <h2 className="text-4xl md:text-6xl font-medium heading-gradient mb-24 uppercase tracking-tight">{t('home.trust_experience')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[1, 2, 3].map((reviewer) => (
                <div key={reviewer} className="group relative p-12 rounded-[3rem] bg-white border border-slate-200 hover:border-primary/30 transition-all duration-500 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-primary mb-8 flex justify-center gap-1.5 transition-all">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={20} fill="currentColor" />)}
                  </div>
                  <p className="text-text-main text-lg leading-relaxed font-bold mb-10 tracking-tight">
                    "{t('home.testimonial_text')}"
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary" />
                    <div className="text-left">
                      <div className="font-extrabold text-text-main text-lg tracking-tight">Marcus Vane</div>
                      <div className="text-[10px] text-primary uppercase font-bold tracking-[0.2em]">{t('home.reviewer_role')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <WavyDivider color="fill-white" position="bottom" />
        </section>

        {/* 🛡️ TRUST BADGES */}
        <section className="py-28 relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: <Truck />, title: t('home.badges.flash_delivery'), desc: t('home.badges.flash_desc') },
              { icon: <ShieldCheck />, title: t('home.badges.encrypted_payments'), desc: t('home.badges.encrypted_desc') },
              { icon: <Headphones />, title: t('home.badges.intel_247'), desc: t('home.badges.intel_desc') },
              { icon: <Zap />, title: t('home.badges.smart_ecosystem'), desc: t('home.badges.smart_desc') }
            ].map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center md:items-start gap-6 group">
                <div className="p-5 bg-white shadow-md rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-slate-100">
                  {React.cloneElement(badge.icon as React.ReactElement, { size: 40 })}
                </div>
                <div>
                  <div className="font-medium heading-gradient text-lg uppercase tracking-tight mb-2">{badge.title}</div>
                  <div className="text-xs text-slate-700 font-bold uppercase tracking-widest leading-loose">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 👁️ RECENTLY VIEWED (If any) */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <section className="py-20 relative bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-8 lg:px-16">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600">
                  <Laptop size={20} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                  {lang === 'ar' ? 'شاهدتها مؤخراً' : 'Recently Viewed'}
                </h3>
              </div>
              
              <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar scroll-smooth snap-x">
                {recentlyViewed.map((product: any) => (
                  <div key={product.id} className="min-w-[280px] max-w-[280px] snap-start">
                    <ProductCard product={{
                      id: product.id,
                      name: lang === 'ar' ? product.nameAr : product.nameEn,
                      price: product.price,
                      image: product.image,
                      rating: 5,
                      category: lang === 'ar' ? 'سجل المشاهدة' : 'History',
                      slug: product.id,
                      discount: product.discount
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
