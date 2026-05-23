import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Loader2, Star } from 'lucide-react';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';

const CustomerAddresses: React.FC = () => {
  const { lang } = useTranslation();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAddress, setNewAddress] = useState({ title: '', details: '', isDefault: false });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/addresses');
      setAddresses(res.data);
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل تحميل العناوين' : 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/addresses', newAddress);
      toast.success(lang === 'ar' ? 'تمت إضافة العنوان' : 'Address added');
      setShowAdd(false);
      setNewAddress({ title: '', details: '', isDefault: false });
      fetchAddresses();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل إضافة العنوان' : 'Failed to add address');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/addresses/${id}`);
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Address deleted');
      fetchAddresses();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      toast.success(lang === 'ar' ? 'تم التعيين كأساسي' : 'Set as default');
      fetchAddresses();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل العملية' : 'Failed to set default');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-40"><Loader2 className="animate-spin text-primary" size={36} /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {lang === 'ar' ? 'إدارة العناوين' : 'Manage Addresses'}
        </h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} className={lang === 'ar' ? 'ml-2' : 'mr-2'} />
          {lang === 'ar' ? 'إضافة عنوان' : 'Add Address'}
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddAddress} className="glass p-6 rounded-2xl space-y-4 max-w-xl">
          <h2 className="text-sm font-black uppercase tracking-widest">{lang === 'ar' ? 'عنوان جديد' : 'New Address'}</h2>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-2">{lang === 'ar' ? 'اسم العنوان (مثال: المنزل)' : 'Title (e.g. Home)'}</label>
            <input required type="text" className="input-field" value={newAddress.title} onChange={e => setNewAddress({...newAddress, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-2">{lang === 'ar' ? 'التفاصيل' : 'Details'}</label>
            <textarea required className="input-field h-24" value={newAddress.details} onChange={e => setNewAddress({...newAddress, details: e.target.value})}></textarea>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} />
            <label htmlFor="isDefault" className="text-sm font-bold">{lang === 'ar' ? 'تعيين كعنوان أساسي' : 'Set as default address'}</label>
          </div>
          <div className={`flex ${lang === 'ar' ? 'justify-end' : 'justify-start'} gap-3 pt-4`}>
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit">
              {lang === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map(address => (
          <div key={address.id} className="glass p-6 rounded-2xl relative group">
            {address.isDefault && (
              <span className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} bg-primary/20 text-primary text-[10px] font-black uppercase px-3 py-1 rounded-full`}>
                {lang === 'ar' ? 'أساسي' : 'Default'}
              </span>
            )}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black">{address.title}</h3>
                <p className="text-sm text-text-muted mt-2">{address.details}</p>
                
                <div className={`flex items-center gap-3 mt-6 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <button onClick={() => handleDelete(address.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title={lang === 'ar' ? 'حذف' : 'Delete'}>
                    <Trash2 size={16} />
                  </button>
                  {!address.isDefault && (
                    <button onClick={() => handleSetDefault(address.id)} className="text-text-muted hover:text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors flex items-center gap-1" title={lang === 'ar' ? 'تعيين كأساسي' : 'Set Default'}>
                      <Star size={16} /> <span className="text-[10px] font-bold uppercase">{lang === 'ar' ? 'تعيين كأساسي' : 'Set Default'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerAddresses;
