import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Shield, Globe, Bell, 
  Database, Lock, Eye, EyeOff, Layout,
  Smartphone, Monitor, Mail, Loader2
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useTranslation';

const SettingsPage: React.FC = () => {
  const { t, lang, dir } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // General settings state
  const [siteName, setSiteName] = useState('Cobra Marketplace');
  const [siteUrl, setSiteUrl] = useState('https://cobra.sys');
  const [supportEmail, setSupportEmail] = useState('support@cobra.sys');
  const [supportPhone, setSupportPhone] = useState('+20 123 456 789');

  // Security settings state
  const [mfaEnabled, setMfaEnabled] = useState(true);

  // SEO settings state
  const [seoTitle, setSeoTitle] = useState('Cobra Marketplace - Premium Store');
  const [seoDescription, setSeoDescription] = useState('Explore the best fashion items and products on Cobra.');
  const [seoKeywords, setSeoKeywords] = useState('fashion, clothes, store, cobra');

  // Notifications settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [smtpHost, setSmtpHost] = useState('smtp.mailtrap.io');
  const [smtpPort, setSmtpPort] = useState('2525');
  const [smtpUser, setSmtpUser] = useState('cobra-system');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/settings');
        const data = res.data;
        if (data.siteName) setSiteName(data.siteName);
        if (data.siteUrl) setSiteUrl(data.siteUrl);
        if (data.supportEmail) setSupportEmail(data.supportEmail);
        if (data.supportPhone) setSupportPhone(data.supportPhone);
        if (data.mfaEnabled !== undefined) setMfaEnabled(data.mfaEnabled === 'true');
        if (data.seoTitle) setSeoTitle(data.seoTitle);
        if (data.seoDescription) setSeoDescription(data.seoDescription);
        if (data.seoKeywords) setSeoKeywords(data.seoKeywords);
        if (data.emailNotifications !== undefined) setEmailNotifications(data.emailNotifications === 'true');
        if (data.smsNotifications !== undefined) setSmsNotifications(data.smsNotifications === 'true');
        if (data.smtpHost) setSmtpHost(data.smtpHost);
        if (data.smtpPort) setSmtpPort(data.smtpPort);
        if (data.smtpUser) setSmtpUser(data.smtpUser);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        siteName,
        siteUrl,
        supportEmail,
        supportPhone,
        mfaEnabled: String(mfaEnabled),
        seoTitle,
        seoDescription,
        seoKeywords,
        emailNotifications: String(emailNotifications),
        smsNotifications: String(smsNotifications),
        smtpHost,
        smtpPort,
        smtpUser,
      };
      await api.post('/admin/settings', payload);
      toast.success(t('dashboard.settings.save_success'));
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: t('dashboard.settings.tab_general'), icon: <Settings size={16} /> },
    { id: 'security', name: t('dashboard.settings.tab_security'), icon: <Lock size={16} /> },
    { id: 'seo', name: t('dashboard.settings.tab_seo'), icon: <Globe size={16} /> },
    { id: 'notifications', name: t('dashboard.settings.tab_notifications'), icon: <Bell size={16} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">{t('dashboard.settings.title')}</h2>
          <p className={`text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
            {t('dashboard.settings.subtitle')}
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-5 h-11 flex items-center gap-2 text-xs self-end md:self-auto disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {t('dashboard.settings.save_changes')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold text-xs justify-start ${
                activeTab === tab.id 
                  ? 'bg-primary text-black shadow-glow-primary' 
                  : 'text-text-muted hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="glass rounded-xl p-6 border-border/30">
            {activeTab === 'general' && (
              <div className={`space-y-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-tight border-b border-border/50 pb-4">
                    {t('dashboard.settings.general.system_identity')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">
                        {t('dashboard.settings.general.site_name')}
                      </label>
                      <input 
                        type="text" 
                        className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${
                          lang === 'ar' ? 'text-right' : 'text-left'
                        }`}
                        value={siteName} 
                        onChange={(e) => setSiteName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">
                        {t('dashboard.settings.general.site_url')}
                      </label>
                      <input 
                        type="text" 
                        className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${
                          lang === 'ar' ? 'text-right' : 'text-left'
                        }`}
                        value={siteUrl} 
                        onChange={(e) => setSiteUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6">
                  <h3 className="text-sm font-black uppercase tracking-tight border-b border-border/50 pb-4">
                    {t('dashboard.settings.general.support_and_contact')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">
                        {t('dashboard.settings.general.support_email')}
                      </label>
                      <input 
                        type="email" 
                        className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${
                          lang === 'ar' ? 'text-right' : 'text-left'
                        }`}
                        value={supportEmail} 
                        onChange={(e) => setSupportEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">
                        {t('dashboard.settings.general.support_phone')}
                      </label>
                      <input 
                        type="text" 
                        className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${
                          lang === 'ar' ? 'text-right' : 'text-left'
                        }`}
                        value={supportPhone} 
                        onChange={(e) => setSupportPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className={`space-y-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-tight border-b border-border/50 pb-4">
                    {t('dashboard.settings.security.access_protection')}
                  </h3>
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4 justify-between">
                    <div className="flex items-start gap-3">
                      <Shield className="text-red-500 mt-0.5 shrink-0" size={16} />
                      <div>
                        <div className="text-xs font-black uppercase text-red-500">
                          {t('dashboard.settings.security.mfa_title')}
                        </div>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                          {t('dashboard.settings.security.mfa_desc')}
                        </p>
                      </div>
                    </div>
                    <div>
                       <div 
                         onClick={() => setMfaEnabled(!mfaEnabled)}
                         className={`w-10 h-5 rounded-full relative cursor-pointer shadow-glow-red/20 transition-all ${
                           mfaEnabled ? 'bg-red-500' : 'bg-border'
                         }`}
                       >
                         <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                           lang === 'ar' 
                             ? (mfaEnabled ? 'right-0.5 translate-x-0' : 'right-0.5 translate-x-5')
                             : (mfaEnabled ? 'left-0.5 translate-x-5' : 'left-0.5 translate-x-0')
                         }`} />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className={`space-y-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-tight border-b border-border/50 pb-4">
                    {t('dashboard.settings.seo.title')}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">
                        {t('dashboard.settings.seo.meta_title')}
                      </label>
                      <input 
                        type="text" 
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${
                          lang === 'ar' ? 'text-right' : 'text-left'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">
                        {t('dashboard.settings.seo.meta_description')}
                      </label>
                      <textarea 
                        rows={3}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold resize-none ${
                          lang === 'ar' ? 'text-right' : 'text-left'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">
                        {t('dashboard.settings.seo.meta_keywords')}
                      </label>
                      <input 
                        type="text" 
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${
                          lang === 'ar' ? 'text-right' : 'text-left'
                        }`}
                        placeholder={t('dashboard.settings.seo.meta_keywords_placeholder')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className={`space-y-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-tight border-b border-border/50 pb-4">
                    {t('dashboard.settings.notifications.title')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email alerts toggle */}
                    <div className="p-4 bg-primary/5 border border-border/30 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black uppercase">
                          {t('dashboard.settings.notifications.email_alerts')}
                        </div>
                        <p className="text-[9px] text-text-muted font-bold tracking-widest mt-0.5">
                          {t('dashboard.settings.notifications.email_alerts_desc')}
                        </p>
                      </div>
                      <div 
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${
                          emailNotifications ? 'bg-primary' : 'bg-border'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-background rounded-full transition-all ${
                          lang === 'ar' 
                            ? (emailNotifications ? 'right-0.5 translate-x-0' : 'right-0.5 translate-x-5')
                            : (emailNotifications ? 'left-0.5 translate-x-5' : 'left-0.5 translate-x-0')
                        }`} />
                      </div>
                    </div>

                    {/* SMS alerts toggle */}
                    <div className="p-4 bg-primary/5 border border-border/30 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black uppercase">
                          {t('dashboard.settings.notifications.sms_alerts')}
                        </div>
                        <p className="text-[9px] text-text-muted font-bold tracking-widest mt-0.5">
                          {t('dashboard.settings.notifications.sms_alerts_desc')}
                        </p>
                      </div>
                      <div 
                        onClick={() => setSmsNotifications(!smsNotifications)}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${
                          smsNotifications ? 'bg-primary' : 'bg-border'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-background rounded-full transition-all ${
                          lang === 'ar' 
                            ? (smsNotifications ? 'right-0.5 translate-x-0' : 'right-0.5 translate-x-5')
                            : (smsNotifications ? 'left-0.5 translate-x-5' : 'left-0.5 translate-x-0')
                        }`} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-tight">
                      {t('dashboard.settings.notifications.smtp_title')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">
                          {t('dashboard.settings.notifications.smtp_host')}
                        </label>
                        <input 
                          type="text" 
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${
                            lang === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">
                          {t('dashboard.settings.notifications.smtp_port')}
                        </label>
                        <input 
                          type="text" 
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(e.target.value)}
                          className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${
                            lang === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">
                          {t('dashboard.settings.notifications.smtp_user')}
                        </label>
                        <input 
                          type="text" 
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          className={`w-full bg-background border border-border rounded-xl p-3.5 text-xs focus:border-primary transition-all outline-none font-bold ${
                            lang === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
