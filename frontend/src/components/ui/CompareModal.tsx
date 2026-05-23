import React from 'react';
import { X, Trash2, ShoppingCart } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCompareStore } from '../../store/useCompareStore';
import { useCartStore } from '../../store/useCartStore';
import toast from 'react-hot-toast';

const CompareModal: React.FC = () => {
  const { t, lang } = useTranslation();
  const { items, isCompareOpen, setCompareOpen, removeItem, clearItems } = useCompareStore();
  const { addItem: addToCart } = useCartStore();

  if (!isCompareOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black uppercase tracking-widest">{lang === 'ar' ? 'مقارنة المنتجات' : 'Compare Products'}</h2>
          <div className="flex items-center gap-4">
            {items.length > 0 && (
              <button 
                onClick={clearItems}
                className="text-red-500 hover:text-red-600 text-sm font-bold flex items-center gap-1 transition-colors"
              >
                <Trash2 size={16} />
                {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
              </button>
            )}
            <button 
              onClick={() => setCompareOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-6 bg-slate-50/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <X size={32} className="text-slate-300" />
              </div>
              <p className="font-medium uppercase tracking-widest">{lang === 'ar' ? 'لا توجد منتجات للمقارنة' : 'No products to compare'}</p>
            </div>
          ) : (
            <div className="min-w-max flex gap-4 h-full">
              {/* Properties Column */}
              <div className="w-32 flex flex-col pt-[180px] shrink-0 font-bold text-sm text-slate-500 uppercase tracking-wider space-y-4">
                <div className="h-12 flex items-center border-b border-slate-200">{lang === 'ar' ? 'السعر' : 'Price'}</div>
                <div className="h-12 flex items-center border-b border-slate-200">{lang === 'ar' ? 'التقييم' : 'Rating'}</div>
                <div className="h-12 flex items-center border-b border-slate-200">{lang === 'ar' ? 'القسم' : 'Category'}</div>
                <div className="h-12 flex items-center"></div>
              </div>

              {/* Product Columns */}
              {items.map(item => (
                <div key={item.id} className="w-56 flex flex-col shrink-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur text-slate-400 hover:text-red-500 rounded-full z-10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="h-[180px] p-4 flex flex-col items-center justify-center border-b border-slate-100">
                    <img src={item.image} alt={item.nameEn} className="w-24 h-24 object-cover rounded-xl mb-3" />
                    <h3 className="font-bold text-sm text-center line-clamp-2 text-slate-800">
                      {lang === 'ar' ? item.nameAr : item.nameEn}
                    </h3>
                  </div>
                  <div className="p-4 space-y-4 flex-1">
                    <div className="h-12 flex items-center justify-center border-b border-slate-100 font-black text-primary">
                      {item.price} {lang === 'ar' ? 'ج.م' : 'EGP'}
                    </div>
                    <div className="h-12 flex items-center justify-center border-b border-slate-100 font-bold text-slate-700">
                      {item.rating} / 5.0
                    </div>
                    <div className="h-12 flex items-center justify-center border-b border-slate-100 font-medium text-slate-500 text-sm text-center">
                      {item.category}
                    </div>
                    <div className="h-12 flex items-center justify-center mt-auto">
                      <button 
                        onClick={() => {
                          addToCart({
                            id: item.id,
                            nameEn: item.nameEn,
                            nameAr: item.nameAr,
                            price: item.price,
                            image: item.image,
                            quantity: 1
                          });
                          toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added to cart');
                        }}
                        className="w-full bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl py-3 hover:bg-primary transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={14} />
                        {lang === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty Slots */}
              {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, idx) => (
                <div key={idx} className="w-56 flex flex-col shrink-0 border-2 border-dashed border-slate-200 rounded-2xl items-center justify-center bg-slate-50/50 text-slate-400">
                  <div className="font-medium uppercase tracking-widest text-xs text-center px-4">
                    {lang === 'ar' ? 'أضف منتج للمقارنة' : 'Add product to compare'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
