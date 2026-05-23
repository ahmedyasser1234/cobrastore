import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';
import { Star, ShieldCheck, Truck, RotateCcw, Award, Check, Share2, Heart, Search, Upload, Sparkles, AlertCircle, ShoppingCart, Loader2, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import VirtualTryOnModal from '../components/ui/VirtualTryOnModal';
import Navbar from '../components/layout/Navbar';
import ReviewSection from '../components/ui/ReviewSection';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useTranslation();
  
  const [product, setProduct] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addProduct, recentlyViewed } = useRecentlyViewed();
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'reviews'>('description');
  
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);

  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const [tryOnTab, setTryOnTab] = useState<'clothes' | 'accessories'>('clothes');

  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
  const [negotiationHistory, setNegotiationHistory] = useState<{role: string, content: string}[]>([]);
  const [negotiationInput, setNegotiationInput] = useState('');
  const [negotiationLoading, setNegotiationLoading] = useState(false);
  const [negotiationAgreedPrice, setNegotiationAgreedPrice] = useState<number | null>(null);

  const [reviewInput, setReviewInput] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleTryOnUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setTryOnImage(reader.result as string); setTryOnResult(null); };
      reader.readAsDataURL(file);
    }
  };

  const handleStartTryOn = async () => {
    if (!tryOnImage) return toast.error(lang === 'ar' ? 'ارفع صورة أولاً' : 'Upload photo first');
    setTryOnLoading(true);
    try {
      const endpoint = tryOnTab === 'clothes' ? '/virtual-tryon/generate' : '/virtual-tryon/accessories';
      const bodyPayload = tryOnTab === 'clothes' 
        ? { personImageBase64: tryOnImage, garmentImageBase64: product.images?.[0]?.url || '' }
        : { personImageBase64: tryOnImage, accessoryImageBase64: product.images?.[0]?.url || '' };
      
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3005'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (data.result_url || data.result_base64) {
        setTryOnResult(data.result_url || data.result_base64);
        toast.success(lang === 'ar' ? 'تم إنشاء الصورة بنجاح' : 'Try-on successful');
      } else throw new Error();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل التجربة' : 'Try-on failed');
    } finally {
      setTryOnLoading(false);
    }
  };

  const handleNegotiationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negotiationInput.trim()) return;
    
    const userOffer = negotiationInput;
    const newHistory = [...negotiationHistory, { role: 'user', content: userOffer }];
    setNegotiationHistory(newHistory);
    setNegotiationInput('');
    setNegotiationLoading(true);

    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3005'}/ai/negotiation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userOffer, productName: product.nameEn, listedPrice: product.basePrice, productId: product.id, history: newHistory })
      });
      const data = await res.json();
      setNegotiationHistory([...newHistory, { role: 'assistant', content: data.reply }]);
      if (data.agreedPrice) setNegotiationAgreedPrice(data.agreedPrice);
    } catch (err) {
      toast.error('Negotiation failed');
    } finally {
      setNegotiationLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewInput.trim()) return;
    setReviewLoading(true);
    toast.success(lang === 'ar' ? 'تم إضافة التقييم' : 'Review submitted');
    
    if (product.department?.aiFakeReviewDetection ?? true) {
      fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3005'}/ai/fake-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: reviewInput, productName: product.nameEn })
      }).then(r => r.json()).then(data => {
        if (data.isFake && data.confidence === 'high') {
          console.warn('Fake review detected in background and flagged.');
        }
      }).catch(err => console.error(err));
    }
    
    setReviewInput('');
    setReviewLoading(false);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
        
        // Also fetch AI suggestions based on category
        try {
          const aiRes = await api.get(`/products/${data.id}/ai-suggestions`);
          setAiSuggestions(aiRes.data);
        } catch (err) {
          console.warn("Could not fetch AI suggestions");
        }

        // Fetch recommendations
        try {
          const recRes = await api.get(`/products/${data.id}/recommendations`);
          setRecommendations(recRes.data);
        } catch (err) {
          console.warn("Could not fetch recommendations");
        }

        // Add to recently viewed
        addProduct({
          id: data.id,
          nameEn: data.nameEn,
          nameAr: data.nameAr,
          price: data.basePrice || data.price,
          image: data.images?.[0]?.imageUrl || data.image || '',
          slug: data.slug || data.id,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const isRtl = lang === 'ar';
  
  // Mock variants for the UI based on image
  const colors = ['#dc2626', '#000000', '#9ca3af']; // Red, Black, Gray
  const sizes = ['40', '41', '42', '43', '44', '45'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar opaque={true} />
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link to="/" className="hover:text-primary transition-colors">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
          <span>&gt;</span>
          <Link to="/shop" className="hover:text-primary transition-colors">{product.department?.nameAr || 'القسم'}</Link>
          <span>&gt;</span>
          <Link to="/shop" className="hover:text-primary transition-colors">{product.vendorCategory?.nameAr || 'التصنيف'}</Link>
          <span>&gt;</span>
          <span className="text-slate-600">{lang === 'ar' ? product.nameAr : product.nameEn}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-white shadow-sm group">
              {product.discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                  {lang === 'ar' ? `خصم ${product.discount}%` : `${product.discount}% OFF`}
                </div>
              )}
              <img 
                src={product.images?.[activeImage]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'} 
                alt="Product" 
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                {activeImage + 1} / {Math.max(product.images?.length || 1, 4)}
              </div>
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((idx) => {
                const imgUrl = product.images?.[idx]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800';
                return (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent hover:border-slate-300'}`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-2">
               <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm border border-slate-100">
                 <span className="text-xl font-black text-slate-800">125</span>
                 <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'عدد المشاهدات اليوم' : 'Views Today'}</span>
               </div>
               <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm border border-slate-100">
                 <span className="text-xl font-black text-slate-800">48</span>
                 <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'منتج تم بيعه اليوم' : 'Sold Today'}</span>
               </div>
               <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm border border-slate-100">
                 <div className="flex items-center gap-1 text-green-500 font-black text-sm mb-1">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   {lang === 'ar' ? 'متوفر' : 'In Stock'}
                 </div>
                 <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'متوفر في المخزون' : 'Available in stock'}</span>
               </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{lang === 'ar' ? 'جديد' : 'New'}</span>
              <span className="bg-green-500/10 text-green-600 text-xs font-bold px-3 py-1 rounded-full">{lang === 'ar' ? 'الأكثر مبيعاً' : 'Best Seller'}</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2 leading-tight">
              {lang === 'ar' ? product.nameAr : product.nameEn}
            </h1>
            <p className="text-slate-500 font-medium mb-4 text-sm">{product.slug}</p>

            <div className="flex items-center gap-4 mb-6">
               <div className="flex items-center gap-1 text-primary">
                 {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill={s <= Math.round(Number(product.rating ?? 4.8)) ? "currentColor" : "none"} />)}
                 <span className="text-sm font-black text-slate-900 ml-1">{Number(product.rating ?? 4.8).toFixed(1)}</span>
               </div>
               <span className="text-xs text-slate-400 font-bold">{lang === 'ar' ? '4.0 تقييم' : '4.0 Reviews'}</span>
            </div>

            <div className="mb-6 flex flex-col">
              <span className="text-4xl font-black text-primary flex items-baseline gap-1">
                {Number(product.salePrice || product.basePrice).toLocaleString()}
                <span className="text-lg">{lang === 'ar' ? 'ج.م' : 'EGP'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'شامل الضريبة' : 'Tax Included'}</span>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
              {lang === 'ar' ? (product.descriptionAr || 'حذاء جري للرجال يتميز بأول وحدة Max Air على الإطلاق تم تصميمها خصيصاً للملابس الرياضية من نايك.') : (product.descriptionEn || 'Running shoe featuring the first ever Max Air unit designed specifically for Nike Sportswear.')}
            </p>

            {/* Features Row */}
            <div className="grid grid-cols-4 gap-2 mb-8 border-y border-slate-100 py-6">
              <div className="flex flex-col items-center gap-2 text-center text-slate-500 hover:text-primary transition-colors cursor-default">
                 <ShieldCheck size={24} className="mb-1" />
                 <span className="text-[10px] font-bold">{lang === 'ar' ? 'ضمان سنتين' : '2 Yr Warranty'}</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center text-slate-500 hover:text-primary transition-colors cursor-default">
                 <RotateCcw size={24} className="mb-1" />
                 <span className="text-[10px] font-bold">{lang === 'ar' ? 'إرجاع مجاني' : 'Free Returns'}</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center text-slate-500 hover:text-primary transition-colors cursor-default">
                 <Truck size={24} className="mb-1" />
                 <span className="text-[10px] font-bold">{lang === 'ar' ? 'شحن سريع' : 'Fast Shipping'}</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center text-slate-500 hover:text-primary transition-colors cursor-default">
                 <Award size={24} className="mb-1" />
                 <span className="text-[10px] font-bold">{lang === 'ar' ? '100% أصلي' : '100% Authentic'}</span>
              </div>
            </div>

            {/* Colors */}
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800">{lang === 'ar' ? 'اللون:' : 'Color:'}</span>
              <div className="flex items-center gap-2">
                {colors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedColor === color ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}`}
                  >
                    {selectedColor === color && <Check size={14} color={color === '#000000' ? 'white' : 'white'} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-800">{lang === 'ar' ? 'المقاس:' : 'Size:'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 rounded-xl font-bold text-sm transition-all border ${selectedSize === size ? 'border-primary text-primary bg-primary/5' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex gap-3">
                 <button className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all">
                   <Heart size={20} />
                 </button>
                 <button className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all">
                   <Share2 size={20} />
                 </button>
                 <Button className="flex-1 h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-glow-primary">
                   <ShoppingCart size={18} className="mr-2" />
                   {lang === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
                 </Button>
              </div>
              <Button className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 border-0 shadow-xl">
                {lang === 'ar' ? 'اشتري الآن' : 'Buy Now'}
              </Button>
              {(product.department?.aiNegotiation ?? true) && (
                <Button onClick={() => setIsNegotiationOpen(true)} className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest bg-secondary text-white hover:bg-secondary/90 mt-1 border-0 shadow-xl flex justify-center items-center gap-2">
                  <Sparkles size={18} />
                  {lang === 'ar' ? 'تفاوض على السعر بالذكاء الاصطناعي' : 'AI Price Negotiation'}
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Dynamic AI Widget based on Category */}
          <div className="w-full lg:w-[35%] bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-fit">
             <div className="flex items-center justify-center gap-2 mb-2">
               <Sparkles size={20} className="text-primary" />
               <h3 className="text-lg font-black text-slate-900">{aiSuggestions?.titleAr || (lang === 'ar' ? 'جرب الحذاء بالذكاء الاصطناعي' : 'AI Shoe Try-On')}</h3>
               <Sparkles size={20} className="text-primary" />
             </div>
             <p className="text-xs text-slate-500 text-center font-bold mb-6">
               {aiSuggestions?.subtitleAr || (lang === 'ar' ? 'شاهد كيف سيبدو الحذاء عليك قبل الشراء' : 'See how it looks on you before buying')}
             </p>

             {(!aiSuggestions || aiSuggestions.type === 'virtual_try_on') && (
               <>
                 <div className="flex bg-slate-50 rounded-xl p-1 mb-6 border border-slate-100">
                   <button onClick={() => setTryOnTab('clothes')} className={`flex-1 py-2 text-xs font-bold rounded-lg shadow-sm transition-colors ${tryOnTab === 'clothes' ? 'bg-white text-primary' : 'text-slate-400 hover:text-slate-800'}`}>
                     {lang === 'ar' ? 'ملابس' : 'Clothes'}
                   </button>
                   <button onClick={() => setTryOnTab('accessories')} className={`flex-1 py-2 text-xs font-bold rounded-lg shadow-sm transition-colors ${tryOnTab === 'accessories' ? 'bg-white text-primary' : 'text-slate-400 hover:text-slate-800'}`}>
                     {lang === 'ar' ? 'إكسسوارات' : 'Accessories'}
                   </button>
                 </div>

                 {tryOnResult ? (
                   <div className="mb-6 relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
                     <img src={tryOnResult} alt="Try On Result" className="w-full h-full object-cover" />
                     <button onClick={() => {setTryOnResult(null); setTryOnImage(null);}} className="absolute top-2 right-2 bg-white p-1 rounded-full text-red-500 shadow-sm"><X size={16} /></button>
                   </div>
                 ) : (
                   <div className="relative border-2 border-dashed border-primary/30 bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors mb-6 aspect-video">
                     <input type="file" accept="image/*" onChange={handleTryOnUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                     {tryOnImage ? (
                       <img src={tryOnImage} alt="Uploaded" className="w-full h-full object-cover absolute inset-0 rounded-xl opacity-50" />
                     ) : (
                       <div className="flex flex-col items-center z-10">
                         <Upload className="text-primary mb-2" size={24} />
                         <span className="text-sm font-bold text-slate-800">{lang === 'ar' ? 'ارفع صورتك هنا' : 'Upload your photo'}</span>
                         <span className="text-[10px] text-slate-400 font-bold mt-1">(PNG, JPG)</span>
                       </div>
                     )}
                   </div>
                 )}

                 {!tryOnResult && (
                   <Button onClick={handleStartTryOn} disabled={tryOnLoading || !tryOnImage} className="w-full h-12 rounded-xl text-sm font-black uppercase shadow-glow-primary">
                     {tryOnLoading ? <Loader2 size={16} className="animate-spin" /> : (lang === 'ar' ? 'ابدأ التجربة' : 'Start Try-On')}
                   </Button>
                 )}
               </>
             )}

             {aiSuggestions?.type === 'technical_analysis' && (
               <div className="space-y-4 animate-in fade-in">
                 {aiSuggestions.suggestions?.map((s: any, idx: number) => (
                   <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <h4 className="font-black text-sm text-slate-800 mb-1">{s.title}</h4>
                     <p className="text-xs font-medium text-slate-500 leading-relaxed">{s.desc}</p>
                   </div>
                 ))}
               </div>
             )}

             {aiSuggestions?.type === 'beauty_routine' && (
               <div className="space-y-3 animate-in fade-in">
                 {aiSuggestions.routine?.map((step: string, idx: number) => (
                   <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">
                       {idx + 1}
                     </div>
                     <p className="text-xs font-bold text-slate-600 mt-0.5">{step}</p>
                   </div>
                 ))}
               </div>
             )}

             {aiSuggestions?.type === 'service_steps' && (
               <div className="space-y-4 animate-in fade-in">
                 <div className="flex flex-col gap-2">
                   {aiSuggestions.steps?.map((step: string, idx: number) => (
                     <div key={idx} className="flex items-center gap-2">
                       <Check size={14} className="text-green-500" />
                       <span className="text-xs font-bold text-slate-700">{step}</span>
                     </div>
                   ))}
                 </div>
                 <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 text-center">
                   <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{lang === 'ar' ? 'المدة المتوقعة:' : 'Est. Duration:'}</span>
                   <div className="text-sm font-black text-slate-900">{aiSuggestions.estimatedDuration}</div>
                 </div>
               </div>
             )}

             <p className="text-center text-[10px] text-slate-400 font-bold mt-4">
               {aiSuggestions?.disclaimerAr || (lang === 'ar' ? 'تعمل تقنية الذكاء الاصطناعي على محاكاة دقيقة للمنتج' : 'AI simulates an accurate representation')}
             </p>
          </div>

          {/* Tabs Section */}
          <div className="w-full lg:w-[65%] bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
             {/* Tab Headers */}
             <div className="flex border-b border-slate-100">
               {[
                 { id: 'description', labelAr: 'الوصف', labelEn: 'Description' },
                 { id: 'specs', labelAr: 'المواصفات', labelEn: 'Specifications' },
                 { id: 'shipping', labelAr: 'الشحن والاسترجاع', labelEn: 'Shipping & Returns' },
                 { id: 'reviews', labelAr: 'تقييمات (128)', labelEn: 'Reviews (128)' }
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex-1 py-5 text-sm font-black transition-all border-b-2 ${activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                 >
                   {lang === 'ar' ? tab.labelAr : tab.labelEn}
                 </button>
               ))}
             </div>

             {/* Tab Content */}
             <div className="p-8">
               {activeTab === 'description' && (
                 <div className="space-y-6 animate-in fade-in">
                   <p className="text-slate-600 font-medium leading-relaxed text-sm">
                     {lang === 'ar' ? (product.descriptionAr || 'حذاء جري للرجال يتميز بأول وحدة Max Air على الإطلاق تم تصميمها خصيصاً للملابس الرياضية من نايك.') : (product.descriptionEn || 'Running shoe featuring the first ever Max Air unit.')}
                   </p>
                   <ul className="space-y-3">
                     {[
                       lang === 'ar' ? 'تهوية ممتازة' : 'Excellent Ventilation',
                       lang === 'ar' ? 'راحة طوال اليوم' : 'All Day Comfort',
                       lang === 'ar' ? 'تصميم عصري وخفيف الوزن' : 'Modern & Lightweight Design',
                       lang === 'ar' ? 'مناسب للجري والتمارين' : 'Perfect for running and training'
                     ].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                         {item}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
               {activeTab === 'specs' && <div className="text-sm text-slate-500 font-medium p-4">{lang === 'ar' ? 'لا توجد مواصفات إضافية' : 'No additional specs'}</div>}
               {activeTab === 'shipping' && <div className="text-sm text-slate-500 font-medium p-4">{lang === 'ar' ? 'شحن سريع خلال 24 ساعة للطلبات المدفوعة مسبقاً.' : 'Fast shipping within 24h.'}</div>}
               {activeTab === 'reviews' && (
                 <div className="p-2">
                   <ReviewSection productId={product.id} />
                 </div>
               )}
             </div>

             {/* Trust Badges Footer */}
             <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4 text-xs font-bold text-slate-600">
               <div className="flex items-center gap-2">
                 <ShieldCheck size={16} />
                 <span>{lang === 'ar' ? 'ضمان استرجاع الأموال' : 'Money Back Guarantee'}</span>
               </div>
               <div className="flex items-center gap-2">
                 <Truck size={16} />
                 <span>{lang === 'ar' ? 'شحن لجميع المحافظات' : 'National Shipping'}</span>
               </div>
               <div className="flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                 <span>{lang === 'ar' ? 'دعم 24/7' : '24/7 Support'}</span>
               </div>
               <div className="flex items-center gap-2">
                 <ShieldCheck size={16} />
                 <span>{lang === 'ar' ? 'دفع آمن 100%' : '100% Secure Payment'}</span>
               </div>
             </div>
          </div>

        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={16} />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {lang === 'ar' ? 'ممكن يعجبك كمان' : 'You Might Also Like'}
            </h2>
            <div className="flex-1 h-px bg-slate-200 ml-4"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <Link to={`/product/${rec.slug}`} key={rec.id} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 relative">
                  <img 
                    src={rec.images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'} 
                    alt={rec.nameEn} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {rec.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                      {lang === 'ar' ? `-${rec.discount}%` : `-${rec.discount}%`}
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">
                  {lang === 'ar' ? rec.nameAr : rec.nameEn}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-black text-sm">{rec.basePrice} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Star size={10} className="text-yellow-400 fill-current" />
                    <span>{rec.rating || '0.0'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <RotateCcw size={16} />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {lang === 'ar' ? 'شاهدتها مؤخراً' : 'Recently Viewed'}
            </h2>
            <div className="flex-1 h-px bg-slate-200 ml-4"></div>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
            {recentlyViewed.map((rec) => (
              <Link to={`/product/${rec.slug}`} key={rec.id} className="min-w-[150px] md:min-w-[200px] bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-all group snap-start">
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 relative">
                  <img 
                    src={rec.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'} 
                    alt={rec.nameEn} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">
                  {lang === 'ar' ? rec.nameAr : rec.nameEn}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-black text-sm">{rec.price} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Negotiation Modal */}
      {isNegotiationOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl flex flex-col h-[600px] max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">{lang === 'ar' ? 'التفاوض الذكي' : 'AI Negotiation'}</h3>
                  <p className="text-[10px] font-bold text-slate-400">{product.nameEn}</p>
                </div>
              </div>
              <button onClick={() => setIsNegotiationOpen(false)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-full"><X size={18} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 max-w-[85%] self-start">
                <p className="text-sm font-medium text-slate-700">{lang === 'ar' ? `مرحباً! سعر المنتج الحالي هو ${product.basePrice} ج.م. ما هو السعر الذي تقترحه؟` : `Hello! The current price is ${product.basePrice} EGP. What's your offer?`}</p>
              </div>
              
              {negotiationHistory.map((msg, i) => (
                <div key={i} className={`p-4 rounded-2xl shadow-sm max-w-[85%] text-sm font-medium ${msg.role === 'user' ? 'bg-primary text-white self-end ml-auto' : 'bg-white border border-slate-100 text-slate-700 self-start mr-auto'}`}>
                  {msg.content}
                </div>
              ))}
              
              {negotiationLoading && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 max-w-[85%] self-start flex items-center gap-2 text-slate-400">
                  <Loader2 size={16} className="animate-spin" /> {lang === 'ar' ? 'جاري التفكير...' : 'Thinking...'}
                </div>
              )}
            </div>

            {negotiationAgreedPrice ? (
              <div className="p-6 border-t border-slate-100 bg-white rounded-b-[2rem]">
                <Button className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest bg-green-500 text-white hover:bg-green-600 border-0 shadow-xl">
                  {lang === 'ar' ? `اشتري بالسعر ${negotiationAgreedPrice} ج.م` : `Buy for ${negotiationAgreedPrice} EGP`}
                </Button>
              </div>
            ) : (
              <div className="p-4 border-t border-slate-100 bg-white rounded-b-[2rem]">
                <form onSubmit={handleNegotiationSubmit} className="flex gap-2 relative">
                  <input required disabled={negotiationLoading} value={negotiationInput} onChange={e=>setNegotiationInput(e.target.value)} placeholder={lang === 'ar' ? 'أدخل سعرك...' : 'Enter your offer...'} className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-4 outline-none focus:border-primary text-sm font-bold" />
                  <button type="submit" disabled={negotiationLoading || !negotiationInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductPage;
