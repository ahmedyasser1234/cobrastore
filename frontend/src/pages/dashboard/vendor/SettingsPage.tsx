import React, { useState, useEffect } from 'react';
import { Save, Store, Loader2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ImageUpload from '../../../components/ui/ImageUpload';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';

const VendorSettingsPage: React.FC = () => {
  const { t, lang } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeNameEn: '',
    storeNameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    logoUrl: '',
    bannerUrl: '',
    contactEmail: '',
    contactPhone: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    tiktokUrl: '',
    shippingFee: 0
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors/profile/me');
      if (res.data) {
        setFormData({
          storeNameEn: res.data.storeNameEn || res.data.storeName || '',
          storeNameAr: res.data.storeNameAr || res.data.storeName || '',
          descriptionEn: res.data.descriptionEn || res.data.description || '',
          descriptionAr: res.data.descriptionAr || res.data.description || '',
          logoUrl: res.data.logoUrl || '',
          bannerUrl: res.data.bannerUrl || '',
          contactEmail: res.data.contactEmail || '',
          contactPhone: res.data.contactPhone || '',
          facebookUrl: res.data.facebookUrl || '',
          instagramUrl: res.data.instagramUrl || '',
          twitterUrl: res.data.twitterUrl || '',
          tiktokUrl: res.data.tiktokUrl || '',
          shippingFee: res.data.shippingFee || 0
        });
      }
    } catch (err: any) {
      console.error(err);
      const status = err.response?.status;
      if (status === 404) {
        toast.error(lang === 'ar' ? 'ملف المتجر غير موجود (404)' : 'Vendor profile not found (404)');
      } else {
        toast.error(lang === 'ar' ? 'فشل تحميل ملف المتجر' : 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patch('/vendors/profile/me', formData);
      toast.success(lang === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Settings saved successfully');
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || (lang === 'ar' ? `فشل حفظ الإعدادات (${status || 'Unknown'})` : `Failed to save settings (${status || 'Unknown'})`);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-40">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {lang === 'ar' ? 'إعدادات المتجر' : 'Store Settings'}
        </h1>
      </div>

      <div className="glass p-8 rounded-2xl max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'اسم المتجر (إنجليزي)' : 'Store Name (English)'}
              </label>
              <div className="relative">
                <Store className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                <input 
                  type="text" 
                  value={formData.storeNameEn} 
                  onChange={e => setFormData({...formData, storeNameEn: e.target.value})} 
                  className={`input-field ${lang === 'ar' ? 'pr-12 text-right' : 'pl-12 text-left'}`} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'اسم المتجر (عربي)' : 'Store Name (Arabic)'}
              </label>
              <div className="relative">
                <Store className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                <input 
                  type="text" 
                  value={formData.storeNameAr} 
                  onChange={e => setFormData({...formData, storeNameAr: e.target.value})} 
                  className={`input-field ${lang === 'ar' ? 'pr-12 text-right' : 'pl-12 text-left'}`} 
                  required 
                  dir="auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <ImageUpload
                label={lang === 'ar' ? 'شعار المتجر (Logo)' : 'Store Logo'}
                value={formData.logoUrl}
                onChange={url => setFormData({...formData, logoUrl: url})}
                lang={lang}
              />
            </div>
          </div>

          <ImageUpload
            label={lang === 'ar' ? 'غلاف المتجر (Banner)' : 'Store Banner'}
            value={formData.bannerUrl}
            onChange={url => setFormData({...formData, bannerUrl: url})}
            lang={lang}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'وصف المتجر (إنجليزي)' : 'Store Description (English)'}
              </label>
              <textarea 
                rows={4} 
                value={formData.descriptionEn} 
                onChange={e => setFormData({...formData, descriptionEn: e.target.value})} 
                className={`input-field resize-none ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'وصف المتجر (عربي)' : 'Store Description (Arabic)'}
              </label>
              <textarea 
                rows={4} 
                value={formData.descriptionAr} 
                onChange={e => setFormData({...formData, descriptionAr: e.target.value})} 
                className={`input-field resize-none ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
                dir="auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'بريد التواصل' : 'Contact Email'}
              </label>
              <input 
                type="email" 
                value={formData.contactEmail} 
                onChange={e => setFormData({...formData, contactEmail: e.target.value})} 
                className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'رقم الهاتف' : 'Contact Phone'}
              </label>
              <input 
                type="tel" 
                value={formData.contactPhone} 
                onChange={e => setFormData({...formData, contactPhone: e.target.value})} 
                className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
              />
            </div>
          </div>


          <div className="border-t border-border/50 pt-8 mt-8">
            <h3 className={`text-lg font-black uppercase tracking-tight text-text-main mb-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {lang === 'ar' ? 'إعدادات الشحن' : 'Shipping Settings'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? 'رسوم الشحن الثابتة (ج.م)' : 'Flat Shipping Fee (EGP)'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.shippingFee} 
                  onChange={e => setFormData({...formData, shippingFee: parseFloat(e.target.value) || 0})} 
                  className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
                />
                <p className={`text-[10px] text-text-muted mt-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? 'ضع القيمة 0 لشحن مجاني' : 'Set to 0 for free shipping'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 mt-8">
            <h3 className={`text-lg font-black uppercase tracking-tight text-text-main mb-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {lang === 'ar' ? 'روابط السوشيال ميديا' : 'Social Media Links'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? 'رابط فيس بوك' : 'Facebook URL'}
                </label>
                <input 
                  type="url" 
                  value={formData.facebookUrl} 
                  onChange={e => setFormData({...formData, facebookUrl: e.target.value})} 
                  placeholder="https://facebook.com/..."
                  className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? 'رابط انستجرام' : 'Instagram URL'}
                </label>
                <input 
                  type="url" 
                  value={formData.instagramUrl} 
                  onChange={e => setFormData({...formData, instagramUrl: e.target.value})} 
                  placeholder="https://instagram.com/..."
                  className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? 'رابط تويتر / X' : 'Twitter / X URL'}
                </label>
                <input 
                  type="url" 
                  value={formData.twitterUrl} 
                  onChange={e => setFormData({...formData, twitterUrl: e.target.value})} 
                  placeholder="https://twitter.com/..."
                  className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? 'رابط تيك توك' : 'TikTok URL'}
                </label>
                <input 
                  type="url" 
                  value={formData.tiktokUrl} 
                  onChange={e => setFormData({...formData, tiktokUrl: e.target.value})} 
                  placeholder="https://tiktok.com/@..."
                  className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <div className={`flex mt-8 ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
            <Button type="submit" isLoading={saving} className="h-12 px-8">
              <Save size={18} className={lang === 'ar' ? 'ml-2' : 'mr-2'} />
              {lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorSettingsPage;
