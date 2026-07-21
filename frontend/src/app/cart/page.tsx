'use client';

// ============================================================
// CART PAGE — '/cart'
// Displays cart items, quantity controls, checkout button
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

// ═══════════════════════════════════════════════════════════════
// Cart — Main cart page component
// ═══════════════════════════════════════════════════════════════
export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [plantStocks, setPlantStocks] = useState<Record<number, number>>({});
  const [plantImages, setPlantImages] = useState<Record<number, string>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const cart = localStorage.getItem('cart');
    if (cart) {
      setCartItems(JSON.parse(cart));
    }
  }, []);

  useEffect(() => {
    fetchPlantStocks();
  }, [cartItems]);

  // ── Fetch plant stocks & images from API ──
  const fetchPlantStocks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`);
      const plants = await res.json();
      const stocks: Record<number, number> = {};
      const images: Record<number, string> = {};
      plants.forEach((p: any) => {
        stocks[p.id] = p.stock || 0;
        images[p.id] = p.thumbnail || '';
      });
      setPlantStocks(stocks);
      setPlantImages(images);
    } catch (error) {
      console.error('Failed to fetch plant stocks:', error);
    }
  };

  // ── Update cart state & persist to localStorage ──
  const updateCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  // ── Remove item from cart ──
  const handleRemove = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    updateCart(updatedCart);
  };

  // ── Change item quantity with stock validation ──
  const handleQuantityChange = (id: number, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      alert(`Only ${maxStock} items available in stock`);
      return;
    }
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ── Navigate to checkout page ──
  const handleCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    localStorage.setItem('checkout_items', JSON.stringify(cartItems));
    localStorage.setItem('checkout_total', totalPrice.toString());

    router.push('/checkout');
  };

  // ── Logout handler ──
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50 to-white font-['Inter',sans-serif] antialiased">
      <Header user={user} onLogout={handleLogout} />
      
      {/* Premium Background Overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/30 via-transparent to-transparent pointer-events-none" />
      
      <main className="flex-1 relative z-10 max-w-7xl self-center w-full px-6 lg:px-12 py-16">
        {/* ── Page header ── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-extralight text-gray-900 tracking-tight mb-3">
                Your Cart
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-emerald-600 via-emerald-400 to-transparent rounded-full" />
            </div>
            <div className="text-right">
              <p className="text-sm font-light text-gray-500 uppercase tracking-widest mb-1">Items Selected</p>
              <p className="text-4xl font-extralight text-emerald-700">{totalItems}</p>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* ── Empty cart state ── */
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-3xl blur-3xl opacity-70" />
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl shadow-emerald-500/5 p-20 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center">
                  <svg className="w-16 h-16 text-emerald-600/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-extralight text-gray-900 mb-4">Your Cart is Empty</h2>
                <p className="text-gray-500 font-light mb-10 leading-relaxed">
                  Discover our curated collection of premium botanical selections
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="group relative px-10 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-light tracking-wide overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/30 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Explore Collection
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Cart items list ── */}
            <div className="space-y-6 mb-12">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-900/5 p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200/60">
                    <div className="flex items-center gap-8">
                      
                      {/* ── Product image ── */}
                      <div className="w-28 h-28 rounded-xl overflow-hidden border border-emerald-200/40 shadow-inner flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                        {plantImages[item.id] ? (
                          <img
                            src={plantImages[item.id]?.startsWith('http') ? plantImages[item.id] : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${plantImages[item.id]}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <svg className="w-14 h-14 text-emerald-600/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>

                      {/* ── Product details ── */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-light text-emerald-700">
                            TK.{Math.round(item.price).toLocaleString()}
                          </p>
                          <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-light tracking-wide">
                            Stock: {plantStocks[item.id] || 0}
                          </span>
                        </div>
                      </div>

                      {/* ── Quantity controls ── */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-gray-50/80 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200/60">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1, plantStocks[item.id] || 0)}
                            className="w-10 h-10 rounded-full bg-white border border-gray-300/60 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center"
                            disabled={item.quantity <= 1}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <span className="w-12 text-center text-xl font-light text-gray-900">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1, plantStocks[item.id] || 0)}
                            className="w-10 h-10 rounded-full bg-white border border-gray-300/60 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center"
                            disabled={item.quantity >= (plantStocks[item.id] || 0)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* ── Subtotal & remove button ── */}
                      <div className="text-right min-w-[140px]">
                        <p className="text-2xl font-light text-gray-900 mb-3">
                          TK.{Math.round(item.price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="group/remove inline-flex items-center gap-2 text-sm text-gray-400 hover:text-red-600 transition-colors duration-300"
                        >
                          <svg className="w-4 h-4 group-hover/remove:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="font-light tracking-wide">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Checkout / order summary section ── */}
            <div className="relative">
              {/* Ambient Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-transparent rounded-3xl blur-3xl" />
              
              <div className="relative bg-gradient-to-br from-white via-emerald-50/30 to-white backdrop-blur-xl rounded-3xl border border-emerald-200/40 shadow-2xl shadow-emerald-500/10 overflow-hidden">
                {/* Top Accent Line */}
                <div className="h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                
                <div className="p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-sm font-light text-gray-500 uppercase tracking-widest mb-2">
                        Order Summary
                      </p>
                      <h2 className="text-5xl font-extralight text-gray-900">
                        TK.{Math.round(totalPrice).toLocaleString()}
                      </h2>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <p className="text-sm text-gray-500 font-light">
                        Total Items: <span className="text-emerald-700 font-normal">{totalItems}</span>
                      </p>
                      <p className="text-xs text-gray-400 font-light">
                        Tax included where applicable
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => router.push('/')}
                      className="flex-1 px-8 py-5 bg-white border border-gray-300 text-gray-700 rounded-full font-light tracking-wide hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:shadow-lg"
                    >
                      Continue Shopping
                    </button>
                    
                    <button
                      onClick={handleCheckout}
                      className="group flex-1 relative px-8 py-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-normal tracking-wide overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-green-500/40 hover:scale-[1.02]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        Proceed to Checkout
                        <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    </button>
                  </div>

                  {/* ── Trust badges ── */}
                  <div className="mt-8 pt-8 border-t border-gray-200/60">
                    <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-light">Secure Checkout</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                        </svg>
                        <span className="font-light">Free Delivery Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-light">Quality Guaranteed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .group {
          animation: slideUp 0.6s ease-out forwards;
        }

        .bg-size-200 {
          background-size: 200%;
        }

        .bg-pos-0 {
          background-position: 0%;
        }

        .bg-pos-100 {
          background-position: 100%;
        }
      `}</style>
    </div>
  );
}