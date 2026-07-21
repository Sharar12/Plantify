'use client';

// ============================================================
// LOGIN PAGE — '/login'
// User authentication form with email/password, brand identity
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-gray-50/30 to-white overflow-hidden font-['Inter',sans-serif] antialiased px-4">

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent pointer-events-none" />

      {/* ── Floating Orbs ── */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-1/4 -right-32 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />

      {/* ── Decorative Grid ── */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Main Card ── */}
      <div className="relative z-10 w-full max-w-md">

        {/* Card Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-emerald-500/10 rounded-3xl blur-2xl" />

        <div className="relative bg-white/80 backdrop-blur-2xl border border-gray-200/50 rounded-3xl shadow-[0_30px_80px_-20px_rgba(16,185,129,0.15)] overflow-hidden">

          {/* Top Accent Line */}
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

          <div className="px-10 py-12">

            {/* ── Brand Mark ── */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative mb-5">
                <div className="absolute -inset-3 bg-emerald-400/20 rounded-2xl blur-lg" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <span className="text-3xl filter drop-shadow-sm">🌿</span>
                </div>
              </div>

              <h1 className="text-3xl font-extralight text-gray-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-gray-400 font-light mt-2 tracking-wide">
                Sign in to your Plantify account
              </p>

              {/* Decorative divider */}
              <div className="flex items-center gap-3 mt-6 w-full">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200" />
              </div>
            </div>

            {/* ── Error Banner ── */}
            {error && (
              <div className="mb-7 flex items-start gap-3 px-4 py-3.5 bg-red-50/80 border border-red-200/60 rounded-2xl animate-fade-in">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 font-light">{error}</p>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest">
                  Email Address
                </label>
                <div className={`relative transition-all duration-300 ${focused === 'email' ? 'scale-[1.01]' : ''}`}>
                  <div className={`absolute -inset-0.5 rounded-2xl blur transition-opacity duration-300 ${
                    focused === 'email' ? 'bg-emerald-400/20 opacity-100' : 'opacity-0'
                  }`} />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400 pointer-events-none transition-colors duration-300"
                         style={{ color: focused === 'email' ? 'rgb(16,185,129)' : undefined }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      placeholder="hello@example.com"
                      className="w-full pl-11 pr-5 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-300 text-sm font-light focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest">
                  Password
                </label>
                <div className={`relative transition-all duration-300 ${focused === 'password' ? 'scale-[1.01]' : ''}`}>
                  <div className={`absolute -inset-0.5 rounded-2xl blur transition-opacity duration-300 ${
                    focused === 'password' ? 'bg-emerald-400/20 opacity-100' : 'opacity-0'
                  }`} />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400 pointer-events-none transition-colors duration-300"
                         style={{ color: focused === 'password' ? 'rgb(16,185,129)' : undefined }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      placeholder="••••••••••"
                      className="w-full pl-11 pr-12 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-300 text-sm font-light focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 transition-all duration-300"
                    />
                    {/* Show/Hide Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-gray-300 hover:text-gray-500 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end pt-1">
                  <a href="#" className="text-xs text-gray-400 hover:text-emerald-600 font-light transition-colors duration-200">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 text-white text-sm font-light tracking-wide rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {/* Shimmer */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />

                  {/* Button BG Shift */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 rounded-2xl" />

                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* ── Footer ── */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-center text-sm text-gray-400 font-light">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-emerald-600 hover:text-emerald-700 font-normal transition-colors duration-200"
                >
                  Create account →
                </Link>
              </p>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 mt-6 text-[11px] text-gray-300 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                  Encrypted
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Private
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Brand */}
        <p className="text-center text-xs text-gray-300 font-light mt-6 tracking-widest uppercase">
          Plantify © 2024
        </p>
      </div>
    </div>
  );
}