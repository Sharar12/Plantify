'use client';

// ============================================================
// CHECKOUT PAGE — '/checkout'
// Billing info form, payment method selection, order summary
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import React from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

type PaymentMethod = 'sslcommerz';

// ── Shared Input Component (MOVED OUTSIDE to prevent remounting) ──────────
const Field = React.memo(({
  id, label, type = 'text', value, onChange, placeholder,
  icon, maxLength, colSpan, fontMono = false, focused, setFocused,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ReactNode; maxLength?: number; colSpan?: boolean;
  fontMono?: boolean; focused: string | null; setFocused: (v: string | null) => void;
}) => (
  <div className={colSpan ? 'md:col-span-2' : ''}>
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
      {label}
    </label>
    <div className={`relative transition-all duration-300 ${focused === id ? 'scale-[1.01]' : ''}`}>
      <div className={`absolute -inset-0.5 rounded-xl blur transition-opacity duration-300 ${
        focused === id ? 'bg-emerald-400/20 opacity-100' : 'opacity-0'
      }`} />
      <div className="relative flex items-center">
        <div
          className="absolute left-4 pointer-events-none transition-colors duration-300"
          style={{ color: focused === id ? 'rgb(16,185,129)' : 'rgb(156,163,175)' }}
        >
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          placeholder={placeholder}
          maxLength={maxLength}
          required
          className={`w-full pl-11 pr-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 transition-all duration-300 ${
            fontMono ? 'font-mono tracking-wider' : 'font-light'
          }`}
        />
      </div>
    </div>
  </div>
));

