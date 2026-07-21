/* ── Payment Success Page ──────────────────────────────────────────────
 * This page wraps PaymentSuccessContent in a Suspense boundary,
 * showing a loading spinner while the payment verification content loads.
 * ───────────────────────────────────────────────────────────────────── */
import { Suspense } from 'react';
import PaymentSuccessContent from './PaymentSuccessContent';

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-light mt-4">Loading...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
