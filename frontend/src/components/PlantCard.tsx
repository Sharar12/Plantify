/* ==========================================================================
 * PlantCard Component
 * ==========================================================================
 * Displays a plant in either grid or list view mode with:
 *   - Thumbnail image (with fallback emoji placeholder)
 *   - Plant name, scientific name, category badge, status badge
 *   - Star rating (average with review count)
 *   - Stock/sold metrics
 *   - Price display with Add to Cart button (disabled when out of stock)
 *   - Wishlist toggle heart button (for customer-role users)
 *   - Hover effects, ambient glow, and responsive layout
 *   - Cart toast message on successful add
 * ========================================================================== */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plant } from '@/types/plant';

interface Review {
  id: number;
  stars: number;
  comment: string;
  user: { id: number; name: string };
  created_at: string;
}

export default function PlantCard({ plant, viewMode = 'grid' }: { plant: Plant; viewMode?: 'grid' | 'list' }) {
  const [avgRating, setAvgRating] = useState(plant.average_rating || 0);
  const [reviewCount, setReviewCount] = useState(plant.reviews_count || 0);
  const [inWishlist, setInWishlist] = useState(false);
  const [user, setUser] = useState<any>(null);

  const statusStyles: Record<string, string> = {
    available: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    limited: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    out_of_stock: 'bg-red-50 text-red-600 border border-red-200/60',
    rare: 'bg-pink-50 text-pink-600 border border-pink-200/60',
  };

  useEffect(() => {
    fetchReviews();
    checkWishlist();
  }, [plant.id]);

  const checkWishlist = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    const userData = JSON.parse(storedUser);
    setUser(userData);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlists/check/${plant.id}?user_id=${userData.id}`
      );
      const data = await res.json();
      setInWishlist(data.in_wishlist);
    } catch {}
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${plant.id}/reviews`
      );
      const data = await res.json();
      if (data.length > 0) {
        const avg =
          data.reduce((sum: number, r: Review) => sum + r.stars, 0) /
          data.length;
        setAvgRating(avg);
        setReviewCount(data.length);
      }
    } catch {}
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login first');
      return;
    }
    if (user.role !== 'customer') {
      alert('Only customers can add items to wishlist');
      return;
    }

    try {
      if (inWishlist) {
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlists/${plant.id}?user_id=${user.id}`,
          { method: 'DELETE' }
        );
        setInWishlist(false);
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, plant_id: plant.id }),
        });
        setInWishlist(true);
      }
    } catch {}
  };

  const [cartMsg, setCartMsg] = useState('');

  const isOutOfStock = (plant.stock ?? 0) <= 0;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const cart = localStorage.getItem('cart');
    const items = cart ? JSON.parse(cart) : [];
    const existing = items.find((i: any) => i.id === plant.id);

    if (existing) existing.quantity += 1;
    else items.push({ id: plant.id, name: plant.name, price: plant.price, quantity: 1 });

    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
    setCartMsg('Added to cart');
    setTimeout(() => setCartMsg(''), 2000);
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/plant/${plant.id}`} className="block">
        <div className="group relative bg-white rounded-3xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-stretch py-5 pr-5 pb-5">
            {/* Image */}
            <div className="relative w-64 h-48 ml-5 mt-1 flex-shrink-0 bg-gradient-to-br from-white to-emerald-50 overflow-hidden rounded-2xl border border-gray-200/60">
              {plant.thumbnail ? (
                <img
                  src={
                    plant.thumbnail.startsWith('http')
                      ? plant.thumbnail
                      : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${plant.thumbnail}`
                  }
                  alt={plant.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-6xl opacity-20">
                  🌿
                </div>
              )}

              {/* Low Stock Badge (list view) */}
              {plant.stock !== undefined && plant.stock > 0 && plant.stock <= 5 && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 to-amber-600/30 rounded-xl blur-sm" />
                    <div className="relative flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md border border-amber-300/50 rounded-xl shadow-lg">
                      <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[10px] font-semibold text-amber-700 tracking-wide whitespace-nowrap">
                        Only {plant.stock} left
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                      {plant.name}
                    </h3>
                    <p className="text-sm italic text-gray-400 mt-1">
                      {plant.scientific_name}
                    </p>
                    {plant.category && (
                      <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase rounded-md bg-emerald-50/80 text-emerald-600 border border-emerald-200/40">
                        {plant.category}
                      </span>
                    )}
                  </div>
                  {(!user || user.role === 'customer') && (
                    <button
                      onClick={toggleWishlist}
                      className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
                    >
                      <svg
                        className={`w-5 h-5 transition-colors duration-300 ${
                          inWishlist ? 'text-rose-500 fill-rose-500' : 'text-gray-400'
                        }`}
                        viewBox="0 0 24 24"
                        fill={inWishlist ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  )}
                </div>

                {plant.status && (
                  <span
                    className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full ${
                      statusStyles[plant.status] ||
                      'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {plant.status.replace('_', ' ')}
                  </span>
                )}

                <p className="text-sm text-gray-500 mt-4 line-clamp-2">{plant.description}</p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-sm font-medium text-gray-800">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({reviewCount})
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    Stock {plant.stock || 0} · Sold {plant.sold || 0}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-2xl font-extralight text-gray-900">
                    TK.{Math.round(plant.price || 0)}
                  </p>
                  {isOutOfStock ? (
                    <span className="px-6 py-2.5 bg-gray-100 text-gray-400 text-sm font-light rounded-xl cursor-not-allowed">
                      Out of Stock
                    </span>
                  ) : (
                    <button
                      onClick={addToCart}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/plant/${plant.id}`} className="block">
      <div className="group relative bg-white rounded-3xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1">

        {/* Ambient Hover Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Image Section */}
        <div className="relative h-56 bg-gradient-to-br from-white to-emerald-50 overflow-hidden">
          {plant.thumbnail ? (
            <img
              src={
                plant.thumbnail.startsWith('http')
                  ? plant.thumbnail
                  : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${plant.thumbnail}`
              }
              alt={plant.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl opacity-20">
              🌿
            </div>
          )}

          {/* Low Stock Badge */}
          {plant.stock !== undefined && plant.stock > 0 && plant.stock <= 5 && (
            <div className="absolute top-4 left-4 z-10">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 to-amber-600/30 rounded-xl blur-sm" />
                <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-amber-300/50 rounded-xl shadow-lg">
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[11px] font-semibold text-amber-700 tracking-wide whitespace-nowrap">
                    Only {plant.stock} left
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          {(!user || user.role === 'customer') && (
            <button
              onClick={toggleWishlist}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
            >
              <svg
                className={`w-5 h-5 transition-colors duration-300 ${
                  inWishlist ? 'text-rose-500 fill-rose-500' : 'text-gray-400'
                }`}
                viewBox="0 0 24 24"
                fill={inWishlist ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">

          {/* Title */}
          <h3 className="text-lg font-medium text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors">
            {plant.name}
          </h3>

          <p className="text-xs italic text-gray-400 mt-1">
            {plant.scientific_name}
          </p>

          {/* Category + Status */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {plant.category && (
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase rounded-md bg-emerald-50/80 text-emerald-600 border border-emerald-200/40">
                {plant.category}
              </span>
            )}

            {plant.status && (
              <span
                className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  statusStyles[plant.status] ||
                  'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {plant.status.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-sm font-medium text-gray-800">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({reviewCount})
            </span>
          </div>

          {/* Meta */}
          <p className="text-[11px] text-gray-400 mt-2 uppercase tracking-wider">
            Stock {plant.stock || 0} · Sold {plant.sold || 0}
          </p>

          {/* Price & CTA */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-2xl font-extralight text-gray-900">
              TK.{Math.round(plant.price || 0)}
            </p>

            <div className="relative">
              {isOutOfStock ? (
                <span className="px-4 py-2.5 bg-gray-100 text-gray-400 text-xs font-light rounded-xl cursor-not-allowed">
                  Out of Stock
                </span>
              ) : (
                <button
                  onClick={addToCart}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300"
                >
                  Add
                </button>
              )}
              {cartMsg && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm animate-fade-in-up">
                  {cartMsg}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}