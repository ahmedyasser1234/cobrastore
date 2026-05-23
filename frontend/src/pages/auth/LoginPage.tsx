import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock as LockIcon, ArrowRight, Chrome, Github } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface LoginPageProps {
  type?: 'admin' | 'vendor' | 'customer';
}

const LoginPage: React.FC<LoginPageProps> = ({ type = 'customer' }) => {
  const { t, lang } = useTranslation();
  const { setAuth, isAuthenticated, user: authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated && authUser) {
      const role = authUser.role.toLowerCase();
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'vendor') navigate('/dashboard/vendor');
      else navigate('/');
    }
  }, [isAuthenticated, authUser, navigate]);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data;
      const role = user.role.toLowerCase();

      // Strict role validation based on the login page type
      if (type !== 'customer' && role !== type) {
        toast.error(lang === 'ar' ? 'غير مصرح لك بالدخول من هذه البوابة' : 'Unauthorized access for this portal');
        setLoading(false);
        return;
      }

      setAuth(user, accessToken);
      toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully');
      
      // Role-based redirection
      if (role === 'admin') {
        navigate('/dashboard/admin');
      } else if (role === 'vendor') {
        navigate('/dashboard/vendor');
      } else {
        navigate('/'); // Customer logs in normally and stays on the site
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="glass p-8 md:p-10 rounded-[32px] border-border/50 relative">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center mb-6">
              <img src="/cobra-logo-dark.png" alt="Cobra" className="h-16 w-auto cobra-glow" />
            </Link>
            <h1 className="text-3xl font-medium heading-gradient mb-2">
              {type === 'admin' 
                ? (lang === 'ar' ? 'بوابة الإدارة' : 'Admin Portal')
                : type === 'vendor'
                ? (lang === 'ar' ? 'بوابة التجار' : 'Vendor Portal')
                : (lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back')}
            </h1>
            <p className="text-text-muted text-sm font-medium">
              {type === 'customer'
                ? (lang === 'ar' ? 'سجل دخولك لمتابعة التسوق' : 'Login to continue shopping')
                : (lang === 'ar' ? 'سجل دخولك للوصول إلى لوحة التحكم الخاصة بك' : 'Login to access your personalized dashboard')}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'mr-1' : 'ml-1'}`}>
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`input-field ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`}
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <a href="#" className="text-[10px] text-primary hover:underline font-bold uppercase">
                  {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </a>
              </div>
              <div className="relative">
                <LockIcon className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`input-field ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`}
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="accent-primary h-4 w-4 bg-background border-border" />
              <label htmlFor="remember" className="text-xs text-text-muted">
                {lang === 'ar' ? 'تذكرني' : 'Remember me on this device'}
              </label>
            </div>

            <Button type="submit" isLoading={loading} className={`w-full py-4 text-lg flex items-center justify-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              {t('common.login')}
              <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
            </Button>
          </form>

          {type === 'vendor' && (
            <p className="text-center mt-10 text-sm text-text-muted font-medium">
              {lang === 'ar' ? 'ليس لديك حساب متجر؟' : "Don't have a store account?"}{' '}
              <Link to="/vendor/register" className="text-primary hover:underline font-bold">
                {lang === 'ar' ? 'سجل متجرك الآن' : 'Register Store'}
              </Link>
            </p>
          )}

          {type === 'customer' && (
            <>
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
                  <span className="bg-white px-4 text-text-muted">{lang === 'ar' ? 'أو المتابعة باستخدام' : 'Or continue with'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-2 py-3 bg-background border border-border rounded-xl hover:border-primary/50 transition-all font-bold text-xs uppercase">
                  <Chrome size={16} className="text-primary" />
                  Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-3 bg-background border border-border rounded-xl hover:border-primary/50 transition-all font-bold text-xs uppercase">
                  <Github size={16} className="text-primary" />
                  Github
                </button>
              </div>

              <p className="text-center mt-10 text-sm text-text-muted font-medium">
                {lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                <Link to="/register" className="text-primary hover:underline font-bold">
                  {lang === 'ar' ? 'أنشئ حساباً الآن' : 'Create Account'}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
