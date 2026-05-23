import React, { useState } from 'react';
import { Camera, X, Loader2, Upload, Search } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import Button from './Button';
import ProductCard from './ProductCard';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const VisualSearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { lang } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResults([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/visual-search', { imageBase64: image });
      setResults(res.data.products || []);
      if (res.data.products?.length === 0) {
        toast(lang === 'ar' ? 'لم نجد منتجات مشابهة' : 'No similar products found', { icon: '🔍' });
      }
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل البحث بالصورة' : 'Visual search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-[32px] w-full max-w-4xl max-h-[90vh] shadow-2xl relative flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Camera size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter">
              {lang === 'ar' ? 'البحث بالصورة' : 'Visual Search'}
            </h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-red-500 bg-surface p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!image ? (
            <div className="relative border-2 border-dashed border-primary/30 bg-primary/5 rounded-[32px] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors h-64">
              <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <Upload className="text-primary mb-4" size={32} />
              <span className="text-lg font-black text-slate-800 uppercase tracking-widest">{lang === 'ar' ? 'ارفع صورة للبحث' : 'Upload an image to search'}</span>
              <span className="text-xs text-slate-400 font-bold mt-2">(PNG, JPG)</span>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative w-full md:w-64 aspect-square rounded-2xl overflow-hidden shadow-md shrink-0 border border-border">
                  <img src={image} alt="Search Query" className="w-full h-full object-cover" />
                  <button onClick={() => {setImage(null); setResults([]);}} className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-red-500 shadow-sm hover:bg-white">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-4 py-4">
                  <h3 className="text-lg font-black text-text-main uppercase tracking-widest">
                    {lang === 'ar' ? 'ابحث عن منتجات مشابهة لهذه الصورة' : 'Find products similar to this image'}
                  </h3>
                  <Button onClick={handleSearch} disabled={loading} className="w-fit px-8 h-12 uppercase tracking-widest shadow-glow-primary">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Search size={18} className="mr-2" /> {lang === 'ar' ? 'بحث الآن' : 'Search Now'}</>}
                  </Button>
                </div>
              </div>

              {results.length > 0 && (
                <div>
                  <h4 className="text-sm font-black text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                    {lang === 'ar' ? 'النتائج المشابهة' : 'Similar Results'}
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px]">{results.length}</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualSearchModal;
