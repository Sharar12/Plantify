'use client';

// ============================================================
// CONFIRM ORDER PAGE — '/confirm-order/[orderId]'
// Order confirmation with confetti, items list, and timeline
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';

interface ConfirmOrderState {
  id: string;
  status: string;
  total: number;
  payment_method: string;
  billing_address: any;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function ConfirmOrder() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<ConfirmOrderState | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [confettiDone, setConfettiDone] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    if (params?.orderId && typeof params.orderId === 'string') {
      const orderId = params.orderId;
      const storedItems = localStorage.getItem('order_items');

      if (storedItems) {
        const parsedItems: CartItem[] = JSON.parse(storedItems);
        setItems(parsedItems);
        const total = parsedItems.reduce(
          (acc: number, item: CartItem) => acc + item.price * item.quantity, 0
        );
        setOrder({
          id: orderId as string,
          status: 'Confirmed',
          total,
          payment_method: localStorage.getItem('checkout_payment_method') || 'card',
          billing_address: JSON.parse(localStorage.getItem('checkout_billing_address') || '{}'),
        });
      }
      setLoading(false);
    }

    // Trigger confetti done after animation
    const t = setTimeout(() => setConfettiDone(true), 3000);
    return () => clearTimeout(t);
  }, [params?.orderId]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const subtotal = order?.total ?? 0;
  const tax     = subtotal * 0.1;
  const shipping = subtotal > 5000 ? 0 : 60;
  const grandTotal = subtotal + tax + shipping;

  const paymentIcon: Record<string, string> = {
    card: '💳', bkash: '📱', paypal: '🅿️', bank: '🏦',
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white font-['Inter',sans-serif] antialiased overflow-x-hidden">

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-100/15 via-transparent to-transparent pointer-events-none" />

      {/* ── Confetti Particles ── */}
      {!confettiDone && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                backgroundColor: [
                  'rgb(16,185,129)', 'rgb(52,211,153)',
                  'rgb(167,243,208)', 'rgb(209,250,229)',
                  '#fff', 'rgb(251,191,36)',
                ][Math.floor(Math.random() * 6)],
                animationDuration: `${2 + Math.random() * 2}s`,
                animationDelay: `${Math.random() * 1.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16">

        {/* ── Hero Success Section ── */}
        <div className="text-center mb-14">

          {/* Animated Check Circle */}
          <div className="relative mx-auto w-28 h-28 mb-8">
            <div className="absolute -inset-4 bg-emerald-400/15 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -inset-2 bg-emerald-400/10 rounded-full blur-xl" />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              <svg
                className="w-14 h-14 text-white relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                  className="animate-draw-check"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight mb-4">
            Order Confirmed
          </h1>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-emerald-400/40" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-emerald-400/40" />
          </div>

          <p className="text-gray-400 font-light text-lg">
            Thank you for your order. We'll have it on its way soon.
          </p>

          {order && (
            <div className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-emerald-50 border border-emerald-200/60 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-700 font-light">
                Order #{order.id} · {order.status}
              </span>
            </div>
          )}
        </div>

        {/* ── Main Card ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-400 font-light uppercase tracking-widest animate-pulse">
              Loading Details
            </p>
          </div>
        ) : order ? (
          <div className="relative">
            {/* Card Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/8 via-transparent to-emerald-500/8 rounded-3xl blur-2xl" />

            <div className="relative bg-white/85 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-[0_30px_80px_-20px_rgba(16,185,129,0.12)] overflow-hidden">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

              <div className="p-8 md:p-12 space-y-10">

                {/* ── Order Meta Grid ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: 'Order Number',
                      value: `#${order.id}`,
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ),
                    },
                    {
                      label: 'Status',
                      value: order.status,
                      valueClass: 'text-emerald-600',
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                    },
                    {
                      label: 'Date',
                      value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      ),
                    },
                    {
                      label: 'Payment',
                      value: `${paymentIcon[order.payment_method] || '💳'} ${order.payment_method}`,
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      ),
                    },
                  ].map(({ label, value, valueClass, icon }) => (
                    <div
                      key={label}
                      className="text-center bg-gray-50/60 border border-gray-100 rounded-2xl p-4"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-emerald-500/60 mx-auto mb-3 shadow-sm">
                        {icon}
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-light mb-1">{label}</p>
                      <p className={`text-sm font-medium capitalize ${valueClass || 'text-gray-800'}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* ── Order Items ── */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-light mb-5">
                    Items Ordered
                  </p>

                  {items.length > 0 ? (
                    <div className="space-y-3">
                      {items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-5 p-4 bg-gray-50/60 border border-gray-100 rounded-2xl hover:border-emerald-100 transition-colors duration-300"
                          style={{ animationDelay: `${idx * 60}ms` }}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-2xl flex-shrink-0">
                            🌿
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-400 font-light mt-0.5">
                              Qty {item.quantity} × TK.{Math.round(item.price).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900 flex-shrink-0">
                            TK.{Math.round(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 font-light text-sm">
                      No items to display
                    </div>
                  )}
                </div>

                {/* ── Price Breakdown ── */}
                <div className="bg-gray-50/60 border border-gray-100 rounded-2xl p-6 space-y-3">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-light mb-5">
                    Price Breakdown
                  </p>

                  {[
                    { label: 'Subtotal', value: `TK.${Math.round(subtotal).toLocaleString()}` },
                    { label: 'Tax (10%)', value: `TK.${Math.round(tax).toLocaleString()}` },
                    { label: 'Shipping', value: shipping === 0 ? 'Free 🎉' : `TK.${Math.round(shipping)}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 font-light">{label}</span>
                      <span className={`text-sm font-light ${value.includes('Free') ? 'text-emerald-600' : 'text-gray-700'}`}>
                        {value}
                      </span>
                    </div>
                  ))}

                  {/* Grand Total */}
                  <div className="pt-4 mt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-gray-900 font-medium">Grand Total</span>
                      <span className="text-3xl font-extralight text-gray-900">
                        TK.{Math.round(grandTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Delivery Timeline ── */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-light mb-6">
                    What Happens Next
                  </p>
                  <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-emerald-300 via-emerald-200 to-gray-100" />

                    <div className="space-y-6">
                      {[
                        { label: 'Order Confirmed', desc: 'Your order has been received', done: true },
                        { label: 'Processing',      desc: 'We\'re preparing your plants', done: false },
                        { label: 'Shipped',         desc: 'On its way to you', done: false },
                        { label: 'Delivered',       desc: 'Enjoy your new plants!', done: false },
                      ].map(({ label, desc, done }, i) => (
                        <div key={label} className="flex items-start gap-5">
                          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 ${
                            done
                              ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-600 shadow-md shadow-emerald-500/30'
                              : 'bg-white border-gray-200'
                          }`}>
                            {done ? (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                            )}
                          </div>
                          <div className="pt-1.5">
                            <p className={`text-sm font-medium ${done ? 'text-emerald-700' : 'text-gray-400'}`}>
                              {label}
                            </p>
                            <p className="text-xs text-gray-400 font-light mt-0.5">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── CTA Buttons ── */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => router.push('/')}
                    className="group relative flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light tracking-wide rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 rounded-2xl" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Continue Shopping
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>

                  <button
                    onClick={() => router.push('/profile')}
                    className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 text-sm font-light rounded-2xl hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all duration-300 hover:shadow-md"
                  >
                    View My Orders
                  </button>
                </div>

                {/* ── Trust Footer ── */}
                <div className="pt-6 border-t border-gray-100 text-center space-y-2">
                  <p className="text-sm text-gray-400 font-light">
                    We'll send a confirmation to your email shortly
                  </p>
                  <div className="flex items-center justify-center gap-6 text-[11px] text-gray-300 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Secure Order
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <span>Plantify © 2024</span>
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Not Found ── */
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl font-extralight text-gray-400">Order not found</p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 px-8 py-3 bg-emerald-600 text-white text-sm font-light rounded-2xl hover:bg-emerald-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        )}
      </main>

      {/* ── Confetti Animation ── */}
      <style jsx>{`
        @keyframes confetti {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }

        @keyframes draw-check {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        .animate-draw-check {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: draw-check 0.6s ease-out 0.4s forwards;
        }
      `}</style>
    </div>
  );
}