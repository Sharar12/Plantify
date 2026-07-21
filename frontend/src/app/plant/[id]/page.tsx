'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Plant } from '@/types/plant';

interface Review {
  id: number;
  user_id: number;
  stars: number;
  comment: string;
  user: { id: number; name: string };
  created_at: string;
}

interface Question {
  id: number;
  customer_id: number;
  specialist_id: number | null;
  question: string;
  answer: string | null;
  customer: { id: number; name: string };
  specialist: { id: number; name: string } | null;
  created_at: string;
}

export default function PlantDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newReview, setNewReview] = useState({ stars: 5, comment: '' });
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [inWishlist, setInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'questions'>('reviews');
  const [cartAdded, setCartAdded] = useState(false);

  const allImages: string[] = plant?.thumbnail
    ? [plant.thumbnail, ...galleryImages]
    : galleryImages;

  const getImageSrc = (img: string) =>
    img?.startsWith('http')
      ? img
      : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${img}`;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user) return;
    checkPurchase();
  }, [user, id]);

  useEffect(() => {
    fetchReviews();
    fetchQuestions();
    fetchPlant();
    if (user) checkWishlist();
  }, [id, user]);

  const checkWishlist = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlists/check/${id}?user_id=${user.id}`
      );
      const data = await res.json();
      setInWishlist(data.in_wishlist);
    } catch {}
  };

  const toggleWishlist = async () => {
    if (!user) { alert('Please login first'); return; }
    setSubmitting(true);
    try {
      if (inWishlist) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlists/${id}?user_id=${user.id}`,
          { method: 'DELETE' }
        );
        if (res.ok) setInWishlist(false);
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlists`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, plant_id: parseInt(id) }),
          }
        );
        if (res.ok || res.status === 400) setInWishlist(true);
      }
    } catch {}
    setSubmitting(false);
  };

  const fetchPlant = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${id}`);
      const data = await res.json();
      setPlant(data);
      let parsedImages: string[] = [];
      if (data.images) {
        try {
          parsedImages =
            typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
        } catch { parsedImages = []; }
      }
      setGalleryImages(parsedImages);
      if (data.thumbnail) setSelectedImage(data.thumbnail);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${id}/reviews`
      );
      const data = await res.json();
      setReviews(data);
      if (user) {
        const userReview = data.find((r: any) => r.user_id === user.id);
        if (userReview) {
          setExistingReview(userReview as Review);
          setNewReview({ stars: userReview.stars, comment: userReview.comment || '' });
        } else setExistingReview(null);
      }
    } catch {}
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${id}/questions`
      );
      const data = await res.json();
      setQuestions(data);
    } catch {}
  };

  const checkPurchase = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`);
      const orders = await res.json();
      const purchased = orders.some(
        (o: any) =>
          o.user_id === user.id &&
          o.items?.some((item: any) => item.plant_id === parseInt(id)) &&
          o.status === 'delivered'
      );
      setHasPurchased(purchased);
    } catch {}
  };

  const handleAddReview = async () => {
    if (!user) { alert('Please login'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${id}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newReview, user_id: user.id }),
        }
      );
      if (res.ok) {
        setNewReview({ stars: 5, comment: '' });
        fetchReviews();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add review');
      }
    } catch { alert('Failed to add review'); }
    setSubmitting(false);
  };

  const handleAskQuestion = async () => {
    if (!user || user.role !== 'customer') {
      alert('Only customers can ask questions');
      return;
    }
    if (!newQuestion.trim()) { alert('Please enter a question'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${id}/questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: newQuestion, customer_id: user.id }),
        }
      );
      if (res.ok) {
        setNewQuestion('');
        fetchQuestions();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to submit');
      }
    } catch { alert('Failed to ask question'); }
    setSubmitting(false);
  };

  const addToCart = () => {
    const cart = localStorage.getItem('cart');
    const cartItems = cart ? JSON.parse(cart) : [];
    const existing = cartItems.find((item: any) => item.id === plant?.id);
    if (existing) existing.quantity += 1;
    else cartItems.push({ id: plant?.id, name: plant?.name, price: plant?.price, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
      : '0.0';

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.stars === star).length,
    pct:
      reviews.length > 0
        ? (reviews.filter((r) => r.stars === star).length / reviews.length) * 100
        : 0,
  }));

  /* ── Loading State ── */
  if (loading) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
            <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-emerald-300 animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
          <p className="text-sm text-gray-400 uppercase tracking-widest font-light animate-pulse">
            Loading Plant
          </p>
        </div>
      </div>
    </div>
  );

  if (!plant) return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-2xl font-extralight text-gray-400 mb-4">Plant not found</p>
        <button onClick={() => router.back()} className="text-emerald-600 text-sm hover:underline font-light">
          Go back
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white font-['Inter',sans-serif] antialiased">
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/30 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-100/10 via-transparent to-transparent pointer-events-none" />

      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 mb-10 px-5 py-2.5 text-sm font-light text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-full shadow-sm hover:shadow-md hover:border-emerald-200 hover:text-emerald-700 transition-all duration-300"
        >
          <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* ── MAIN CARD ── */}
        <div className="relative">
          {/* Ambient Glow Behind Card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 rounded-3xl blur-3xl" />

          <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-[0_30px_80px_-20px_rgba(16,185,129,0.12)] overflow-hidden">
            {/* Top Accent */}
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

            <div className="p-6 md:p-10 lg:p-12 space-y-16">

              {/* ── PRODUCT SECTION ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                {/* Image Column */}
                <div className="space-y-5">
                  {/* Main Image */}
                  <div className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100/40 h-[32rem] shadow-inner">
                    {selectedImage || plant.thumbnail ? (
                      <img
                        src={getImageSrc(selectedImage || plant.thumbnail || '')}
                        alt={plant.name}
                        className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-9xl opacity-10">🌿</span>
                      </div>
                    )}

                    {/* Wishlist on Image */}
                    <button
                      onClick={toggleWishlist}
                      disabled={submitting}
                      className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-gray-200/60 shadow-md flex items-center justify-center hover:scale-110 transition-all duration-300"
                    >
                      <svg
                        className={`w-5 h-5 transition-all duration-300 ${inWishlist ? 'text-rose-500 fill-rose-500 scale-110' : 'text-gray-300'}`}
                        viewBox="0 0 24 24"
                        fill={inWishlist ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Stock Badge */}
                    <div className="absolute top-5 left-5">
                      {plant.stock === 0 ? (
                        <span className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-200/60">
                          Out of Stock
                        </span>
                      ) : plant.stock && plant.stock <= 5 ? (
                        <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200/60">
                          Only {plant.stock} left
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Gallery Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(img)}
                          className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                            selectedImage === img
                              ? 'border-emerald-500 shadow-lg shadow-emerald-200'
                              : 'border-gray-200 hover:border-emerald-300 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={getImageSrc(img)}
                            alt={`View ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Column */}
                <div className="space-y-7 flex flex-col justify-between">
                  <div className="space-y-6">

                    {/* Plant Title */}
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-light mb-2">
                        {plant.category}
                      </p>
                      <h1 className="text-4xl lg:text-5xl font-extralight text-gray-900 tracking-tight leading-tight">
                        {plant.name}
                      </h1>
                      <p className="text-base italic text-gray-400 font-light mt-2">
                        {plant.scientific_name}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            className={`w-5 h-5 ${
                              s <= Math.round(parseFloat(avgRating))
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200 fill-gray-200'
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xl font-extralight text-gray-900">{avgRating}</span>
                      <span className="text-sm text-gray-400 font-light">
                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    {/* Price */}
                    <div>
                      <div className="h-px bg-gradient-to-r from-gray-100 to-transparent mb-6" />
                      <p className="text-5xl font-extralight text-gray-900 tracking-tight">
                        TK.{Math.round(plant.price || 0).toLocaleString()}
                      </p>
                      <div className="h-px bg-gradient-to-r from-gray-100 to-transparent mt-6" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'In Stock', value: plant.stock || 0 },
                        { label: 'Sold', value: plant.sold || 0 },
                        { label: 'Reviews', value: reviews.length },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="text-center bg-gray-50/80 rounded-xl py-4 px-2 border border-gray-100"
                        >
                          <p className="text-2xl font-extralight text-gray-900">{stat.value}</p>
                          <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-1 font-light">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={addToCart}
                      disabled={plant.stock === 0}
                      className={`group relative w-full py-4 rounded-2xl text-sm font-light tracking-wide overflow-hidden transition-all duration-500 ${
                        cartAdded
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : plant.stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02]'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {cartAdded ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Added to Cart
                          </>
                        ) : plant.stock === 0 ? (
                          'Out of Stock'
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </span>
                      {!cartAdded && plant.stock !== 0 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                      )}
                    </button>

                    <button
                      onClick={toggleWishlist}
                      disabled={submitting}
                      className={`w-full py-4 rounded-2xl text-sm font-light tracking-wide border transition-all duration-300 flex items-center justify-center gap-3 ${
                        inWishlist
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/50'
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 ${inWishlist ? 'fill-rose-400 text-rose-400' : ''}`}
                        viewBox="0 0 24 24"
                        fill={inWishlist ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {inWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
                    </button>
                  </div>

                  {/* Description */}
                  <div className="space-y-5 pt-4 border-t border-gray-100">
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-gray-400 font-light mb-2">
                        Description
                      </h3>
                      <p className="text-gray-600 font-light leading-relaxed text-sm">
                        {plant.description || 'No description available.'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-gray-400 font-light mb-2">
                        Care Tips
                      </h3>
                      <p className="text-gray-600 font-light leading-relaxed text-sm">
                        {plant.care_tips || 'No care tips available.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── REVIEWS & Q&A TABS ── */}
              <div>
                {/* Tab Header */}
                <div className="flex items-center gap-1 bg-gray-50/80 rounded-2xl p-1.5 border border-gray-100 mb-10 max-w-xs">
                  {(['reviews', 'questions'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 text-sm font-light rounded-xl transition-all duration-300 capitalize ${
                        activeTab === tab
                          ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab === 'reviews' ? `Reviews (${reviews.length})` : `Q&A (${questions.length})`}
                    </button>
                  ))}
                </div>

                {/* ── REVIEWS TAB ── */}
                {activeTab === 'reviews' && (
                  <div className="space-y-10 animate-fade-in">

                    {/* Rating Overview */}
                    {reviews.length > 0 && (
                      <div className="flex flex-col md:flex-row gap-8 p-8 bg-gray-50/60 rounded-2xl border border-gray-100">
                        <div className="text-center flex flex-col items-center justify-center min-w-[120px]">
                          <p className="text-7xl font-extralight text-gray-900">{avgRating}</p>
                          <div className="flex items-center gap-0.5 mt-3">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <svg
                                key={s}
                                className={`w-5 h-5 ${
                                  s <= Math.round(parseFloat(avgRating))
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-200 fill-gray-200'
                                }`}
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 font-light mt-2">
                            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                          </p>
                        </div>
                        <div className="flex-1 space-y-2.5">
                          {ratingDist.map((r) => (
                            <div key={r.star} className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 font-light w-4">{r.star}</span>
                              <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700"
                                  style={{ width: `${r.pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400 font-light w-6">{r.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Write Review */}
                    {user && hasPurchased && (
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
                        <div className="relative bg-white border border-gray-200/60 rounded-2xl p-7 shadow-sm">
                          <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent mb-6" />
                          <h4 className="text-lg font-light text-gray-900 mb-5">
                            {existingReview ? 'Update Your Review' : 'Write a Review'}
                          </h4>

                          {/* Star Selector */}
                          <div className="flex items-center gap-2 mb-5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setNewReview({ ...newReview, stars: star })}
                                className="transition-all duration-200 hover:scale-125"
                              >
                                <svg
                                  className={`w-8 h-8 transition-colors ${
                                    star <= newReview.stars
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-gray-200 fill-gray-200 hover:text-amber-300 hover:fill-amber-300'
                                  }`}
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-400 font-light">
                              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newReview.stars]}
                            </span>
                          </div>

                          <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Share your experience with this plant..."
                            rows={4}
                            className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-300 text-sm font-light focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 resize-none"
                          />

                          <button
                            onClick={handleAddReview}
                            disabled={submitting}
                            className="mt-4 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                          >
                            {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                          </button>
                        </div>
                      </div>
                    )}

                    {user && !hasPurchased && (
                      <div className="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl">
                        <p className="text-sm text-amber-700 font-light text-center">
                          Purchase and receive this plant to leave a review
                        </p>
                      </div>
                    )}

                    {!user && (
                      <div className="p-5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                        <p className="text-sm text-gray-400 font-light text-center">
                          Please{' '}
                          <a href="/login" className="text-emerald-600 hover:underline">log in</a>
                          {' '}to write a review
                        </p>
                      </div>
                    )}

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
                          <svg className="w-8 h-8 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-400 font-light">No reviews yet</p>
                        <p className="text-sm text-gray-300 font-light mt-1">Be the first to share your experience</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review, idx) => (
                          <div
                            key={review.id}
                            className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-emerald-100 hover:shadow-md transition-all duration-300"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
                                  {review.user?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {review.user?.name || 'Anonymous'}
                                  </p>
                                  <p className="text-xs text-gray-400 font-light">
                                    {new Date(review.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <svg
                                    key={s}
                                    className={`w-4 h-4 ${
                                      s <= review.stars
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-gray-200 fill-gray-200'
                                    }`}
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="mt-4 text-gray-600 font-light text-sm leading-relaxed pl-13">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Q&A TAB ── */}
                {activeTab === 'questions' && (
                  <div className="space-y-8 animate-fade-in">

                    {/* Ask Question */}
                    {user && user.role === 'customer' && (
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
                        <div className="relative bg-white border border-gray-200/60 rounded-2xl p-7 shadow-sm">
                          <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent mb-6" />
                          <h4 className="text-lg font-light text-gray-900 mb-5">Ask a Question</h4>
                          <textarea
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            placeholder="What would you like to know about this plant?"
                            rows={4}
                            className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-300 text-sm font-light focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 resize-none"
                          />
                          <button
                            onClick={handleAskQuestion}
                            disabled={submitting}
                            className="mt-4 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                          >
                            {submitting ? 'Submitting...' : 'Ask Question'}
                          </button>
                        </div>
                      </div>
                    )}

                    {user && user.role !== 'customer' && (
                      <div className="p-5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                        <p className="text-sm text-gray-400 font-light text-center">
                          Only customers can ask questions
                        </p>
                      </div>
                    )}

                    {!user && (
                      <div className="p-5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                        <p className="text-sm text-gray-400 font-light text-center">
                          Please{' '}
                          <a href="/login" className="text-emerald-600 hover:underline">log in</a>
                          {' '}to ask a question
                        </p>
                      </div>
                    )}

                    {/* Questions List */}
                    {questions.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                          <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-400 font-light">No questions yet</p>
                        <p className="text-sm text-gray-300 font-light mt-1">Be the first to ask</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {questions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-emerald-100 hover:shadow-md transition-all duration-300"
                          >
                            {/* Question */}
                            <div className="flex gap-4 p-6">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-medium text-sm flex-shrink-0">
                                Q
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-800 font-light text-sm leading-relaxed">{q.question}</p>
                                <p className="text-xs text-gray-400 font-light mt-2">
                                  {q.customer?.name || 'Customer'} ·{' '}
                                  {new Date(q.created_at).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Answer */}
                            {q.answer && (
                              <div className="flex gap-4 p-6 bg-emerald-50/40 border-t border-emerald-100/50">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 shadow-sm shadow-emerald-500/20">
                                  A
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-700 font-light text-sm leading-relaxed">{q.answer}</p>
                                  <p className="text-xs text-emerald-600 font-light mt-2">
                                    {q.specialist?.name || 'Plant Specialist'}
                                  </p>
                                </div>
                              </div>
                            )}

                            {!q.answer && (
                              <div className="px-6 py-3 bg-gray-50/40 border-t border-gray-100">
                                <p className="text-xs text-gray-300 font-light">Awaiting specialist response...</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}