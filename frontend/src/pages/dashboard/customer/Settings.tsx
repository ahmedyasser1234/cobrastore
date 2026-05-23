import React, { useState, useEffect } from 'react';
import { Save, User, Mail, Loader2, Phone } from 'lucide-react';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';

const CustomerSettings: React.FC = () => {
  const { lang } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me');
      if (res.data) {
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          password: ''
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(lang === 'ar' ? 'فشل تحميل الملف الشخصي' : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: any = {
        name: formData.name,
        phone: formData.phone
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      await api.patch('/users/me', payload);
      toast.success(lang === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Settings saved successfully');
      setFormData({ ...formData, password: '' });
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
          {lang === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
        </h1>
      </div>

      <div className="glass p-8 rounded-2xl max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-2">
            <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {lang === 'ar' ? 'الاسم' : 'Name'}
            </label>
            <div className="relative">
              <User className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className={`input-field ${lang === 'ar' ? 'pr-12 text-right' : 'pl-12 text-left'}`} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <div className="relative">
              <Mail className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
              <input 
                type="email" 
                value={formData.email} 
                disabled
                className={`input-field opacity-50 cursor-not-allowed ${lang === 'ar' ? 'pr-12 text-right' : 'pl-12 text-left'}`} 
              />
            </div>
            <p className={`text-[10px] text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {lang === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني الأساسي' : 'Primary email cannot be changed'}
            </p>
          </div>

          <div className="space-y-2">
            <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <div className="relative">
              <Phone className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
              <input 
                type="tel" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className={`input-field ${lang === 'ar' ? 'pr-12 text-right' : 'pl-12 text-left'}`} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
            </label>
            <input 
              type="password" 
              placeholder={lang === 'ar' ? 'اتركه فارغاً إذا لم ترد تغييره' : 'Leave blank to keep unchanged'}
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
            />
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

export default CustomerSettings;
