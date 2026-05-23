import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { categoryService } from '../services/categoryService';
import Layout from '../components/layout/Layout';
import WavyDivider from '../components/ui/WavyDivider';

const DepartmentsPage: React.FC = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await categoryService.getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  return (
    <Layout>
      {/* 🚀 CATEGORY HERO */}
      <section 
        className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden transition-all duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-normal text-white uppercase tracking-tighter drop-shadow-2xl">
            {t('common.departments')}
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
            {departments.map((dept, idx) => (
              <div 
                key={dept.id}
                onClick={() => navigate(`/shop?department=${dept.id}`)}
                className="group relative h-[450px] rounded-[3rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700 block animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <img 
                  src={dept.imageUrl || 'https://images.unsplash.com/photo-1519389950473-acc7569d2951?q=80&w=2070'} 
                  alt={lang === 'ar' ? dept.nameAr : dept.nameEn}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
                  <div className="p-1.5 bg-primary/90 backdrop-blur-xl border border-primary rounded-2xl mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-lg shadow-primary/30">
                    <span className="px-4 py-2 text-[10px] font-medium text-white uppercase tracking-widest">
                      {t('common.view_all_sectors' as any) || (lang === 'ar' ? 'عرض جميع القطاعات' : 'View All Sectors')}
                    </span>
                  </div>
                  <h3 className="text-3xl font-medium text-white uppercase tracking-tighter mb-2 transform transition-transform duration-700 group-hover:-translate-y-2">
                    {lang === 'ar' ? dept.nameAr : dept.nameEn}
                  </h3>
                  <p className="text-sm font-medium text-primary uppercase tracking-[0.2em] opacity-80">
                    {dept.productCount ?? dept.categories?.length ?? 0} {lang === 'ar' ? 'عنصر' : 'Items'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DepartmentsPage;
