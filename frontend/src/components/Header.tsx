/* ==========================================================================
 * Header Component
 * ==========================================================================
 * Main site navigation header with:
 *   - Logo section (Plantify branding with premium badge)
 *   - Desktop navigation menu (role-aware: shows specialist/admin/delivery links)
 *   - Action buttons (cart with badge, user profile, login/register, logout)
 *   - Mobile hamburger menu with responsive navigation
 *   - Scroll-aware styling (transparent → glassmorphism on scroll)
 *   - Live cart count via localStorage + custom events
 * ========================================================================== */
'use client';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const items = JSON.parse(cart);
        const count = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-700 ease-out ${
        isScrolled ? 'py-2 shadow-lg backdrop-blur-2xl bg-white/90' : 'py-4 bg-transparent'
      }`}
    >
      {/* Premium Container with Ambient Glow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative group">
          {/* Ambient Background Glow */}
          <div className={`absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-emerald-500/10 rounded-3xl blur-2xl transition-opacity duration-700 ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`} />
          
          {/* Main Header Container */}
          <div className={`relative backdrop-blur-2xl bg-white/80 border border-white/40 rounded-2xl transition-all duration-700 ${
            isScrolled 
              ? 'shadow-[0_20px_70px_-15px_rgba(16,185,129,0.15)]' 
              : 'shadow-[0_10px_40px_-10px_rgba(16,185,129,0.1)]'
          }`}>
            
            {/* Top Accent Line */}
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
            
            <div className="px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                
                {/* ========== LOGO SECTION ========== */}
                <div className="flex items-center gap-6">
                  <Link href="/" className="group/logo relative flex items-center gap-4">
                    {/* Premium Logo Icon */}
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/20 to-emerald-500/20 rounded-2xl blur-lg opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/25 transform transition-all duration-500 group-hover/logo:scale-110 group-hover/logo:rotate-3">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                        <span className="relative z-10 text-2xl filter drop-shadow-sm">🌿</span>
                      </div>
                    </div>

                    {/* Brand Text */}
                    <div className="hidden sm:block">
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extralight tracking-tight text-gray-900">
                          Plantify
                        </h1>
                        <span className="px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full">
                          Premium
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-light tracking-[0.2em] uppercase mt-0.5">
                        Botanical Excellence
                      </p>
                    </div>
                  </Link>
                </div>

                {/* ========== DESKTOP NAVIGATION ========== */}
                <nav className="hidden lg:flex items-center gap-2" role="navigation" aria-label="Main navigation">
                  
                  {/* Home Link */}
                  <Link 
                    href="/" 
                    className="group/nav relative px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl transition-all duration-300 hover:text-emerald-700 hover:bg-emerald-50/50"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500/60 group-hover/nav:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Home
                    </span>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 group-hover/nav:w-8" />
                  </Link>

                  {/* Specialist Links */}
                  {user?.role === 'specialist' && (
                    <>
                      <Link href="/categories" className="group/nav relative px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl transition-all duration-300 hover:text-emerald-700 hover:bg-emerald-50/50">
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500/60 group-hover/nav:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Categories
                        </span>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 group-hover/nav:w-8" />
                      </Link>
                      
                       <Link href="/plants" className="group/nav relative px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl transition-all duration-300 hover:text-emerald-700 hover:bg-emerald-50/50">
                         <span className="relative z-10 flex items-center gap-2">
                           <svg className="w-4 h-4 text-emerald-500/60 group-hover/nav:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                           </svg>
                           Plants
                         </span>
                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 group-hover/nav:w-8" />
                       </Link>
                       
                       <Link href="/specialist/qa" className="group/nav relative px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl transition-all duration-300 hover:text-emerald-700 hover:bg-emerald-50/50">
                         <span className="relative z-10 flex items-center gap-2">
                           <svg className="w-4 h-4 text-emerald-500/60 group-hover/nav:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                           </svg>
                           Q&A
                         </span>
                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 group-hover/nav:w-8" />
                       </Link>
                     </>

                  )}

                  {/* Delivery Links */}
                  {user?.role === 'delivery' && (
                    <Link href="/delivery" className="group/nav relative px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl transition-all duration-300 hover:text-emerald-700 hover:bg-emerald-50/50">
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500/60 group-hover/nav:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        Deliveries
                      </span>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 group-hover/nav:w-8" />
                    </Link>
                  )}

                  {/* Admin Links */}
                  {user?.role?.toLowerCase() === 'admin' && (
                    <>
                      <Link href="/admin?tab=plants" className="group/nav relative px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl transition-all duration-300 hover:text-emerald-700 hover:bg-emerald-50/50">
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500/60 group-hover/nav:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          Plants
                        </span>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 group-hover/nav:w-8" />
                      </Link>
                      
                      <Link href="/admin?tab=orders" className="group/nav relative px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl transition-all duration-300 hover:text-emerald-700 hover:bg-emerald-50/50">
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500/60 group-hover/nav:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Orders
                        </span>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 group-hover/nav:w-8" />
                      </Link>
                      
                      <Link href="/admin?tab=users" className="group/nav relative px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl transition-all duration-300 hover:text-emerald-700 hover:bg-emerald-50/50">
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500/60 group-hover/nav:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Users
                        </span>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 group-hover/nav:w-8" />
                      </Link>
                      
                      <Link href="/admin/analytics" className="group/nav relative px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl transition-all duration-300 hover:text-emerald-700 hover:bg-emerald-50/50">
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500/60 group-hover/nav:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Analytics
                        </span>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 group-hover/nav:w-8" />
                      </Link>
                    </>
                  )}
                </nav>

                {/* ========== ACTION BUTTONS ========== */}
                <div className="flex items-center gap-3">
                  
                  {/* Cart Button */}
                  {user?.role !== 'specialist' && user?.role !== 'admin' && user?.role !== 'delivery' && (
                    <Link href="/cart" className="group/cart relative">
                      <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-normal text-gray-700 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md hover:border-emerald-300/60 hover:bg-white transition-all duration-300 hover:-translate-y-0.5">
                        <svg className="w-4 h-4 text-emerald-600/70 group-hover/cart:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="hidden sm:inline font-light">Cart</span>
                        {cartCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-[10px] font-semibold text-white shadow-lg shadow-emerald-500/40 transform transition-transform duration-300 group-hover/cart:scale-110">
                            {cartCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}

                  {/* User Menu */}
                  {user ? (
                    <div className="flex items-center gap-2">
                      {/* Profile Button */}
                      <Link href="/profile" className="group/profile relative flex items-center gap-2.5 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md hover:border-emerald-300/60 hover:bg-white transition-all duration-300 hover:-translate-y-0.5">
                        <div className="relative w-9 h-9 flex-shrink-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-emerald-500/30 transform transition-transform duration-300 group-hover/profile:scale-110">
                          {user?.name?.charAt(0).toUpperCase() || '?'}
                          <div className="absolute inset-0 rounded-lg border border-white/30" />
                        </div>
                        <span className="hidden md:inline text-sm font-light text-gray-700 group-hover/profile:text-emerald-700 transition-colors">
                          {user?.name || 'User'}
                        </span>
                      </Link>

                      {/* Logout Button */}
                        <button
                        onClick={onLogout}
                        className="group/logout relative px-4 py-2.5 text-sm font-normal text-white bg-red-600 rounded-xl shadow-md shadow-red-500/25 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-700 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="hidden sm:inline font-light">Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Login Button */}
                      <Link 
                        href="/login" 
                        className="group/login relative px-5 py-2.5 text-sm font-normal text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2 font-light">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Login
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 transform scale-x-0 group-hover/login:scale-x-100 transition-transform origin-left duration-300" />
                      </Link>

                      {/* Register Button */}
                      <Link 
                        href="/register" 
                        className="group/register relative px-5 py-2.5 text-sm font-normal text-emerald-700 bg-white rounded-xl border border-emerald-200/60 shadow-sm hover:shadow-md hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span className="font-light">Register</span>
                      </Link>
                    </div>
                  )}

                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-xl transition-all duration-300"
                    aria-label="Toggle menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* ========== MOBILE MENU ========== */}
              {isMobileMenuOpen && (
                <div className="lg:hidden pt-4 pb-2 border-t border-gray-200/60 mt-4 animate-fade-in">
                  <nav className="flex flex-col gap-1">
                    <Link href="/" className="px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Home
                    </Link>
                    
                    {user?.role === 'specialist' && (
                      <>
                        <Link href="/categories" className="px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Categories
                        </Link>
                         <Link href="/plants" className="px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                           <svg className="w-4 h-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                           </svg>
                           Plants
                         </Link>
                         <Link href="/specialist/qa" className="px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                           <svg className="w-4 h-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                           </svg>
                           Q&A
                         </Link>
                       </>

                    )}
                    
                    {user?.role?.toLowerCase() === 'admin' && (
                      <>
                        <Link href="/admin?tab=plants" className="px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          Plants
                        </Link>
                        <Link href="/admin?tab=orders" className="px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Orders
                        </Link>
                        <Link href="/admin?tab=users" className="px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Users
                        </Link>
                        <Link href="/admin/analytics" className="px-4 py-2.5 text-sm font-light text-gray-700 rounded-xl hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Analytics
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}