// ── Payment Method Button (MOVED OUTSIDE to prevent remounting) ───────────
const PaymentBtn = React.memo(({
  method, label, icon, paymentMethod, setPaymentMethod,
}: {
  method: PaymentMethod; label: string; icon: React.ReactNode;
  paymentMethod: PaymentMethod; setPaymentMethod: (m: PaymentMethod) => void;
}) => (
  <button
    type="button"
    onClick={() => setPaymentMethod(method)}
    className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-300 ${
      paymentMethod === method
        ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
        : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/20'
    }`}
  >
    <div className={`text-2xl transition-transform duration-300 ${
      paymentMethod === method ? 'scale-110' : ''
    }`}>{icon}</div>
    <span className={`text-xs font-medium transition-colors ${
      paymentMethod === method ? 'text-emerald-700' : 'text-gray-500'
    }`}>
      {label}
    </span>
    {paymentMethod === method && (
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
    )}
  </button>
));

export default function Checkout() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const [billingInfo, setBillingInfo] = useState({
    name: '', email: '', phone: '', address: '', city: '', zip: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('sslcommerz');

  const formatPhone = (value: string) => {
    const v = value.replace(/[^0-9]/gi, '');
    if (v.length <= 3) return v;
    if (v.length <= 6) return v.slice(0, 3) + ' ' + v.slice(3);
    return v.slice(0, 3) + ' ' + v.slice(3, 6) + ' ' + v.slice(6, 10);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { router.push('/login'); return; }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setBillingInfo({
      name: userData.name || '', email: userData.email || '',
      phone: userData.phone || '', address: userData.address || '',
      city: '', zip: '',
    });
    const checkoutItems = localStorage.getItem('checkout_items');
    if (checkoutItems) setCartItems(JSON.parse(checkoutItems));
    else router.push('/cart');
  }, [router]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 5000 ? 0 : 60;
  const total = subtotal + tax + shipping;

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!billingInfo.name || !billingInfo.email || !billingInfo.phone ||
        !billingInfo.address || !billingInfo.city || !billingInfo.zip) {
      alert('Please fill in all billing information');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          items: cartItems.map(item => ({ plant_id: item.id, quantity: item.quantity, price: item.price })),
          total_price: Math.round(total),
          billing_address: billingInfo,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Backend returned non-JSON:', text.substring(0, 1000));
        alert('Server error. Check console for details.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('Payment init response:', data);
      if (res.ok && data.gateway_url) {
        localStorage.setItem('pending_order_id', data.order_id.toString());
        window.location.href = data.gateway_url;
      } else {
        alert(data?.message || 'Payment initiation failed. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    ['user', 'checkout_items', 'cart', 'order_to_place', 'order_items', 'pending_order_id']
      .forEach(k => localStorage.removeItem(k));
    setUser(null);
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white font-['Inter',sans-serif] antialiased">

      {/* Ambient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/30 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-100/10 via-transparent to-transparent pointer-events-none" />

      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-12">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-extralight text-gray-900 tracking-tight">Checkout</h1>
            <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent mt-3 rounded-full" />
          </div>
          <button
            onClick={() => router.push('/cart')}
            className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-light text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-full shadow-sm hover:shadow-md hover:border-emerald-200 hover:text-emerald-700 transition-all duration-300"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </button>
        </div>

        {/* ── Progress Indicator ── */}
        <div className="flex items-center gap-3 mb-12 max-w-xs">
          {[
            { n: 1, label: 'Billing' },
            { n: 2, label: 'Payment' },
          ].map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step >= n
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {n}
                </div>
                <span className={`text-sm font-light ${step >= n ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < 1 && <div className="w-8 h-px bg-gray-200 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">

          {/* ─── LEFT: Forms ─── */}
          <div className="space-y-8">

            {/* ── Billing Card ── */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-light text-gray-900">Billing Information</h2>
                      <p className="text-xs text-gray-400 font-light">Where should we deliver?</p>
                    </div>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <Field id="name" label="Full Name" value={billingInfo.name}
                       onChange={(v) => setBillingInfo({ ...billingInfo, name: v.replace(/[^a-zA-Z\s]/g, '') })}
                       placeholder="Your full name" colSpan focused={focused} setFocused={setFocused}
                       icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                     />
                     <Field id="email" label="Email" type="email" value={billingInfo.email}
                       onChange={(v) => setBillingInfo({ ...billingInfo, email: v.toLowerCase() })}
                       placeholder="hello@example.com" focused={focused} setFocused={setFocused}
                       icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
                     />
                     <Field id="phone" label="Phone" type="tel" value={billingInfo.phone}
                       onChange={(v) => setBillingInfo({ ...billingInfo, phone: formatPhone(v) })}
                       placeholder="017 123 4567" maxLength={12} focused={focused} setFocused={setFocused}
                       icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 10 0.01.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                     />
                     <Field id="address" label="Street Address" value={billingInfo.address}
                       onChange={(v) => setBillingInfo({ ...billingInfo, address: v })}
                       placeholder="123 Main Street" colSpan focused={focused} setFocused={setFocused}
                       icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                     />
                     <Field id="city" label="City" value={billingInfo.city}
                       onChange={(v) => setBillingInfo({ ...billingInfo, city: v.replace(/[^a-zA-Z\s]/g, '') })}
                       placeholder="Dhaka" focused={focused} setFocused={setFocused}
                       icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                     />
                     <Field id="zip" label="ZIP Code" value={billingInfo.zip}
                       onChange={(v) => setBillingInfo({ ...billingInfo, zip: v.replace(/[^0-9]/g, '') })}
                       placeholder="1230" maxLength={10} fontMono focused={focused} setFocused={setFocused}
                       icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
                     />
                   </div>
                </div>
              </div>
            </div>

            {/* ── Payment Card ── */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-light text-gray-900">Payment Method</h2>
                      <p className="text-xs text-gray-400 font-light">Choose how to pay</p>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="flex gap-3 mb-8">
                    <button
                      type="button"
                      className="flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10"
                    >
                      <div className="text-2xl">🔒</div>
                      <span className="text-xs font-medium text-emerald-700">SSLCommerz</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </button>
                  </div>

                  {/* SSLCommerz Info Panel */}
                  <div className="bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200/60 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">🔒</div>
                      <div>
                        <p className="text-sm font-medium text-emerald-800">Secure Payment via SSLCommerz</p>
                        <p className="text-xs text-emerald-500 font-light">Bangladesh's most trusted payment gateway</p>
                      </div>
                    </div>
                    {[
                      { label: 'Accepted Methods', value: 'bKash, Nagad, Cards, Net Banking' },
                      { label: 'Amount', value: `TK.${Math.round(total)}` },
                      { label: 'Currency', value: 'BDT' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-emerald-100">
                        <span className="text-xs text-gray-400 font-light uppercase tracking-widest">{label}</span>
                        <span className="text-sm text-emerald-700 font-medium">{value}</span>
                      </div>
                    ))}
                    <p className="text-xs text-emerald-500 font-light pt-2 text-center">
                      You will be redirected to SSLCommerz secure payment gateway
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Order Summary ─── */}
          <div className="space-y-6">
            <div className="sticky top-28">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/8 to-transparent rounded-3xl blur-xl" />
                <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

                  <div className="p-7">
                    <h2 className="text-lg font-light text-gray-900 mb-6">Order Summary</h2>

                    {/* Items */}
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-xl flex-shrink-0">
                            🌿
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-400 font-light">Qty {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900 flex-shrink-0">
                            TK.{Math.round(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t border-gray-100 pt-5 space-y-3">
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

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-base text-gray-900 font-medium">Total</span>
                          <span className="text-2xl font-extralight text-gray-900">
                            TK.{Math.round(total).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="group relative w-full mt-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light tracking-wide rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 rounded-2xl" />
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Place Order · TK.{Math.round(total).toLocaleString()}
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-5 mt-6 text-[11px] text-gray-300 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Secure
                      </div>
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Encrypted
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}