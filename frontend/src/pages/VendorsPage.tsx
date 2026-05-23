import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { vendorService } from '../services/vendorService';
import Layout from '../components/layout/Layout';
import WavyDivider from '../components/ui/WavyDivider';

const VendorsPage: React.FC = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [vendors, setVendors] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await vendorService.getVendors();
        setVendors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  return (
    <Layout>
      {/* 🚀 VENDORS HERO */}
      <section 
        className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden transition-all duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=2000')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-normal text-white uppercase tracking-tighter drop-shadow-2xl">
            {t('common.stores')}
          </h1>
          <div className="h-1 w-24 bg-primary mx-auto mt-6 shadow-glow-primary" />
        </div>
        <WavyDivider color="fill-background" position="bottom" />
      </section>

      <div className="bg-background relative z-10 py-20 px-4 md:px-8 max-w-7xl mx-auto min-h-[60vh]">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.map((vendor, idx) => (
              <div 
                key={vendor.id}
                onClick={() => navigate(`/vendors/${vendor.slug}`)}
                className="glass group relative p-8 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-primary/50 cursor-pointer animate-in fade-in slide-in-from-bottom-8 overflow-hidden"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Decorative Gradient Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/20" />
                
                <div className="relative flex flex-col h-full">
                  {/* Store Logo/Avatar */}
                  <div className="w-20 h-20 rounded-[24px] bg-slate-100 flex items-center justify-center text-primary mb-8 overflow-hidden border border-slate-200 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {vendor.logoUrl ? (
                      <img src={vendor.logoUrl} alt={lang === 'ar' ? vendor.storeNameAr : vendor.storeNameEn} className="w-full h-full object-cover" />
                    ) : (
                      <img src="/cobra-logo-dark.png" alt="Cobra Logo" className="w-full h-full object-contain p-2" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150'; }} />
                    )}
                  </div>

                  <h3 className="text-2xl font-black uppercase tracking-tight text-[#0F172A] mb-3">
                    {lang === 'ar' ? vendor.storeNameAr : vendor.storeNameEn}
                  </h3>

                  <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-8 flex-grow">
                    {(lang === 'ar' ? vendor.descriptionAr : vendor.descriptionEn) || (lang === 'ar' ? 'مرحبًا بك في متجرنا المتميز الذي يقدم اختيارات مدروسة للعملاء المميزين.' : 'Welcome to our premium storefront presenting curated selections for the modern connoisseur.')}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                      {t('common.view_store')}
                    </span>
                    <ArrowRight size={20} className="text-slate-300 transform group-hover:translate-x-2 group-hover:text-primary transition-all duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VendorsPage;
