import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  garmentImageUrl: string;
}

const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({ isOpen, onClose, garmentImageUrl }) => {
  const { lang } = useTranslation();
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [personImageBase64, setPersonImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonImage(URL.createObjectURL(file));
        setPersonImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleTryOn = async () => {
    if (!personImageBase64) return;
    
    setLoading(true);
    setError(null);
    try {
      // First fetch the garment image and convert to base64
      let garmentBase64 = '';
      try {
        garmentBase64 = await urlToBase64(garmentImageUrl);
      } catch (err) {
        throw new Error('Failed to fetch garment image. Ensure CORS is allowed or the image is accessible.');
      }

      const res = await api.post('/virtual-tryon', {
        personImageBase64,
        garmentImageBase64: garmentBase64,
      });

      if (res.data?.result_url) {
        setResultImage(res.data.result_url);
      } else {
        throw new Error('No result URL returned');
      }
    } catch (err: any) {
      console.error('Virtual Try-On Error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during virtual try-on');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPersonImage(null);
    setPersonImageBase64(null);
    setResultImage(null);
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-2xl font-medium text-slate-900 flex items-center gap-2">
              <Sparkles className="text-primary" size={24} />
              {lang === 'ar' ? 'القياس الافتراضي بالذكاء الاصطناعي' : 'AI Virtual Try-On'}
            </h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {lang === 'ar' ? 'قم برفع صورتك لترى كيف يبدو هذا المنتج عليك' : 'Upload your photo to see how this looks on you'}
            </p>
          </div>
          <button 
            onClick={close}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3 text-sm font-medium">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Your Photo */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
                {lang === 'ar' ? 'صورتك' : 'Your Photo'}
              </h4>
              <div 
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`aspect-[3/4] rounded-3xl border-2 border-dashed ${personImage ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'} flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group`}
              >
                {personImage ? (
                  <>
                    <img src={personImage} alt="You" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-xl backdrop-blur-md">
                        {lang === 'ar' ? 'تغيير الصورة' : 'Change Photo'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <Upload className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-sm font-bold text-slate-600 mb-1">
                      {lang === 'ar' ? 'انقر لرفع صورة' : 'Click to upload a photo'}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      {lang === 'ar' ? 'صورة واضحة كاملة الطول أو نصف الطول' : 'Clear full-body or half-body photo'}
                    </p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Right: Result or Garment */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
                {resultImage ? (lang === 'ar' ? 'النتيجة' : 'Result') : (lang === 'ar' ? 'المنتج' : 'Garment')}
              </h4>
              <div className="aspect-[3/4] rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden relative flex items-center justify-center">
                {resultImage ? (
                  <img src={resultImage} alt="Result" className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
                ) : (
                  <img src={garmentImageUrl} alt="Garment" className="w-full h-full object-cover opacity-80" />
                )}
                
                {loading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-sm font-bold text-primary uppercase tracking-widest animate-pulse">
                      {lang === 'ar' ? 'جاري تطبيق الذكاء الاصطناعي...' : 'Applying AI Magic...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-slate-100 shrink-0 flex gap-4">
          <button 
            onClick={close}
            className="flex-1 h-14 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold uppercase tracking-widest rounded-2xl transition-colors border border-slate-200"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
          
          {!resultImage ? (
             <button 
               onClick={handleTryOn}
               disabled={!personImage || loading}
               className="flex-[2] h-14 bg-primary text-white font-bold uppercase tracking-widest rounded-2xl shadow-glow-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {loading ? (
                 <Loader2 className="animate-spin" size={20} />
               ) : (
                 <Sparkles size={20} />
               )}
               {lang === 'ar' ? 'توليد الصورة' : 'Generate Try-On'}
             </button>
          ) : (
             <button 
               onClick={reset}
               className="flex-[2] h-14 bg-primary text-white font-bold uppercase tracking-widest rounded-2xl shadow-glow-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
             >
               {lang === 'ar' ? 'تجربة صورة أخرى' : 'Try Another Photo'}
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnModal;
