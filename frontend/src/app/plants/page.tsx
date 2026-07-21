'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Plant } from '@/types/plant';

const plantsPerPage = 10;

// ── Premium Search Input ─────────────────────────────────────────────────────
const SearchInput = ({
  value, onChange, focused, setFocused,
}: {
  value: string; onChange: (v: string) => void;
  focused: string | null; setFocused: (v: string | null) => void;
}) => (
  <div className={`relative flex-1 transition-all duration-500 ${focused === 'search' ? 'scale-[1.015]' : ''}`}>
    {/* Glow Halo */}
    <div className={`absolute -inset-1 rounded-2xl blur-lg transition-all duration-500 ${
      focused === 'search'
        ? 'bg-gradient-to-r from-emerald-400/30 via-emerald-300/20 to-emerald-400/30 opacity-100'
        : 'opacity-0'
    }`} />
    {/* Glass Border Ring */}
    <div className={`absolute -inset-px rounded-2xl transition-all duration-500 ${
      focused === 'search'
        ? 'bg-gradient-to-r from-emerald-400/60 via-emerald-300/40 to-emerald-500/60'
        : 'bg-gradient-to-r from-gray-200/80 to-gray-200/80'
    }`} />
    <div className="relative flex items-center">
      {/* Search Icon */}
      <div className={`absolute left-4 transition-all duration-500 ${
        focused === 'search' ? 'scale-110' : ''
      }`}>
        <svg
          className="w-4 h-4 pointer-events-none transition-colors duration-500"
          style={{ color: focused === 'search' ? 'rgb(16,185,129)' : 'rgb(209,213,219)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search by name or scientific name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused('search')}
        onBlur={() => setFocused(null)}
        className="w-full pl-11 pr-10 py-4 bg-white/95 rounded-2xl text-gray-800 placeholder-gray-300 text-sm font-light focus:outline-none transition-all duration-500 shadow-sm"
        style={{ letterSpacing: '0.01em' }}
      />
      {/* Clear Button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-emerald-100 text-gray-400 hover:text-emerald-600 transition-all duration-300 hover:scale-110"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

// ── Premium Select Input ─────────────────────────────────────────────────────
const SelectInput = ({
  id, value, onChange, options, focused, setFocused,
}: {
  id: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  focused: string | null; setFocused: (v: string | null) => void;
}) => (
  <div className={`relative transition-all duration-500 ${focused === id ? 'scale-[1.015]' : ''}`}>
    {/* Glow Halo */}
    <div className={`absolute -inset-1 rounded-2xl blur-lg transition-all duration-500 ${
      focused === id
        ? 'bg-gradient-to-r from-emerald-400/30 via-emerald-300/20 to-emerald-400/30 opacity-100'
        : 'opacity-0'
    }`} />
    {/* Glass Border Ring */}
    <div className={`absolute -inset-px rounded-2xl transition-all duration-500 ${
      focused === id
        ? 'bg-gradient-to-r from-emerald-400/60 via-emerald-300/40 to-emerald-500/60'
        : 'bg-gradient-to-r from-gray-200/80 to-gray-200/80'
    }`} />
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(id)}
        onBlur={() => setFocused(null)}
        className="appearance-none w-full pl-5 pr-11 py-4 bg-white/95 rounded-2xl text-gray-700 text-sm font-light focus:outline-none transition-all duration-500 cursor-pointer shadow-sm"
        style={{ letterSpacing: '0.01em' }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-all duration-500 ${
        focused === id ? 'bg-emerald-50 rotate-180' : ''
      }`}>
        <svg
          className="w-3.5 h-3.5 pointer-events-none transition-colors duration-500"
          style={{ color: focused === id ? 'rgb(16,185,129)' : 'rgb(209,213,219)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

// ── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow = ({ delay }: { delay: number }) => (
  <tr className="border-b border-gray-50/80" style={{ animationDelay: `${delay}ms` }}>
    {[1, 2, 3, 4, 5].map(i => (
      <td key={i} className="px-6 py-5">
        <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg animate-pulse"
          style={{ width: i === 1 ? '70%' : i === 5 ? '50%' : '60%' }} />
      </td>
    ))}
  </tr>
);

const CategoryDropdown = ({ categories, selected, onChange }: {
  categories: string[]; selected: string[]; onChange: (v: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const label = selected.length === 0
    ? 'All Categories'
    : selected.length === 1
      ? selected[0]
      : `${selected[0]} +${selected.length - 1}`;

  return (
    <div className="relative min-w-[220px] flex-shrink-0" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-light text-gray-700 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 transition-all duration-300 cursor-pointer hover:border-emerald-300">
        <span className="truncate">{label}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-full max-h-72 overflow-y-auto bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl z-50">
          <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 cursor-pointer border-b border-gray-100">
            <input type="checkbox" checked={selected.length === 0}
              onChange={() => onChange([])}
              className="w-4 h-4 rounded accent-emerald-600" />
            <span className="text-sm font-light text-gray-700">All</span>
          </label>
          {categories.map(cat => (
            <label key={cat} className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-b-0">
              <input type="checkbox" checked={selected.includes(cat)}
                onChange={() => onChange(
                  selected.includes(cat) ? selected.filter(c => c !== cat) : [...selected, cat]
                )}
                className="w-4 h-4 rounded accent-emerald-600" />
              <span className="text-sm font-light text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Plants() {
  const router = useRouter();
  const [plants, setPlants]                   = useState<Plant[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [user, setUser]                       = useState<any>(null);
  const [categories, setCategories]           = useState<string[]>(['All']);
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy]                   = useState('name-asc');
  const [currentPage, setCurrentPage]         = useState(1);
  const [focused, setFocused]                 = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm]     = useState<number | null>(null);
  const [deletingId, setDeletingId]           = useState<number | null>(null);
  const [toast, setToast]                     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [hoveredRow, setHoveredRow]           = useState<number | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
      const data = await res.json();
      const categoryNames = data.map((cat: any) => cat.name);
      setCategories(['All', ...categoryNames]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories(['All']);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || JSON.parse(storedUser).role !== 'specialist') {
      router.push('/'); return;
    }
    setUser(JSON.parse(storedUser));
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`).then(r => r.json()),
      fetchCategories()
    ])
      .then(([plantsData]) => {
        setPlants(plantsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/'); };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPlants(prev => prev.filter(p => p.id !== id));
        setDeleteConfirm(null);
        setDeletingId(null);
        showToast('Plant removed from collection');
      }
    } catch {
      setDeletingId(null);
      showToast('Failed to remove plant', 'error');
    }
  };

  // categories now sourced from the API via fetchCategories()

  const filteredAndSortedPlants = plants
    .filter(plant => {
      const q = searchQuery.toLowerCase();
      return (
        (plant.name.toLowerCase().includes(q) || plant.scientific_name.toLowerCase().includes(q)) &&
        (selectedCategories.length === 0 || selectedCategories.some(cat => cat.toLowerCase() === plant.category.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc')   return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc')  return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc')  return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const totalPages      = Math.ceil(filteredAndSortedPlants.length / plantsPerPage);
  const startIndex      = (currentPage - 1) * plantsPerPage;
  const paginatedPlants = filteredAndSortedPlants.slice(startIndex, startIndex + plantsPerPage);

  const stockBadge = (stock: number) => {
    if (stock === 0)  return { label: 'Out of Stock', icon: '○', cls: 'bg-red-50 text-red-500 border border-red-100 shadow-sm' };
    if (stock <= 5)   return { label: `Low · ${stock}`, icon: '◐', cls: 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm' };
    return              { label: stock.toString(), icon: '●', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' };
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce((acc: (number | string)[], p, idx, arr) => {
      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col min-h-screen font-['Inter',sans-serif] antialiased overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f9fffe 40%, #f0faf5 70%, #ffffff 100%)' }}>

      {/* ── Deep Ambient Layers ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Primary radial — top-left emerald bloom */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(167,243,208,0.18) 0%, transparent 60%)' }} />
        {/* Secondary radial — bottom-right whisper */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 100% 100%, rgba(110,231,183,0.10) 0%, transparent 55%)' }} />
        {/* Centre vignette — depth */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 50%, rgba(240,250,245,0.30) 100%)' }} />
        {/* Fine grid texture */}
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* ── Floating Orbs ── */}
      <div className="fixed pointer-events-none" style={{ zIndex: 0, top: '8%', right: '6%' }}>
        <div className="w-72 h-72 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, rgb(52,211,153) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'pulse 8s ease-in-out infinite' }} />
      </div>
      <div className="fixed pointer-events-none" style={{ zIndex: 0, bottom: '15%', left: '3%' }}>
        <div className="w-56 h-56 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, rgb(16,185,129) 0%, transparent 70%)', filter: 'blur(35px)', animation: 'pulse 10s ease-in-out infinite reverse' }} />
      </div>

      <Header user={user} onLogout={handleLogout} />

      {/* ── Premium Toast ── */}
      <div className={`fixed top-6 right-6 z-[100] transition-all duration-700 ${
        toast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
      }`}>
        <div className={`relative flex items-center gap-4 pl-5 pr-6 py-4 rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-2xl ${
          toast?.type === 'success'
            ? 'bg-white/95 border-emerald-100 shadow-emerald-500/10'
            : 'bg-white/95 border-red-100 shadow-red-500/10'
        }`}>
          {/* Left accent bar */}
          <div className={`absolute left-0 inset-y-0 w-1 rounded-l-2xl ${
            toast?.type === 'success'
              ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
              : 'bg-gradient-to-b from-red-400 to-red-600'
          }`} />
          {/* Icon */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            toast?.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'
          }`}>
            {toast?.type === 'success' ? (
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <p className={`text-sm font-medium ${toast?.type === 'success' ? 'text-gray-800' : 'text-gray-800'}`}>
              {toast?.type === 'success' ? 'Success' : 'Error'}
            </p>
            <p className="text-xs text-gray-400 font-light mt-0.5">{toast?.msg}</p>
          </div>
        </div>
      </div>

      <main className="flex-1 relative max-w-[1400px] mx-auto w-full px-5 sm:px-8 lg:px-14 py-14"
        style={{ zIndex: 10 }}>

        {/* ── Hero Page Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div className="space-y-4">
            {/* Eyebrow label */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border"
              style={{
                background: 'linear-gradient(135deg, rgba(209,250,229,0.6) 0%, rgba(167,243,208,0.3) 100%)',
                borderColor: 'rgba(110,231,183,0.4)',
              }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700 uppercase tracking-[0.15em]">
                Plant Management
              </span>
            </div>

            {/* Main headline */}
            <div className="flex items-start gap-5">
              {/* Icon badge */}
              <div className="relative flex-shrink-0 mt-1">
                <div className="absolute -inset-2 rounded-2xl blur-lg opacity-40"
                  style={{ background: 'linear-gradient(135deg, rgb(52,211,153), rgb(16,185,129))' }} />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{ background: 'linear-gradient(145deg, rgb(52,211,153) 0%, rgb(5,150,105) 100%)' }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-extralight text-gray-900 tracking-[-0.02em] leading-none">
                  Plant
                  <span className="font-light" style={{ color: 'rgb(16,185,129)' }}> Collection</span>
                </h1>
                {/* Decorative underline */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-px w-20 rounded-full"
                    style={{ background: 'linear-gradient(90deg, rgb(16,185,129), transparent)' }} />
                  <div className="h-1 w-1 rounded-full bg-emerald-300" />
                  <div className="h-px w-10 rounded-full bg-emerald-100" />
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 ml-19 pl-[76px]">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extralight text-gray-900">{plants.length}</span>
                <span className="text-sm text-gray-400 font-light">total plants</span>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extralight" style={{ color: 'rgb(16,185,129)' }}>
                  {filteredAndSortedPlants.length}
                </span>
                <span className="text-sm text-gray-400 font-light">matching</span>
              </div>
              {selectedCategories.length > 0 && (
                <>
                  <div className="w-px h-6 bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-emerald-600 font-light">{selectedCategories.join(', ')}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CTA Button — Shimmer */}
          <div className="flex items-center gap-4">
            {/* Stats pill */}
            <div className="hidden lg:flex flex-col items-end gap-1 px-5 py-3 rounded-2xl border border-gray-100 bg-white/80 shadow-sm">
              <span className="text-xs text-gray-400 uppercase tracking-widest">In Stock</span>
              <span className="text-xl font-light text-gray-800">
                {plants.filter(p => (p.stock || 0) > 0).length}
              </span>
            </div>

            <button
              onClick={() => router.push('/plants/create')}
              className="group relative inline-flex items-center gap-3 px-7 py-4 text-white text-sm font-light tracking-[0.04em] rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03] focus:outline-none"
              style={{
                background: 'linear-gradient(145deg, rgb(52,211,153) 0%, rgb(16,185,129) 40%, rgb(5,150,105) 100%)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.25), 0 2px 8px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(16,185,129,0.35), 0 4px 16px rgba(16,185,129,0.20), inset 0 1px 0 rgba(255,255,255,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(16,185,129,0.25), 0 2px 8px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
              {/* Top gloss */}
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
              {/* Plus icon */}
              <div className="relative z-10 w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="relative z-10">Add New Plant</span>
            </button>
          </div>
        </div>

        {/* ── Premium Filter Bar ── */}
        <div className="relative mb-10">
          {/* Ambient glow behind card */}
          <div className="absolute -inset-3 rounded-3xl blur-2xl opacity-60"
            style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(167,243,208,0.25) 0%, transparent 70%)' }} />

          <div className="relative z-20 rounded-3xl"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(209,250,229,0.6)',
              boxShadow: '0 4px 24px rgba(16,185,129,0.06), 0 1px 6px rgba(0,0,0,0.04)',
            }}>
            {/* Top shimmer line */}
            <div className="h-px w-full"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.5) 30%, rgba(16,185,129,0.7) 50%, rgba(52,211,153,0.5) 70%, transparent 100%)' }} />

            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <SearchInput
                  value={searchQuery}
                  onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
                  focused={focused}
                  setFocused={setFocused}
                />
                <CategoryDropdown
                  categories={categories.filter(c => c !== 'All')}
                  selected={selectedCategories}
                  onChange={(v) => { setSelectedCategories(v); setCurrentPage(1); }}
                />
                <SelectInput
                  id="sort"
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'name-asc',   label: 'Name A–Z' },
                    { value: 'name-desc',  label: 'Name Z–A' },
                    { value: 'price-asc',  label: 'Price ↑' },
                    { value: 'price-desc', label: 'Price ↓' },
                  ]}
                  focused={focused}
                  setFocused={setFocused}
                />
              </div>

              {/* Active Filter Pills */}
              {(searchQuery || selectedCategories.length > 0) && (
                <div className="flex items-center gap-3 flex-wrap mt-5 pt-5 border-t border-gray-50">
                  <span className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-medium">Active:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-light transition-all duration-300 hover:scale-105 cursor-default"
                      style={{ background: 'linear-gradient(135deg, rgba(209,250,229,0.8) 0%, rgba(167,243,208,0.5) 100%)', border: '1px solid rgba(110,231,183,0.4)', color: 'rgb(5,150,105)' }}>
                      <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}
                        className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-emerald-200/60 transition-colors">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {selectedCategories.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-light transition-all duration-300 hover:scale-105 cursor-default"
                      style={{ background: 'linear-gradient(135deg, rgba(209,250,229,0.8) 0%, rgba(167,243,208,0.5) 100%)', border: '1px solid rgba(110,231,183,0.4)', color: 'rgb(5,150,105)' }}>
                      <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                      </svg>
                      {cat}
                      <button onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                        className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-emerald-200/60 transition-colors">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategories([]); }}
                    className="text-[11px] text-gray-300 hover:text-gray-500 font-light transition-colors duration-300 underline underline-offset-2">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Bottom shimmer line */}
            <div className="h-px w-full"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(167,243,208,0.3) 50%, transparent 100%)' }} />
          </div>
        </div>

        {/* ── Main Table Card ── */}
        <div className="relative">
          {/* Ambient glow */}
          <div className="absolute -inset-4 rounded-3xl blur-3xl opacity-40"
            style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(167,243,208,0.20) 0%, transparent 60%)' }} />

          <div className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(209,250,229,0.5)',
              boxShadow: '0 8px 40px rgba(16,185,129,0.07), 0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
            }}>
            {/* Top accent line */}
            <div className="h-[2px] w-full"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.6) 20%, rgba(16,185,129,0.9) 50%, rgba(52,211,153,0.6) 80%, transparent 100%)' }} />

            {loading ? (
              /* ── Premium Loader ── */
              <div className="flex flex-col items-center justify-center py-36 gap-8">
                {/* Concentric ring spinner */}
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-[3px] border-gray-100" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
                    style={{ borderTopColor: 'rgb(52,211,153)', animationDuration: '1s' }} />
                  <div className="absolute inset-3 rounded-full border-[2px] border-transparent animate-spin"
                    style={{ borderTopColor: 'rgba(16,185,129,0.5)', animationDuration: '1.5s', animationDirection: 'reverse' }} />
                  <div className="absolute inset-6 rounded-full border-[2px] border-transparent animate-spin"
                    style={{ borderTopColor: 'rgba(52,211,153,0.3)', animationDuration: '2s' }} />
                  <div className="absolute inset-[34px] rounded-full animate-pulse"
                    style={{ background: 'rgb(52,211,153)' }} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-light text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                    Loading Collection
                  </p>
                  <p className="text-xs text-gray-300 font-light">Please wait a moment</p>
                </div>
              </div>
            ) : paginatedPlants.length === 0 ? (
              /* ── Premium Empty State ── */
              <div className="text-center py-28 px-8">
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-30"
                    style={{ background: 'linear-gradient(135deg, rgb(52,211,153), rgb(16,185,129))' }} />
                  <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(145deg, rgba(209,250,229,0.8) 0%, rgba(167,243,208,0.4) 100%)', border: '1px solid rgba(110,231,183,0.3)' }}>
                    <svg className="w-11 h-11 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-extralight text-gray-700 mb-2">No Results Found</h3>
                <p className="text-sm text-gray-400 font-light max-w-xs mx-auto leading-relaxed mb-8">
                  We couldn't find any plants matching your current filters.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategories([]); }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-light text-emerald-700 border transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(209,250,229,0.6) 0%, rgba(167,243,208,0.3) 100%)',
                    borderColor: 'rgba(110,231,183,0.4)',
                    boxShadow: '0 2px 12px rgba(16,185,129,0.08)',
                  }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* ── Table Head ── */}
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(209,250,229,0.6)', background: 'linear-gradient(180deg, rgba(240,253,250,0.8) 0%, rgba(255,255,255,0) 100%)' }}>
                      <th className="w-0 px-0" />
                      {[
                        { label: 'Plant', align: 'text-left' },
                        { label: 'Category', align: 'text-left' },
                        { label: 'Price', align: 'text-left' },
                        { label: 'Stock', align: 'text-left' },
                        { label: 'Actions', align: 'text-center' },
                      ].map(col => (
                        <th key={col.label}
                          className={`px-7 py-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 ${col.align}`}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* ── Table Body ── */}
                  <tbody>
                    {paginatedPlants.map((plant, idx) => {
                      const stock   = stockBadge(plant.stock || 0);
                      const isHover = hoveredRow === plant.id;
                      return (
                        <tr
                          key={plant.id}
                          onMouseEnter={() => setHoveredRow(plant.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className="transition-all duration-300 relative"
                          style={{
                            borderBottom: '1px solid rgba(243,244,246,0.8)',
                            background: isHover
                              ? 'linear-gradient(90deg, rgba(240,253,250,0.7) 0%, rgba(255,255,255,0.9) 100%)'
                              : 'transparent',
                            transform: isHover ? 'translateX(2px)' : 'translateX(0)',
                          }}
                        >
                          {/* Left accent on hover */}
                          <td className="px-0 py-0 w-0 relative" style={{ width: 0, padding: 0 }}>
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full transition-all duration-300"
                              style={{
                                background: 'linear-gradient(180deg, rgb(52,211,153), rgb(16,185,129))',
                                opacity: isHover ? 1 : 0,
                                transform: isHover ? 'scaleY(1)' : 'scaleY(0)',
                              }} />
                          </td>

                          {/* ── Plant Cell ── */}
                          <td className="px-7 py-5 text-left">
                            <div className="flex items-center gap-4">
                              {/* Thumbnail */}
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <div className="absolute -inset-0.5 rounded-2xl blur-sm opacity-0 transition-opacity duration-300"
                                  style={{
                                    background: 'linear-gradient(135deg, rgb(52,211,153), rgb(16,185,129))',
                                    opacity: isHover ? 0.25 : 0,
                                  }} />
                                <div className="relative w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-lg"
                                  style={{
                                    background: 'linear-gradient(145deg, rgba(240,253,250,0.9) 0%, rgba(209,250,229,0.5) 100%)',
                                    border: '1px solid rgba(167,243,208,0.4)',
                                    boxShadow: isHover ? '0 4px 16px rgba(16,185,129,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                                    transition: 'box-shadow 0.3s ease',
                                  }}>
                                  {plant.thumbnail ? (
                                    <img
                                      src={plant.thumbnail.startsWith('http') ? plant.thumbnail : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${plant.thumbnail}`}
                                      alt={plant.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-emerald-300 text-base">🌿</span>
                                  )}
                                </div>
                              </div>

                              {/* Name block */}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate transition-colors duration-300"
                                  style={{ color: isHover ? 'rgb(5,150,105)' : 'rgb(31,41,55)', letterSpacing: '-0.01em' }}>
                                  {plant.name}
                                </p>
                                <p className="text-xs italic text-gray-400 font-light truncate mt-0.5"
                                  style={{ letterSpacing: '0.01em' }}>
                                  {plant.scientific_name}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* ── Category Cell ── */}
                          <td className="px-7 py-5 text-left">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-light transition-all duration-300"
                              style={{
                                background: isHover
                                  ? 'linear-gradient(135deg, rgba(209,250,229,0.7) 0%, rgba(167,243,208,0.4) 100%)'
                                  : 'rgba(249,250,251,0.8)',
                                border: isHover ? '1px solid rgba(110,231,183,0.4)' : '1px solid rgba(229,231,235,0.8)',
                                color: isHover ? 'rgb(5,150,105)' : 'rgb(107,114,128)',
                              }}>
                              <span className="w-1 h-1 rounded-full"
                                style={{ background: isHover ? 'rgb(52,211,153)' : 'rgb(209,213,219)' }} />
                              {plant.category}
                            </span>
                          </td>

                          {/* ── Price Cell ── */}
                          <td className="px-7 py-5 text-left">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs text-gray-300 font-light">TK</span>
                              <span className="text-sm font-light text-gray-800 tabular-nums"
                                style={{ letterSpacing: '-0.02em' }}>
                                {Math.round(plant.price).toLocaleString()}
                              </span>
                            </div>
                          </td>

                          {/* ── Stock Cell ── */}
                          <td className="px-7 py-5 text-left">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light ${stock.cls}`}>
                              <span className="text-[8px] leading-none">{stock.icon}</span>
                              {stock.label}
                            </span>
                          </td>

                          {/* ── Actions Cell ── */}
                          <td className="px-7 py-5 text-center">
                            <div className={`flex items-center justify-center gap-2 transition-all duration-300 ${
                              isHover ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                            }`}>
                              {/* Edit */}
                              <button
                                onClick={() => router.push(`/plants/edit/${plant.id}`)}
                                className="group/btn relative inline-flex items-center gap-1.5 pl-3 pr-4 py-2 text-xs font-light rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.04]"
                                style={{
                                  background: 'white',
                                  border: '1px solid rgba(229,231,235,0.8)',
                                  color: 'rgb(107,114,128)',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                }}
                                onMouseEnter={e => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.background = 'linear-gradient(135deg, rgba(209,250,229,0.7) 0%, rgba(240,253,250,0.9) 100%)';
                                  el.style.borderColor = 'rgba(110,231,183,0.5)';
                                  el.style.color = 'rgb(5,150,105)';
                                  el.style.boxShadow = '0 4px 16px rgba(16,185,129,0.12)';
                                }}
                                onMouseLeave={e => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.background = 'white';
                                  el.style.borderColor = 'rgba(229,231,235,0.8)';
                                  el.style.color = 'rgb(107,114,128)';
                                  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                                }}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setDeleteConfirm(plant.id)}
                                className="relative inline-flex items-center gap-1.5 pl-3 pr-4 py-2 text-xs font-light rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.04]"
                                style={{
                                  background: 'white',
                                  border: '1px solid rgba(229,231,235,0.8)',
                                  color: 'rgb(156,163,175)',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                }}
                                onMouseEnter={e => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.background = 'rgba(254,242,242,0.8)';
                                  el.style.borderColor = 'rgba(252,165,165,0.5)';
                                  el.style.color = 'rgb(239,68,68)';
                                  el.style.boxShadow = '0 4px 16px rgba(239,68,68,0.10)';
                                }}
                                onMouseLeave={e => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.background = 'white';
                                  el.style.borderColor = 'rgba(229,231,235,0.8)';
                                  el.style.color = 'rgb(156,163,175)';
                                  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                                }}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom shimmer line */}
            {!loading && paginatedPlants.length > 0 && (
              <div className="h-px w-full"
                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(167,243,208,0.3) 50%, transparent 100%)' }} />
            )}
          </div>
        </div>

        {/* ── Premium Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 px-2">
            {/* Results summary */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full"
                style={{ background: 'linear-gradient(180deg, rgb(52,211,153), rgb(16,185,129))' }} />
              <p className="text-sm font-light text-gray-400">
                Showing{' '}
                <span className="font-medium text-gray-700">
                  {startIndex + 1}–{Math.min(startIndex + plantsPerPage, filteredAndSortedPlants.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium text-gray-700">{filteredAndSortedPlants.length}</span>
                {' '}plants
              </p>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-light rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'white',
                  border: '1px solid rgba(229,231,235,0.8)',
                  color: 'rgb(107,114,128)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  if (currentPage !== 1) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(110,231,183,0.5)';
                    el.style.color = 'rgb(5,150,105)';
                    el.style.boxShadow = '0 4px 12px rgba(16,185,129,0.10)';
                  }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(229,231,235,0.8)';
                  el.style.color = 'rgb(107,114,128)';
                  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1.5">
                {pageNumbers.map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={`dot-${idx}`} className="w-8 text-center text-gray-300 text-sm font-light">···</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className="w-10 h-10 rounded-xl text-sm font-light transition-all duration-300 hover:scale-105"
                      style={currentPage === p ? {
                        background: 'linear-gradient(145deg, rgb(52,211,153) 0%, rgb(16,185,129) 50%, rgb(5,150,105) 100%)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 16px rgba(16,185,129,0.30), inset 0 1px 0 rgba(255,255,255,0.2)',
                      } : {
                        background: 'white',
                        color: 'rgb(107,114,128)',
                        border: '1px solid rgba(229,231,235,0.8)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      }}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              {/* Next */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-light rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'white',
                  border: '1px solid rgba(229,231,235,0.8)',
                  color: 'rgb(107,114,128)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  if (currentPage !== totalPages) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(110,231,183,0.5)';
                    el.style.color = 'rgb(5,150,105)';
                    el.style.boxShadow = '0 4px 12px rgba(16,185,129,0.10)';
                  }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(229,231,235,0.8)';
                  el.style.color = 'rgb(107,114,128)';
                  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                }}
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Footer Trust Bar ── */}
        <div className="mt-20 pt-10 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: '🌿', label: 'Premium Quality', sub: 'Hand-selected plants' },
              { icon: '🔒', label: 'Secure Platform', sub: 'Data protected' },
              { icon: '📦', label: 'Fast Delivery', sub: 'Nationwide shipping' },
              { icon: '💚', label: 'Expert Curated', sub: 'Specialist approved' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 group cursor-default">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(209,250,229,0.6) 0%, rgba(167,243,208,0.3) 100%)',
                    border: '1px solid rgba(110,231,183,0.3)',
                  }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">{item.label}</p>
                  <p className="text-[11px] text-gray-400 font-light">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center p-5 z-[90]"
          style={{ background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(12px)' }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div className="relative w-full max-w-sm">
            {/* Outer glow */}
            <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-30"
              style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)' }} />

            <div className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(32px)',
                border: '1px solid rgba(254,202,202,0.4)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(239,68,68,0.08)',
              }}>
              {/* Top accent */}
              <div className="h-[2px] w-full"
                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.5) 50%, transparent 100%)' }} />

              <div className="p-10 text-center">
                {/* Icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-2xl blur-xl opacity-20"
                    style={{ background: 'rgb(239,68,68)' }} />
                  <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, rgba(254,242,242,0.9) 0%, rgba(252,165,165,0.2) 100%)',
                      border: '1px solid rgba(252,165,165,0.3)',
                    }}>
                    <svg className="w-9 h-9 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-2xl font-extralight text-gray-800 mb-2 tracking-tight">Remove Plant</h3>
                <div className="w-10 h-px mx-auto mb-4 rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)' }} />
                <p className="text-sm text-gray-400 font-light leading-relaxed mb-8 max-w-[240px] mx-auto">
                  This will permanently remove the plant from your collection. This action is irreversible.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deletingId === deleteConfirm}
                    className="flex-1 relative flex items-center justify-center gap-2 py-3.5 text-sm font-light text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(145deg, rgb(248,113,113) 0%, rgb(239,68,68) 50%, rgb(220,38,38) 100%)',
                      boxShadow: '0 6px 20px rgba(239,68,68,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}>
                    <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 skew-x-12"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
                    {deletingId === deleteConfirm ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                      </svg>
                    )}
                    <span className="relative z-10">{deletingId === deleteConfirm ? 'Removing…' : 'Yes, Remove'}</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-3.5 text-sm font-light text-gray-500 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'rgba(249,250,251,0.8)',
                      border: '1px solid rgba(229,231,235,0.8)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'white';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(209,213,219,0.8)';
                      (e.currentTarget as HTMLElement).style.color = 'rgb(55,65,81)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(249,250,251,0.8)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229,231,235,0.8)';
                      (e.currentTarget as HTMLElement).style.color = 'rgb(107,114,128)';
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}