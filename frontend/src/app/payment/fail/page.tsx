/* ── Payment Fail Page ──────────────────────────────────────────────────
 * Displays when a payment transaction fails. Offers the user options
 * to try again (back to cart) or return home.
 * ───────────────────────────────────────────────────────────────────── */
'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function PaymentFail() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
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
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-500 font-light mb-8">Your payment was not completed. You can try again or contact support.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/cart')}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
            >
              Try Again
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
