'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface OrderItem {
  id: number;
  plant_id: number;
  quantity: number;
  price: string;
  plant?: { id: number; name: string; scientific_name: string };
}

interface Order {
  id: string;
  user_id: number;
  total_price: string;
  status: string;
  payment_method: string;
  billing_address: any;
  created_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pending'    },
  processing: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400',    label: 'Processing' },
  shipped:    { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400',  label: 'Shipped'    },
  delivered:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Delivered'  },
  cancelled:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400',     label: 'Cancelled'  },
};

const paymentLabels: Record<string, string> = {
  card: 'Credit / Debit Card', paypal: 'PayPal',
  bank: 'Bank Transfer',       bkash: 'bKash',
};

const paymentIcons: Record<string, string> = {
  card: '💳', paypal: '🅿️', bank: '🏦', bkash: '📱',
};

export default function OrderConfirmation() {
  const params  = useParams();
  const router  = useRouter();
  const orderId = params.id as string;

  const [user,    setUser]    = useState<User | null>(null);
  const [order,   setOrder]   = useState<Order | null>(null);
  const [plants,  setPlants]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confettiDone, setConfettiDone] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { router.push('/login'); return; }
    setUser(JSON.parse(storedUser));

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`).then(r => r.json()),
    ])
      .then(([ordersData, plantsData]) => {
        const found = ordersData.find((o: Order) => o.id === orderId);
        if (found) { setOrder(found); setPlants(plantsData); }
        else router.push('/');
        setLoading(false);
      })
      .catch(() => { setLoading(false); router.push('/'); });

    const t = setTimeout(() => setConfettiDone(true), 3500);
    return () => clearTimeout(t);
  }, [orderId, router]);

  const handleLogout = () => { localStorage.removeItem('user'); setUser(null); router.push('/'); };

  const total    = order ? parseFloat(order.total_price) : 0;
  const tax      = total * 0.1;
  const shipping = total > 5000 ? 0 : 60;
  const grand    = total + tax + shipping;
  const cfg      = order ? (statusConfig[order.status] ?? statusConfig.pending) : statusConfig.pending;

  /* ── Shared section wrapper ── */
  const Section = ({ title, icon, children }: {
    title: string; icon: React.ReactNode; children: React.ReactNode;
  }) => (
    <div className="relative">
      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
      <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        <div className="p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              {icon}
            </div>
            <h2 className="text-lg font-light text-gray-900">{title}</h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );

  /* ── Loading ── */
  if (loading) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white font-['Inter',sans-serif] antialiased">
      <Header user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-emerald-300 animate-spin" style={{ animationDirection: 'reverse' }} />
        </div>
        <p className="text-sm text-gray-400 font-light uppercase tracking-widest animate-pulse">
          Loading Order
        </p>
      </div>
    </div>
  );

  /* ── Not Found ── */
  if (!order) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white font-['Inter',sans-serif] antialiased">
      <Header user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-xl font-extralight text-gray-400">Order not found</p>
        <Link href="/" className="mt-2 px-8 py-3 bg-emerald-600 text-white text-sm font-light rounded-2xl hover:bg-emerald-700 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white font-['Inter',sans-serif] antialiased overflow-x-hidden">

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-100/15 via-transparent to-transparent pointer-events-none" />

      {/* ── Confetti ── */}
      {!confettiDone && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${10 + Math.random() * 20}px`,
                width:  `${5 + Math.random() * 8}px`,
                height: `${5 + Math.random() * 8}px`,
                backgroundColor: [
                  'rgb(16,185,129)', 'rgb(52,211,153)', 'rgb(167,243,208)',
                  '#fff', 'rgb(251,191,36)', 'rgb(196,181,253)',
                ][Math.floor(Math.random() * 6)],
                animationDuration: `${2.5 + Math.random() * 2}s`,
                animationDelay: `${Math.random() * 1.8}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-14">

        {/* ── Hero Section ── */}
        <div className="text-center mb-16">
          <div className="relative mx-auto w-28 h-28 mb-8">
            <div className="absolute -inset-4 bg-emerald-400/15 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              <svg
                className="w-14 h-14 text-white relative z-10"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"
                  className="animate-draw-check" />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight mb-4">
            Order Confirmed
          </h1>

          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-emerald-400/40" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-emerald-400/40" />
          </div>

          <p className="text-gray-400 font-light text-lg">
            Thank you for your purchase. We'll have it on its way soon.
          </p>

          <div className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-emerald-50 border border-emerald-200/60 rounded-full">
            <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
            <span className="text-sm text-emerald-700 font-light">
              Order #{order.id} · {cfg.label}
            </span>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-7">

            {/* Order Details */}
            <Section
              title="Order Details"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              <div className="space-y-4">
                {[
                  { label: 'Order Number', value: `#${order.id}` },
                  { label: 'Order Date', value: new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Payment Method', value: `${paymentIcons[order.payment_method] || '💳'} ${paymentLabels[order.payment_method] || order.payment_method}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-xs text-gray-400 font-light uppercase tracking-widest">{label}</span>
                    <span className="text-sm font-light text-gray-800">{value}</span>
                  </div>
                ))}

                {/* Status Row */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-xs text-gray-400 font-light uppercase tracking-widest">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                {/* Total Row */}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-xs text-gray-400 font-light uppercase tracking-widest">Total Paid</span>
                  <span className="text-2xl font-extralight text-gray-900">
                    TK.{Math.round(parseFloat(order.total_price)).toLocaleString()}
                  </span>
                </div>
              </div>
            </Section>

            {/* Order Items */}
            <Section
              title="Items Ordered"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            >
              <div className="space-y-4">
                {order.items.map((item) => {
                  const plant = plants.find(p => p.id === item.plant_id);
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50/60 border border-gray-100 rounded-xl hover:border-emerald-100 transition-colors duration-300">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-2xl flex-shrink-0">
                        🌿
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {plant?.name || `Plant #${item.plant_id}`}
                        </p>
                        {plant?.scientific_name && (
                          <p className="text-xs italic text-gray-400 font-light">{plant.scientific_name}</p>
                        )}
                        <p className="text-xs text-gray-400 font-light mt-0.5">
                          Qty {item.quantity} × TK.{Math.round(parseFloat(item.price)).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 flex-shrink-0">
                        TK.{Math.round(parseFloat(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Price Summary inside Items */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
                {[
                  { label: 'Subtotal', val: `TK.${Math.round(total).toLocaleString()}` },
                  { label: 'Tax (10%)', val: `TK.${Math.round(tax).toLocaleString()}` },
                  { label: 'Shipping', val: shipping === 0 ? 'Free 🎉' : `TK.${Math.round(shipping)}` },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-xs text-gray-400 font-light">{label}</span>
                    <span className={`text-xs font-light ${val.includes('Free') ? 'text-emerald-600' : 'text-gray-600'}`}>{val}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-700 font-medium">Grand Total</span>
                  <span className="text-xl font-extralight text-gray-900">TK.{Math.round(grand).toLocaleString()}</span>
                </div>
              </div>
            </Section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-7">

            {/* Billing Address */}
            <Section
              title="Billing Address"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            >
              <div className="space-y-3 text-sm">
                {[
                  { icon: '👤', value: order.billing_address?.name },
                  { icon: '🏠', value: order.billing_address?.address },
                  { icon: '🏙️', value: [order.billing_address?.city, order.billing_address?.zip].filter(Boolean).join(', ') },
                  { icon: '📧', value: order.billing_address?.email },
                  { icon: '📞', value: order.billing_address?.phone },
                ].filter(r => r.value).map(({ icon, value }) => (
                  <div key={value} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-base flex-shrink-0">{icon}</span>
                    <span className="text-gray-600 font-light">{value}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* What's Next */}
            <Section
              title="What Happens Next"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            >
              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-emerald-300 via-emerald-100 to-gray-100" />
                <div className="space-y-5">
                  {[
                    { icon: '✅', label: 'Order Confirmed',        desc: 'Your order has been received',                      done: true  },
                    { icon: '⚙️', label: 'Processing',             desc: 'We\'re carefully preparing your plants (1-2 days)',  done: false },
                    { icon: '🚚', label: 'Shipping Updates',        desc: 'You\'ll receive tracking info once shipped',         done: false },
                    { icon: '🌿', label: 'Delivered',              desc: 'Enjoy your new botanical addition!',                done: false },
                  ].map(({ icon, label, desc, done }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                        done
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-600 shadow-md shadow-emerald-500/30'
                          : 'bg-white border-gray-200'
                      }`}>
                        {done
                          ? <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          : <span className="text-base">{icon}</span>
                        }
                      </div>
                      <div className="pt-1.5">
                        <p className={`text-sm font-medium ${done ? 'text-emerald-700' : 'text-gray-500'}`}>{label}</p>
                        <p className="text-xs text-gray-400 font-light mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}

                  {/* bKash Special Step */}
                  {order.payment_method === 'bkash' && (
                    <div className="flex items-start gap-4 mt-2 p-4 bg-pink-50/60 border border-pink-100 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 text-lg">📱</div>
                      <div>
                        <p className="text-sm font-medium text-pink-700">Complete bKash Payment</p>
                        <p className="text-xs text-pink-500 font-light mt-0.5">
                          Send your Transaction ID to{' '}
                          <span className="font-medium">support@plantify.com</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href="/profile"
                className="group relative w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light tracking-wide rounded-2xl overflow-hidden text-center transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 rounded-2xl" />
                <span className="relative z-10 flex items-center gap-3">
                  View All Orders
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/"
                className="w-full py-4 bg-white border border-gray-200 text-gray-700 text-sm font-light rounded-2xl hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all duration-300 hover:shadow-md text-center"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Trust Footer */}
            <div className="pt-4 text-center space-y-3">
              <p className="text-sm text-gray-400 font-light">
                A confirmation email will be sent to{' '}
                <span className="text-gray-600">{order.billing_address?.email}</span>
              </p>
              <div className="flex items-center justify-center gap-5 text-[11px] text-gray-300 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure
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
      </main>

      {/* ── Global Animations ── */}
      <style jsx>{`
        @keyframes confetti {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti linear forwards; }

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