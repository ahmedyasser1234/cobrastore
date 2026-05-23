import React, { useState } from 'react';
import { ShoppingCart, Star, Heart, Eye, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import Button from './Button';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    category: string;
    slug: string;
    discount?: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t, lang, dir, formatPrice } = useTranslation();
  const [showQuickView, setShowQuickView] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const { toggleItem, hasItem } = useWishlistStore();
  const isFavorited = hasItem(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id);
  };

  return (
    <Link to={`/product/${product.slug}`} className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5 block">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        
        {/* Soft Ambient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {product.discount && (
          <div className="absolute top-5 left-5 bg-primary text-white text-xs font-medium px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg">
            -{product.discount}%
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-5 right-5 flex flex-col gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
          <button 
            onClick={handleToggleWishlist}
            className={`p-3 bg-white/80 backdrop-blur-xl border rounded-2xl transition-colors shadow-xl ${isFavorited ? 'text-primary border-primary/50' : 'text-text-main border-white/20 hover:text-primary'}`}
          >
            <Heart size={20} className={isFavorited ? 'fill-primary' : ''} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickView(true); }}
            className="p-3 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl text-text-main hover:text-primary transition-colors shadow-xl"
          >
            <Eye size={20} />
          </button>
        </div>

        {/* Floating Add Button */}
        <div className="absolute inset-x-5 bottom-5 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          <Button className="w-full h-14 rounded-2xl bg-primary text-white font-medium uppercase tracking-widest shadow-glow-primary" onClick={handleAddToCart}>
            {t('common.add_to_cart')}
          </Button>
        </div>
      </div>
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium tracking-[0.3em] text-primary/70 uppercase">{product.category}</span>
          {Number(product.rating || 0) > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
              <Star size={12} className="fill-primary text-primary" />
              <span className="text-xs font-medium text-text-main">{Number(product.rating || 0).toFixed(1)}</span>
            </div>
          )}
        </div>

        <h3 className="text-base font-semibold text-text-main mb-4 line-clamp-1 tracking-tight">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-3">
          <span className="text-xl font-bold text-text-main tracking-tight">{formatPrice(product.price)}</span>
          {product.discount && (
            <span className="text-xs text-text-muted line-through font-medium">
              {formatPrice(Math.round(product.price * 1.2))}
            </span>
          )}
        </div>
      </div>

      {showQuickView && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickView(false); }}
        >
          <div 
            className="bg-white rounded-[2rem] overflow-hidden max-w-4xl w-full flex flex-col md:flex-row shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickView(false); }} 
              className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl text-slate-500 hover:text-primary hover:bg-white transition-all z-10 shadow-sm"
            >
              <X size={20} />
            </button>
            <div className="md:w-1/2 relative bg-slate-50 h-64 md:h-auto">
               <img src={product.image} className="absolute inset-0 w-full h-full object-cover" alt={product.name} />
            </div>
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 mb-4">{product.category}</span>
               <h2 className="text-3xl font-medium text-slate-900 mb-6 leading-tight">{product.name}</h2>
               
               <div className="flex items-center gap-4 mb-8">
                  {Number(product.rating || 0) > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Star size={14} className="fill-primary text-primary" />
                      <span className="text-sm font-bold text-slate-700">{Number(product.rating || 0).toFixed(1)}</span>
                    </div>
                  )}
                  <div className="text-3xl font-normal text-primary tracking-tighter">{formatPrice(product.price)}</div>
               </div>
               
               <div className="mt-auto pt-8 border-t border-slate-100 flex gap-4">
                 <Button 
                   onClick={(e) => { handleAddToCart(e); setShowQuickView(false); }} 
                   className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-glow-primary"
                 >
                    {t('common.add_to_cart')}
                 </Button>
                 <Link 
                   to={`/product/${product.slug}`}
                   onClick={(e) => e.stopPropagation()}
                   className="h-14 px-8 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-2xl hover:border-primary hover:text-primary transition-all"
                 >
                   {lang === 'ar' ? 'التفاصيل' : 'Details'}
                 </Link>
               </div>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

export default ProductCard;
