import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

const SuccessPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get('order_id');
  const [status, setStatus] = useState<'polling' | 'success' | 'fail'>('polling');
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    let attempts = 0;
    const interval = setInterval(async () => {
      try {
        const { data: order } = await api.get(`/orders/${orderId}`);
        if (order.status === 'paid') {
          setStatus('success');
          clearCart();
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Polling error', error);
      }

      attempts++;
      if (attempts >= 10) { // Poll for 10 seconds
        setStatus('fail');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderId, clearCart, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'polling' && (
          <>
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Clock size={40} />
            </div>
            <h2 className="text-2xl font-bold">Verifying Payment...</h2>
            <p className="text-text-sub">Please wait while we confirm your payment with Stripe.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold">Payment Confirmed!</h2>
            <p className="text-text-sub">Your order #{orderId} has been placed successfully. Check your email for details.</p>
            <button 
              onClick={() => navigate('/')}
              className="btn-primary w-full mt-4"
            >
              Back to Home
            </button>
          </>
        )}

        {status === 'fail' && (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold">Still Processing...</h2>
            <p className="text-text-sub">Payment verification is taking longer than expected. We'll update you via email once it's confirmed.</p>
            <button 
              onClick={() => navigate('/')}
              className="btn-primary w-full mt-4"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
