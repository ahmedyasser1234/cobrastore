import React, { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import { Trash2, ArrowRight, ShoppingBag, ChevronRight, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import WavyDivider from '../components/ui/WavyDivider';
import { useCartStore } from '../store/useCartStore';

const CartPage: React.FC = () => {
  const { t, lang, formatPrice } = useTranslation();
  const { items, loading, updateQuantity, removeItem, fetchCart, clearCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = items.length > 0 ? 250 : 0;
  const total = subtotal + shipping;

  if (loading && items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing with Arsenal...</p>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#020617] pt-24 pb-12">
          {/* 🌌 Sophisticated Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full" />
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          </div>

          <div className="relative z-10 w-full max-w-xl mx-auto px-6">
            <div className="bg-slate-900/30 border border-white/5 backdrop-blur-3xl rounded-[4rem] p-12 md:p-16 text-center shadow-3xl relative overflow-hidden">
               {/* Decorative internal glow */}
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl -mr-24 -mt-24 rounded-full" />
               
               <div className="relative mb-12 inline-flex items-center justify-center w-28 h-28 bg-slate-800/40 rounded-[2.5rem] border border-white/10 shadow-2xl group mx-auto">
                  <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <ShoppingBag size={48} className="text-primary relative z-10 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute -top-2 -right-2 w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white text-[11px] font-black border-4 border-[#020617] shadow-lg">0</div>
               </div>

               <div className="space-y-4 mb-12">
                 <h2 className="text-[10px] font-black tracking-[0.8em] text-primary/50 uppercase animate-pulse">Logistics Status: Empty</h2>
                 <h1 className="text-4xl md:text-6xl font-normal text-white uppercase tracking-tighter leading-none">
                    {lang === 'ar' ? 'السلة ' : 'Arsenal '}
                    <span className="gradient-text font-black">{lang === 'ar' ? 'فارغة' : 'Empty'}</span>
                 </h1>
               </div>
               
               <p className="text-slate-400 text-sm md:text-base mb-14 leading-relaxed font-medium max-w-sm mx-auto">
                 {lang === 'ar' 
                   ? 'قاعدة البيانات تشير إلى عدم وجود معدات مختارة. توجه إلى المخزن لتجهيز مجموعتك التكتيكية.'
                   : 'Tactical database indicates no items selected. Head to the armory to equip your gear and prepare for deployment.'}
               </p>

               <Link to="/shop" className="block">
                 <Button className="w-full py-7 h-20 rounded-3xl text-xs font-black uppercase tracking-[0.4em] shadow-glow-primary hover:shadow-[0_0_40px_rgba(34,211,238,0.35)] group transition-all duration-500">
                    <span className="flex items-center justify-center gap-4">
                      {lang === 'ar' ? 'استكشاف المتجر' : 'Browse Armory'}
                      <ArrowRight size={18} className={`group-hover:translate-x-2 transition-transform duration-500 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
                    </span>
                 </Button>
               </Link>
            </div>
            
            <Link to="/" className="mt-12 flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-primary transition-all group">
              <span className="w-12 h-[1px] bg-slate-800 group-hover:bg-primary/50 transition-all" />
              {lang === 'ar' ? 'العودة للرئيسية' : 'Return to Base'}
              <span className="w-12 h-[1px] bg-slate-800 group-hover:bg-primary/50 transition-all" />
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* 🚀 CART HERO */}
      <section className="relative h-[30vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-[#020617] pt-20">
        <div className="absolute inset-0 opacity-20">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center">
          <h2 className="text-[10px] font-black tracking-[0.6em] text-primary/60 uppercase mb-4 animate-pulse">Operational Summary</h2>
          <h1 className="text-4xl md:text-7xl font-normal text-white uppercase tracking-tighter mb-4">
             {t('common.cart')}
          </h1>
          <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
             <span className="w-8 h-[1px] bg-slate-800" />
             <span>{items.length} {lang === 'ar' ? 'منتجات مختارة' : 'Items Selected'}</span>
             <span className="w-8 h-[1px] bg-slate-800" />
          </div>
        </div>
      </section>

      <div className="bg-slate-50/50 relative z-10 py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
            {/* Cart Items List */}
            <div className="xl:col-span-2 space-y-10">
              <div className="hidden md:grid grid-cols-6 gap-6 px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-200">
                <div className="col-span-3">{lang === 'ar' ? 'تفاصيل المنتج' : 'Product Profile'}</div>
                <div className="text-center">{lang === 'ar' ? 'السعر' : 'Unit Price'}</div>
                <div className="text-center">{lang === 'ar' ? 'الكمية' : 'Quantity'}</div>
                <div className="text-right">{lang === 'ar' ? 'المجموع' : 'Subtotal'}</div>
              </div>

              {items.map((item) => (
                <div key={item.id} className="group bg-white p-10 rounded-[3.5rem] border border-slate-100 grid grid-cols-1 md:grid-cols-6 gap-10 items-center transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:border-primary/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="md:col-span-3 flex items-center gap-10">
                    <div className="w-32 h-32 bg-slate-50 rounded-[2rem] overflow-hidden flex-shrink-0 border border-slate-100 p-2 group-hover:border-primary/20 transition-colors">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=200'} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-[1.5rem] group-hover:scale-110 transition-transform duration-1000" 
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-slate-900 group-hover:text-primary transition-colors mb-2 leading-tight">{item.name}</h3>
                      <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        {item.variationId ? 'Elite Variation' : 'Standard Edition'}
                      </p>
                      <button 
                        onClick={() => item.id && removeItem(item.id, item.productId, item.variationId)}
                        disabled={loading}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 flex items-center gap-3 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={14} className="group-hover:rotate-12 transition-transform" /> 
                        {lang === 'ar' ? 'إزالة من السلة' : 'Remove Pattern'}
                      </button>
                    </div>
                  </div>

                  <div className="flex md:block justify-between items-center text-center">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'السعر' : 'Price'}:</span>
                    <span className="font-black text-xl text-slate-900">{formatPrice(item.price)}</span>
                  </div>

                  <div className="flex md:block justify-between items-center text-center">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الكمية' : 'Qty'}:</span>
                    <div className="inline-flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1.5 mx-auto">
                      <button 
                        disabled={loading}
                        onClick={() => item.id && updateQuantity(item.id, item.productId, item.variationId, item.quantity - 1)} 
                        className="w-12 h-12 flex items-center justify-center hover:text-primary text-slate-900 font-bold rounded-xl hover:bg-white transition-all disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-black text-slate-900 text-lg">{item.quantity}</span>
                      <button 
                        disabled={loading}
                        onClick={() => item.id && updateQuantity(item.id, item.productId, item.variationId, item.quantity + 1)} 
                        className="w-12 h-12 flex items-center justify-center hover:text-primary text-slate-900 font-bold rounded-xl hover:bg-white transition-all disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex md:block justify-between items-center text-right">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'المجموع' : 'Total'}:</span>
                    <span className="font-black text-2xl text-primary tracking-tighter">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-8 pt-10">
              <Link to="/shop" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary flex items-center gap-3 group transition-all">
                <ArrowRight size={16} className={`group-hover:-translate-x-2 transition-transform ${lang === 'en' ? 'rotate-180' : ''}`} />
                {lang === 'ar' ? 'العودة للتسوق' : 'Back to Armory'}
              </Link>
              <button 
                onClick={clearCart}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 transition-colors"
              >
                {lang === 'ar' ? 'تفريغ السلة' : 'Erase All Patterns'}
              </button>
            </div>
          </div>

          {/* Checkout Summary */}
          <aside className="relative">
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 sticky top-32 shadow-xl shadow-slate-200/50">
              <h2 className="text-3xl font-normal text-slate-900 uppercase tracking-tighter mb-12 pb-8 border-b border-slate-100 flex items-center justify-between">
                 {t('common.cart_total')}
                 <ShieldCheck size={24} className="text-primary/40" />
              </h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.subtotal')}</span>
                  <span className="font-black text-xl text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.shipping')}</span>
                  <div className="text-right">
                    <span className="font-black text-xl text-green-500">{formatPrice(shipping)}</span>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">STANDARD DEPLOYMENT</p>
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-slate-100 mb-14 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                </div>
                
                <div className="flex justify-between items-end mb-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{t('common.total')}</span>
                  <span className="text-5xl font-black text-primary tracking-tighter drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] text-right">Includes all tactical taxes & fees</p>
              </div>

              <div className="space-y-6">
                <Link to="/checkout">
                  <Button className="w-full py-6 text-sm font-black tracking-[0.3em] uppercase h-20 shadow-glow-primary rounded-[2rem]">
                    {t('common.checkout')}
                    <ChevronRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-primary" />
                  Cobra Secure Protocol 2.0
                </div>
              </div>

              <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Pattern Code</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="COBRA2026" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold placeholder:text-slate-300" />
                </div>
              </div>
            </div>
          </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
