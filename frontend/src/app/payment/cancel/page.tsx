/* ── Payment Cancel Page ───────────────────────────────────────────────
 * Handles user-cancelled payments: reads the order_id from URL params,
 * notifies the backend about the cancellation, and offers navigation
 * back to cart or home.
 * ───────────────────────────────────────────────────────────────────── */
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { useEffect, useState, Suspense } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const orderId = searchParams?.get('order_id');
    if (orderId) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      }).catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    ['user', 'checkout_items', 'cart', 'order_to_place', 'order_items', 'pending_order_id']
      .forEach(k => localStorage.removeItem(k));
    setUser(null);
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white">
      <Header user={user} onLogout={handleLogout} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-500 font-light mb-8">You cancelled the payment. Your cart items are still available.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/cart')}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
            >
              Back to Cart
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 border border-gray-200 text-gray-600 text-sm font-light rounded-2xl hover:border-emerald-200 hover:text-emerald-700 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancel() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-light mt-4">Loading...</p>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}
