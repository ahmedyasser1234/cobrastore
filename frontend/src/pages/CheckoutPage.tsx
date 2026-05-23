import React from 'react';
import Layout from '../components/layout/Layout';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import { MapPin, Truck, CreditCard, CheckCircle2, ChevronRight, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CheckoutPage: React.FC = () => {
  const { lang } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [cart, setCart] = React.useState<any>(null);
  const [pointsBalance, setPointsBalance] = React.useState(0);
  const [pointsToRedeem, setPointsToRedeem] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, loyaltyRes] = await Promise.all([
          api.get('/cart'),
          api.get('/loyalty/balance').catch(() => ({ data: { points: 0 } }))
        ]);
        setCart(cartRes.data);
        setPointsBalance(loyaltyRes.data.points || 0);
      } catch (err) {
        console.error('Failed to load checkout data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const subtotal = cart?.items?.reduce((sum: number, item: any) => sum + (item.variation ? item.variation.price : item.product.basePrice) * item.quantity, 0) || 0;
  const shipping = 50; // Mock shipping cost
  const pointsDiscount = pointsToRedeem * 0.05; // 100 points = 5 EGP
  const total = Math.max(0, subtotal + shipping - pointsDiscount);

  const steps = [
    { id: 1, name: 'Address', icon: <MapPin size={18} /> },
    { id: 2, name: 'Shipping', icon: <Truck size={18} /> },
    { id: 3, name: 'Payment', icon: <CreditCard size={18} /> },
    { id: 4, name: 'Review', icon: <CheckCircle2 size={18} /> }
  ];

  const nextStep = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      try {
        const sessionId = localStorage.getItem('sessionId') || 'temp-session';
        const res = await api.post('/orders', {
          shippingAddress: { country: 'Egypt', city: 'Cairo', street: '123 St' }, // Mocked for now
          pointsToRedeem
        }, { headers: { 'x-session-id': sessionId } });

        const paymentRes = await api.post('/payments/create-checkout-session', { orderId: res.data.id });
        window.location.href = paymentRes.data.url;
      } catch (err) {
        console.error('Checkout failed', err);
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-4xl font-medium heading-gradient uppercase tracking-tighter mb-12 text-center md:text-left">
          {lang === 'ar' ? 'إتمام الشراء' : 'Secure Checkout'}
        </h1>

        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                  currentStep >= step.id 
                  ? 'bg-primary text-white border-primary shadow-glow-primary scale-110' 
                  : 'bg-white text-text-muted border-slate-200 shadow-sm'
                }`}
              >
                {currentStep > step.id ? <CheckCircle2 size={24} /> : step.icon}
              </div>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${currentStep >= step.id ? 'text-primary' : 'text-text-muted'}`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <div className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50">
                <h2 className="text-2xl font-medium heading-gradient uppercase tracking-tighter mb-8 italic border-l-4 border-primary pl-4">Shipping Address</h2>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Full Name</label>
                    <input type="text" placeholder="John Doe" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Phone Number</label>
                    <input type="tel" placeholder="+20 123 456 7890" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Country</label>
                    <select className="input-field bg-background">
                      <option>Egypt</option>
                      <option>USA</option>
                      <option>UAE</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Street Address</label>
                    <input type="text" placeholder="House number and street name" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">City</label>
                    <input type="text" placeholder="Cairo" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Postal Code</label>
                    <input type="text" placeholder="12345" className="input-field" />
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Shipping Methods */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="glass p-8 md:p-12 rounded-[40px] border-border/50">
                  <h2 className="text-2xl font-medium heading-gradient uppercase tracking-tighter mb-8 italic border-l-4 border-primary pl-4">Delivery Speed</h2>
                  <div className="space-y-4">
                    {[
                      { id: 'standard', name: 'Standard Cobra Delivery', time: '3-5 Business Days', price: 'FREE' },
                      { id: 'express', name: 'Cobra Flash Express', time: 'Next Day Delivery', price: '$15.00' },
                      { id: 'priority', name: 'Priority Cyber Stealth', time: 'Instant Digital / 1-2 Days', price: '$25.00' }
                    ].map((method) => (
                      <label key={method.id} className="flex items-center gap-6 p-6 bg-background/50 border border-border rounded-3xl cursor-pointer hover:border-primary/50 transition-all group">
                        <input type="radio" name="shipping" value={method.id} defaultChecked={method.id === 'standard'} className="accent-primary w-5 h-5" />
                        <div className="flex-grow">
                          <div className="font-bold text-lg text-text-main group-hover:text-primary transition-colors">{method.name}</div>
                          <div className="text-xs text-text-muted uppercase tracking-widest">{method.time}</div>
                        </div>
                        <div className="font-extrabold text-xl text-primary">{method.price}</div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="glass p-8 md:p-12 rounded-[40px] border-border/50">
                <h2 className="text-2xl font-medium heading-gradient uppercase tracking-tighter mb-8 italic border-l-4 border-primary pl-4">Payment Intelligence</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  <button className="flex items-center gap-4 p-6 bg-primary/10 border-2 border-primary rounded-3xl text-primary font-extrabold uppercase tracking-widest text-sm shadow-glow-primary">
                    <CreditCard size={20} />
                    Credit Card
                  </button>
                  <button className="flex items-center gap-4 p-6 bg-surface border border-border rounded-3xl text-text-muted font-extrabold uppercase tracking-widest text-sm hover:border-primary/50 transition-all">
                    <CheckCircle2 size={20} />
                    Crypto Wallet
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Card Number</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" className="input-field" />
                    </div>
                    <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">CVV</label>
                    <input type="text" placeholder="123" className="input-field" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Final Review */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="glass p-8 rounded-[40px] border-border/50">
                  <h2 className="text-2xl font-medium heading-gradient uppercase tracking-tighter mb-6 italic border-l-4 border-primary pl-4">Review Order</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-border/30">
                      <div>
                        <div className="font-bold">Shipping to:</div>
                        <p className="text-sm text-text-muted">John Doe, 123 Cobra St, Cairo, Egypt</p>
                      </div>
                      <button onClick={() => setCurrentStep(1)} className="text-xs font-bold text-primary uppercase">Change</button>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-border/30">
                      <div>
                        <div className="font-bold">Delivery:</div>
                        <p className="text-sm text-text-muted">Cobra Flash Express (Next Day)</p>
                      </div>
                      <button onClick={() => setCurrentStep(2)} className="text-xs font-bold text-primary uppercase">Change</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8">
              <button 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className={`text-sm font-extrabold uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <ChevronRight size={16} className="rotate-180" />
                Go Back
              </button>
              <Button onClick={nextStep} size="lg" className="px-12 py-5 text-xl tracking-widest uppercase h-16 sm:w-auto">
                {currentStep === 4 ? 'Confirm Order' : 'Continue'}
                <ChevronRight size={24} />
              </Button>
            </div>
          </div>

          {/* Right Sidebar: Order Summary */}
          <aside className="space-y-6">
            <div className="glass p-8 rounded-[40px] border-border/50 sticky top-32">
              <div className="flex items-center gap-3 mb-8">
                <ShoppingCart className="text-primary" size={24} />
                <h3 className="text-lg font-medium heading-gradient uppercase tracking-tighter">Summary</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                {cart?.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-background border border-border rounded-xl flex-shrink-0 overflow-hidden">
                      <img src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=100'} alt="product" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="text-xs font-bold line-clamp-1">{item.product?.nameEn}</div>
                      <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-sm">{(item.variation ? item.variation.price : item.product?.basePrice * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 py-6 border-y border-border/50 mb-8">
                <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-widest">
                  <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>{subtotal.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-widest">
                  <span>{lang === 'ar' ? 'الشحن' : 'Shipping'}</span>
                  <span className="text-primary">+{shipping.toLocaleString()} EGP</span>
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-green-500 uppercase tracking-widest">
                    <span>{lang === 'ar' ? 'خصم النقاط' : 'Points Discount'}</span>
                    <span>-{pointsDiscount.toLocaleString()} EGP</span>
                  </div>
                )}
              </div>

              {/* Loyalty Points Section */}
              {pointsBalance > 0 && (
                <div className="bg-primary/5 p-4 border border-primary/20 rounded-2xl mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{lang === 'ar' ? 'نقاطك المتاحة' : 'Available Points'}</span>
                    <span className="text-sm font-black text-primary">{pointsBalance}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      max={pointsBalance} 
                      min={0}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Math.min(pointsBalance, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full bg-white border border-primary/30 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-center"
                      placeholder="0"
                    />
                    <Button onClick={() => setPointsToRedeem(pointsBalance)} size="sm" variant="outline" className="text-[10px] px-2 py-2">MAX</Button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-10">
                <span className="text-lg font-extrabold uppercase tracking-tighter text-text-muted">Total</span>
                <span className="text-3xl font-extrabold text-primary tracking-tighter">{total.toLocaleString()} EGP</span>
              </div>

              <div className="bg-white p-5 border border-slate-200 rounded-3xl flex items-center gap-4 shadow-sm">
                <ShieldCheck size={28} className="text-primary flex-shrink-0" />
                <div className="text-[10px] font-bold text-text-muted uppercase leading-relaxed">
                  Your payment is protected by military-grade encryption and Cobra Care.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
