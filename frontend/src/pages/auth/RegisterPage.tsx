import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock as LockIcon, Phone, ArrowRight, Store, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface RegisterPageProps {
  type?: 'customer' | 'vendor';
}

const RegisterPage: React.FC<RegisterPageProps> = ({ type }) => {
  const { t, lang } = useTranslation();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: '',
    storeNameEn: '',
    storeNameAr: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [role, setRole] = React.useState<'customer' | 'vendor'>(type || 'customer');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error(lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', { 
        ...formData, 
        role 
      });
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      toast.success(lang === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully');
      
      if (role === 'vendor') navigate('/dashboard/vendor');
      else navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="glass p-8 md:p-12 rounded-[32px] border-border/50 relative">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center mb-6">
              <img src="/cobra-logo-dark.png" alt="Cobra" className="h-16 w-auto" />
            </Link>
            <h1 className="text-3xl font-medium heading-gradient mb-2">
              {type === 'vendor'
                ? (lang === 'ar' ? 'تسجيل متجر جديد' : 'Vendor Registration')
                : (lang === 'ar' ? 'إنشاء حساب جديد' : 'Join Cobra Store')}
            </h1>
            <p className="text-text-muted text-sm font-medium">
              {type === 'vendor'
                ? (lang === 'ar' ? 'سجل متجرك الآن وابدأ البيع على منصتنا' : 'Register your store and start selling on our platform')
                : (lang === 'ar' ? 'ابدأ رحلتك معنا اليوم واكتشف عالماً من المنتجات' : 'Start your journey with us and discover a world of products')}
            </p>
          </div>

          {/* Role Selection */}
          {!type && (
            <div className="flex bg-background border border-border p-1.5 rounded-2xl mb-10">
              <button 
                type="button"
                onClick={() => setRole('customer')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all uppercase tracking-widest ${role === 'customer' ? 'bg-primary text-black shadow-glow-primary' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
              >
                <UserCircle size={18} />
                {lang === 'ar' ? 'مشتري' : 'Customer'}
              </button>
              <button 
                type="button"
                onClick={() => setRole('vendor')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all uppercase tracking-widest ${role === 'vendor' ? 'bg-primary text-black shadow-glow-primary' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
              >
                <Store size={18} />
                {lang === 'ar' ? 'بائع' : 'Vendor'}
              </button>
            </div>
          )}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleRegister}>
            {role === 'vendor' ? (
              <>
                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>
                    {lang === 'ar' ? 'اسم المتجر (إنجليزي)' : 'Store Name (English)'}
                  </label>
                  <div className="relative">
                    <Store className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                    <input type="text" name="storeNameEn" onChange={handleChange} value={formData.storeNameEn} placeholder="Store Name" className={`input-field ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>
                    {lang === 'ar' ? 'اسم المتجر (عربي)' : 'Store Name (Arabic)'}
                  </label>
                  <div className="relative">
                    <Store className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                    <input type="text" name="storeNameAr" onChange={handleChange} value={formData.storeNameAr} placeholder="اسم المتجر" className={`input-field ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`} required dir="auto" />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2 md:col-span-2">
                <label className={`text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>
                  {lang === 'ar' ? 'الاسم كاملاً' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                  <input type="text" name="name" onChange={handleChange} value={formData.name} placeholder="John Doe" className={`input-field ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`} required />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>
                {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                <input type="tel" name="phone" onChange={handleChange} value={formData.phone} placeholder="+20 123 456 7890" className={`input-field ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`} dir="ltr" required />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className={`text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                <input type="email" name="email" onChange={handleChange} value={formData.email} placeholder="name@example.com" className={`input-field ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`} dir="ltr" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <LockIcon className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                <input type="password" name="password" onChange={handleChange} value={formData.password} placeholder="••••••••" className={`input-field ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`} dir="ltr" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>
                {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative">
                <LockIcon className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                <input type="password" name="confirmPassword" onChange={handleChange} value={formData.confirmPassword} placeholder="••••••••" className={`input-field ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`} dir="ltr" required />
              </div>
            </div>

            <div className="md:col-span-2 flex items-start gap-3 px-1 mt-2">
              <input type="checkbox" id="terms" className="accent-primary h-5 w-5 mt-0.5 rounded-lg shrink-0" required />
              <label htmlFor="terms" className="text-xs text-text-muted leading-relaxed">
                {lang === 'ar' 
                  ? 'من خلال إنشاء حساب، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.' 
                  : 'By creating an account, you agree to our Terms of Service and Privacy Policy.'}
              </label>
            </div>

            <Button type="submit" isLoading={loading} className={`md:col-span-2 w-full py-4 text-lg mt-4 flex items-center justify-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              {lang === 'ar' ? 'إنشاء الحساب' : 'Create Account'}
              <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
            </Button>
          </form>

          <p className="text-center mt-10 text-sm text-text-muted font-medium">
            {lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <Link to={type === 'vendor' ? '/vendor/login' : '/login'} className="text-primary hover:underline font-bold">
              {t('common.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
