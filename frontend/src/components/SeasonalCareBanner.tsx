import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SeasonalCareBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Spring Growth Season Tips
        </div>
        <h3 className="text-2xl font-bold tracking-tight">Time to Prune and Re-pot!</h3>
        <p className="text-sm text-emerald-100/90 leading-relaxed">
          Plants awaken from winter dormancy in March. Give them fresh organic potting mix and a gentle nutrient boost.
        </p>
        <div className="pt-2">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-emerald-900 text-sm font-semibold hover:bg-emerald-50 transition shadow-sm"
          >
            Shop Organic Soils & Pots <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
