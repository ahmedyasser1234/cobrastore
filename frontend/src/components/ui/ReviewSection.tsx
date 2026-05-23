import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Loader2, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import Button from './Button';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ReviewSectionProps {
  productId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { t, lang } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [reviewInput, setReviewInput] = useState('');
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reviews/product/${productId}`);
      setReviews(res.data.reviews || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);

    try {
      await api.post('/reviews', {
        productId,
        rating: ratingInput,
        comment: reviewInput,
      });
      toast.success(lang === 'ar' ? 'تم إضافة التقييم بنجاح' : 'Review submitted successfully');
      setReviewInput('');
      setRatingInput(5);
      fetchReviews();
    } catch (err: any) {
      toast.error(lang === 'ar' ? 'فشل إرسال التقييم' : 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-primary" size={24} /></div>;
  }

  return (
    <div className="space-y-6">
      {/* AI Summary Section */}
      {summary && (
        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} className="text-primary" />
            <h3 className="font-black text-sm text-primary uppercase">
              {lang === 'ar' ? 'ملخص الآراء بالذكاء الاصطناعي' : 'AI Review Summary'}
            </h3>
          </div>
          <p className="text-sm font-bold text-slate-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Write a Review Section */}
      {isAuthenticated && user?.role === 'customer' && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h3 className="font-black text-sm uppercase mb-4 flex items-center gap-2">
            {lang === 'ar' ? 'أضف تقييم' : 'Write a Review'}
            <span title="Protected by AI Fake Review Detection" className="flex items-center text-secondary">
              <Sparkles size={16} />
            </span>
          </h3>
          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-slate-600">{lang === 'ar' ? 'التقييم:' : 'Rating:'}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={20}
                      className={`${star <= ratingInput ? 'text-yellow-400 fill-current' : 'text-slate-300'} transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <textarea
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
                placeholder={lang === 'ar' ? 'اكتب تقييمك...' : 'Write your review...'}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-colors min-h-[100px] resize-none"
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button type="submit" disabled={reviewLoading} className="px-8 py-3 rounded-xl font-black">
                {reviewLoading ? <Loader2 size={16} className="animate-spin" /> : (lang === 'ar' ? 'إرسال' : 'Submit')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-sm text-slate-500 font-medium p-4 text-center">
            {lang === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{review.user?.name || 'User'}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} className={star <= review.rating ? 'fill-current' : 'text-slate-200'} />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm font-medium text-slate-600 leading-relaxed ml-13">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
