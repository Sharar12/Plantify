/* ── Payment Success Content ────────────────────────────────────────────
 * Handles post-payment verification: reads URL params (order_id, tran_id,
 * val_id, status) from the payment gateway callback, notifies the backend,
 * and displays success/error/loading states to the user.
 * ───────────────────────────────────────────────────────────────────── */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const orderIdParam = searchParams.get('order_id');
    const valId = searchParams.get('val_id');
    const tranId = searchParams.get('tran_id');
    const paymentStatus = searchParams.get('status');

    setDebugInfo(`order_id: ${orderIdParam}, tran_id: ${tranId}, val_id: ${valId}, status: ${paymentStatus}`);
    console.log('Payment callback params:', { orderIdParam, valId, tranId, paymentStatus });

    if (!orderIdParam) {
      setStatus('error');
      return;
    }

    setOrderId(orderIdParam);
    setStatus('success');
    localStorage.removeItem('checkout_items');
    localStorage.removeItem('cart');
    localStorage.removeItem('pending_order_id');

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/success`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderIdParam,
        tran_id: tranId,
        val_id: valId,
        status: paymentStatus,
      }),
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Non-JSON response:', text.substring(0, 500));
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data) console.log('Payment verification response:', data);
      })
      .catch((err) => {
        console.error('Payment verification background error:', err);
      });
  }, [searchParams]);

  const handleLogout = () => {
    ['user', 'checkout_items', 'cart', 'order_to_place', 'order_items', 'pending_order_id']
      .forEach(k => localStorage.removeItem(k));
    setUser(null);
    router.push('/');
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white">
        <Header user={user} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-light">Verifying payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white">
        <Header user={user} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-500 font-light mb-2">Your payment could not be verified. Please contact support or try again.</p>
            {debugInfo && <p className="text-xs text-gray-400 font-mono mb-6 break-all">{debugInfo}</p>}
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white">
      <Header user={user} onLogout={handleLogout} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 font-light mb-2">Your order has been placed successfully.</p>
          {orderId && <p className="text-sm text-emerald-600 font-medium mb-8">Order #{orderId}</p>}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push(`/order-confirmation/${orderId}`)}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
            >
              View Order
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 border border-gray-200 text-gray-600 text-sm font-light rounded-2xl hover:border-emerald-200 hover:text-emerald-700 transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
