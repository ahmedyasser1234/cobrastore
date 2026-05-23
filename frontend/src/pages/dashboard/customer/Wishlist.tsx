import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CustomerWishlist: React.FC = () => {
  const { lang } = useTranslation();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      setWishlist(res.data);
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل تحميل المفضلة' : 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      toast.success(lang === 'ar' ? 'تم الإزالة من المفضلة' : 'Removed from wishlist');
      fetchWishlist();
    } catch (err) {
      toast.error(lang === 'ar' ? 'فشل الإزالة' : 'Failed to remove');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-40"><Loader2 className="animate-spin text-primary" size={36} /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-glow-primary flex items-center gap-3">
          <Heart size={24} className="text-primary fill-primary" />
          {lang === 'ar' ? 'المفضلة' : 'My Wishlist'}
        </h1>
        <div className="text-xs font-bold text-text-muted uppercase tracking-widest bg-surface px-4 py-2 rounded-full border border-border">
          {wishlist.length} {lang === 'ar' ? 'منتجات' : 'Items'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map(item => {
          const product = item.product;
          if (!product) return null;
          return (
            <div key={item.id} className="glass p-4 rounded-3xl group flex flex-col">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface mb-4">
                <img 
                  src={product.images?.[0]?.url || '/placeholder.png'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button 
                  onClick={() => handleRemove(product.id)}
                  className={`absolute top-3 ${lang === 'ar' ? 'left-3' : 'right-3'} w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all`}
                  title={lang === 'ar' ? 'إزالة' : 'Remove'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-sm truncate">{product.name}</h3>
                <div className="font-black text-primary mt-1">
                  {Number(product.price).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
                </div>
                <Link to={`/product/${product.id}`} className="mt-4">
                  <Button className="w-full" variant="secondary">
                    <ShoppingCart size={16} className={lang === 'ar' ? 'ml-2' : 'mr-2'} />
                    {lang === 'ar' ? 'عرض المنتج' : 'View Product'}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {wishlist.length === 0 && (
        <div className="flex flex-col items-center justify-center p-20 glass rounded-3xl text-center">
          <Heart size={64} className="text-text-muted/20 mb-6" />
          <h2 className="text-xl font-black uppercase tracking-widest">{lang === 'ar' ? 'القائمة فارغة' : 'Wishlist is empty'}</h2>
          <p className="text-text-muted mt-2 mb-8">{lang === 'ar' ? 'تصفح المتجر وأضف منتجاتك المفضلة هنا' : 'Browse the store and add your favorite products here'}</p>
          <Link to="/">
            <Button>{lang === 'ar' ? 'تصفح المتجر' : 'Browse Store'}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CustomerWishlist;
