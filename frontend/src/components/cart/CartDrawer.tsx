import React, { useEffect, useRef } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const CartDrawer: React.FC = () => {
  const { 
    items, 
    isCartDrawerOpen, 
    closeCartDrawer, 
    updateQuantity, 
    removeItem, 
    loading 
  } = useCartStore();
  const { t, lang, formatPrice } = useTranslation();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCartDrawer();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeCartDrawer]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeCartDrawer();
      }
    };
    if (isCartDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Disable scroll when open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartDrawerOpen]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className={`fixed inset-0 z-[100] flex ${lang === 'ar' ? 'justify-start' : 'justify-end'} ${isCartDrawerOpen ? 'visible' : 'invisible'}`}>
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isCartDrawerOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={closeCartDrawer}
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-500 ease-out 
          ${isCartDrawerOpen ? 'translate-x-0' : (lang === 'ar' ? '-translate-x-full' : 'translate-x-full')}`}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <ShoppingBag size={22} className="text-primary" />
            {lang === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
            <span className="text-sm font-normal text-slate-400">({items.length})</span>
          </h2>
          <button 
            onClick={closeCartDrawer}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-900 flex items-center gap-2 text-sm font-medium"
          >
             {lang === 'ar' ? 'إغلاق' : 'Close'}
             <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                 <ShoppingBag size={40} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {lang === 'ar' ? 'لا توجد منتجات في سلة المشتريات.' : 'Your cart is empty'}
              </h3>
              <p className="text-slate-500 text-sm mb-8">
                {lang === 'ar' ? 'ابدأ بإضافة بعض المنتجات الرائعة إلى سلتك!' : 'Start adding some amazing products to your cart!'}
              </p>
              <Button 
                onClick={() => { closeCartDrawer(); navigate('/shop'); }}
                className="w-full"
              >
                {lang === 'ar' ? 'العودة الى المتجر' : 'Return to Shop'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate pr-4">{item.name}</h4>
                      <button 
                        onClick={() => item.id && removeItem(item.id, item.productId, item.variationId)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{item.variationId ? 'Elite Edition' : 'Standard'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                        <button 
                          onClick={() => item.id && updateQuantity(item.id, item.productId, item.variationId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-primary"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button 
                          onClick={() => item.id && updateQuantity(item.id, item.productId, item.variationId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-primary"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-500">{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="text-xl font-bold text-slate-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center mb-4">
              {lang === 'ar' ? 'يتم حساب الشحن والضرائب عند الدفع' : 'Shipping & taxes calculated at checkout'}
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/checkout" onClick={closeCartDrawer}>
                <Button className="w-full py-4 rounded-xl flex items-center justify-center gap-2">
                  {lang === 'ar' ? 'إتمام الشراء' : 'Checkout Now'}
                  <ArrowRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                </Button>
              </Link>
              <Link to="/cart" onClick={closeCartDrawer}>
                <button className="w-full py-3 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                  {lang === 'ar' ? 'عرض السلة كاملة' : 'View Full Cart'}
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
