import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, ShoppingBag, Loader2, MapPin, Star, Share2, MessageCircle, Facebook, Instagram, Twitter, Globe } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { vendorService } from '../services/vendorService';
import { productService } from '../services/productService';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import WavyDivider from '../components/ui/WavyDivider';
import ProductCard from '../components/ui/ProductCard';

const VendorDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useTranslation();
  const [vendor, setVendor] = React.useState<any>(null);
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const vendorData = await vendorService.getVendorBySlug(slug);
        setVendor(vendorData);
        
        // Fetch products by this vendor
        const productRes = await productService.getProducts({ vendorId: vendorData.id });
        setProducts(productRes.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col min-h-screen bg-white pt-20">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-black heading-gradient uppercase mb-4">Store Not Found</h1>
            <p className="text-slate-500 mb-8 font-medium">The store you are looking for does not exist or has been relocated.</p>
            <Link to="/vendors">
              <Button>Explore All Stores</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow">
        {/* Banner Section */}
        <section 
          className={`relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden transition-all duration-1000 ${!vendor.bannerUrl ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-primary/30' : ''}`}
          style={vendor.bannerUrl ? {
            backgroundImage: `url('${vendor.bannerUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          } : {}}
        >
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
          
          <div className="relative z-10 text-center pb-10">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
              {lang === 'ar' ? 'المتجر' : 'Store'}
            </h1>
            <div className="h-1 w-24 bg-primary mx-auto mt-6 shadow-glow-primary" />
          </div>

          <WavyDivider color="fill-[#F8FAFC]" position="bottom" />
        </section>

        {/* Profile Info Overlay */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-24 relative z-30">
          <div className="glass rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-end justify-between">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                {/* Logo */}
                <div className="w-40 h-40 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden -mt-20 md:-mt-24 p-2">
                  <img 
                    src={vendor.logoUrl || `/cobra-logo-dark.png`} 
                    className={`w-full h-full ${vendor.logoUrl ? 'object-cover' : 'object-contain'}`}
                    alt={lang === 'ar' ? vendor.storeNameAr : vendor.storeNameEn}
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150'; }}
                  />
                </div>

                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] uppercase tracking-tight">
                      {lang === 'ar' ? vendor.storeNameAr : vendor.storeNameEn}
                    </h1>
                    <div className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[9px] font-black uppercase tracking-widest border border-green-500/20">
                      Verified
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-yellow-500" />
                      <span>{vendor.rating || '5.0'}</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag size={14} className="text-primary" />
                      <span>{products.length} {lang === 'ar' ? 'منتجات' : 'Items'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap justify-center md:justify-start">
                <Link to={`/chat?vendor=${vendor.id}`}>
                  <Button className="h-12 px-6 flex items-center gap-2 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all shadow-glow-primary">
                    <MessageCircle size={20} />
                    <span className="font-bold uppercase tracking-widest text-sm">{lang === 'ar' ? 'تواصل معنا' : 'Message'}</span>
                  </Button>
                </Link>
                <Button className="h-12 px-10 rounded-2xl font-black uppercase tracking-widest text-sm shadow-glow-primary">
                  {lang === 'ar' ? 'متابعة المتجر' : 'Follow Store'}
                </Button>
              </div>
            </div>

            {/* About Section */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t border-slate-100">
              <div className="lg:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">
                  {t('common.about_store')}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed text-lg">
                  {(lang === 'ar' ? vendor.descriptionAr : vendor.descriptionEn) || (lang === 'ar' ? 'مرحبًا بك في متجرنا المتميز. نحن حريصون على تقديم منتجات بأعلى جودة وخدمة استثنائية لعملائنا الكرام.' : 'Welcome to our premium storefront. We are dedicated to providing the highest quality products and exceptional service to our valued customers.')}
                </p>
              </div>
              
              <div className="flex flex-col gap-6">
                 {(vendor.facebookUrl || vendor.instagramUrl || vendor.twitterUrl || vendor.tiktokUrl) && (
                  <div>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                      {lang === 'ar' ? 'تواصل اجتماعي' : 'Social Feed'}
                    </h4>
                    <div className="flex gap-2">
                      {vendor.facebookUrl && (
                        <a href={vendor.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-600 text-slate-500 transition-colors cursor-pointer">
                          <Facebook size={16} />
                        </a>
                      )}
                      {vendor.instagramUrl && (
                        <a href={vendor.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 hover:bg-pink-100 hover:text-pink-600 text-slate-500 transition-colors cursor-pointer">
                          <Instagram size={16} />
                        </a>
                      )}
                      {vendor.twitterUrl && (
                        <a href={vendor.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-500 text-slate-500 transition-colors cursor-pointer">
                          <Twitter size={16} />
                        </a>
                      )}
                      {vendor.tiktokUrl && (
                        <a href={vendor.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 hover:bg-zinc-200 hover:text-zinc-900 text-slate-500 transition-colors cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Member Since</h4>
                    <span className="text-sm font-black text-[#0F172A] uppercase">January 2026</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Products */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] uppercase tracking-tighter">
                {t('common.store_products')}
              </h2>
              <div className="h-1 w-12 bg-primary mt-4 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={{
                id: product.id,
                name: lang === 'ar' ? (product.nameAr || product.name) : (product.nameEn || product.name),
                price: Number(product.basePrice || product.price || 0),
                image: product.images?.[0]?.imageUrl || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999',
                rating: product.rating || 5,
                category: product.department?.nameEn || product.category || 'Fashion',
                slug: product.slug,
                discount: product.compareAtPrice ? Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100) : undefined
              }} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20 glass rounded-3xl border border-dashed border-slate-300">
               <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">{lang === 'ar' ? 'هذا المتجر لا يحتوي على منتجات حالياً' : 'This store has no live listings yet.'}</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDetailPage;
