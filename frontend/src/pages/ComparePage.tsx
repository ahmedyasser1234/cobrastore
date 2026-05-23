import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useCompareStore } from '../store/useCompareStore';
import Navbar from '../components/layout/Navbar';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import { useCartStore } from '../store/useCartStore';
import toast from 'react-hot-toast';

const ComparePage: React.FC = () => {
  const { lang } = useTranslation();
  const { items, removeItem, clearItems } = useCompareStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.nameEn,
      price: product.price,
      quantity: 1,
      image: product.image
    });
    toast.success(lang === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart');
  };

  return (
    <div className="min-h-screen bg-surface pb-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar opaque />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 mt-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-glow-primary">
              {lang === 'ar' ? 'مقارنة المنتجات' : 'Compare Products'}
            </h1>
            <p className="text-text-muted text-sm font-bold mt-1">
              {lang === 'ar' ? `لديك ${items.length} منتجات للمقارنة` : `You have ${items.length} products to compare`}
            </p>
          </div>
          {items.length > 0 && (
            <Button onClick={clearItems} variant="outline" className="text-red-500 border-red-500/20 hover:bg-red-500/10">
              {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-border rounded-[32px] p-16 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-text-main mb-4">{lang === 'ar' ? 'لا توجد منتجات للمقارنة' : 'No products to compare'}</h2>
            <Link to="/shop">
              <Button className="px-8 h-12 uppercase tracking-widest inline-flex items-center gap-2">
                {lang === 'ar' ? 'تصفح المتجر' : 'Browse Shop'}
                {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-[32px] shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-50 border-b border-border min-w-[200px] text-text-muted uppercase tracking-widest text-xs font-black">
                    {lang === 'ar' ? 'المواصفات' : 'Features'}
                  </th>
                  {items.map((item) => (
                    <th key={item.id} className="p-6 bg-white border-b border-l border-border min-w-[250px] relative">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="absolute top-4 right-4 bg-red-50 text-red-500 p-1.5 rounded-full hover:bg-red-100 transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <div className="flex flex-col items-center text-center pt-4">
                        <img src={item.image} alt={item.nameEn} className="w-32 h-32 object-cover rounded-2xl mb-4 border border-border" />
                        <h3 className="text-lg font-black text-text-main leading-tight mb-2">
                          {lang === 'ar' ? item.nameAr : item.nameEn}
                        </h3>
                        <p className="text-xl font-bold text-primary mb-4">{item.price} {lang === 'ar' ? 'جنيه' : 'EGP'}</p>
                        <Button onClick={() => handleAddToCart(item)} className="w-full uppercase text-xs tracking-widest font-bold">
                          {lang === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 bg-slate-50 border-b border-border font-bold text-sm uppercase tracking-widest text-slate-600">
                    {lang === 'ar' ? 'القسم' : 'Category'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 border-b border-l border-border font-medium text-text-main text-center">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {item.category}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 bg-slate-50 border-b border-border font-bold text-sm uppercase tracking-widest text-slate-600">
                    {lang === 'ar' ? 'التقييم' : 'Rating'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 border-b border-l border-border font-medium text-text-main text-center text-yellow-500 font-bold">
                      {item.rating} ★
                    </td>
                  ))}
                </tr>
                {/* Dynamically extract common attributes if they existed, for now placeholder */}
                <tr>
                  <td className="p-4 bg-slate-50 border-b border-border font-bold text-sm uppercase tracking-widest text-slate-600">
                    {lang === 'ar' ? 'اللون' : 'Color'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 border-b border-l border-border font-medium text-text-main text-center text-sm">
                      {item.attributes?.color || '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
