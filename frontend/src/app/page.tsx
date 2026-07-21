'use client';

// ============================================================
// HOME PAGE (Landing Page) — '/'
// Hero section, search/filter bar, plant grid/list, pagination
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Header from '@/components/Header';
import PlantCard from '@/components/PlantCard';
import { Plant } from '@/types/plant';
import { safeParseJson } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

// ═══════════════════════════════════════════════════════════════
// CategoryDropdown — Multi-select dropdown for filtering plants
// ═══════════════════════════════════════════════════════════════
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
    <div className="relative group lg:w-64" ref={ref}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between pl-6 pr-12 py-4 bg-white/90 backdrop-blur-sm border border-emerald-200/40 rounded-2xl text-gray-700 focus:outline-none focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-200/30 transition-all duration-300 font-light cursor-pointer hover:border-emerald-300">
          <span className="truncate">{label}</span>
          <svg className={`w-5 h-5 text-emerald-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-2 w-full max-h-72 overflow-y-auto bg-white/95 backdrop-blur-xl border border-emerald-200/40 rounded-2xl shadow-xl shadow-emerald-500/10 z-50">
            <label className="flex items-center gap-3 px-5 py-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100">
              <input type="checkbox" checked={selected.length === 0}
                onChange={() => onChange([])}
                className="w-4 h-4 rounded accent-emerald-600" />
              <span className="text-sm font-light text-gray-700">All</span>
            </label>
            {categories.map(cat => (
              <label key={cat} className="flex items-center gap-3 px-5 py-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-b-0">
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
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Home — Main page component
// ═══════════════════════════════════════════════════════════════
export default function Home() {
  // ── State declarations ──
  const [plants, setPlants] = useState<Plant[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const columnsPerRow = 5;
  const rowsPerPageGrid = 2;
  const rowsPerPageList = 10;
  const plantsPerPage = viewMode === 'grid' ? columnsPerRow * rowsPerPageGrid : rowsPerPageList;

  // ── Reset pagination when filters change ──
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategories, sortBy]);

  // ── Fetch categories from API ──
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
      const data = await safeParseJson<any[]>(res);
      const categoryNames = data.map((cat: any) => cat.name);
      setCategories(['All', ...categoryNames]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories(['All']);
    }
  };

  // ── Fetch plants & categories on mount, load user ──
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`).then(res => safeParseJson<any[]>(res)),
      fetchCategories()
    ])
      .then(([plantsData]) => {
        setPlants(plantsData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // ── Logout handler ──
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('checkout_items');
    localStorage.removeItem('cart');
    localStorage.removeItem('order_items');
    localStorage.removeItem('order_to_place');
    localStorage.removeItem('pending_order_id');
    setUser(null);
  };

  // ── Filter & sort plants ──
  const filteredAndSortedPlants = plants
    .filter(plant => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = plant.name.toLowerCase().includes(query) ||
                          plant.scientific_name.toLowerCase().includes(query);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat => cat.toLowerCase() === plant.category.toLowerCase());
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filteredAndSortedPlants.length / plantsPerPage);
  const startIndex = (currentPage - 1) * plantsPerPage;
  const paginatedPlants = filteredAndSortedPlants.slice(startIndex, startIndex + plantsPerPage);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white font-['Inter',sans-serif] antialiased">
      
      {/* ── Premium background effects ── */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent pointer-events-none" />
      
      {/* ── Floating orbs (decorative) ── */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl animate-float-slower pointer-events-none" />

      {/* ── Navigation header ── */}
      <Header user={user} onLogout={handleLogout} />
      
      <main className="flex flex-1 flex-col items-center relative z-10 py-16 px-4 sm:px-6 lg:px-12">
        <div className="w-full max-w-[1600px]">
          
          {/* ── Hero section ── */}
          <div className="mb-16 text-center relative">
            <div className="inline-block">
              <div className="mb-6">
                <h1 className="text-7xl font-extralight tracking-tight text-gray-900 mb-4 leading-tight">
                  Discover
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 font-light mt-2">
                    Premium Botanicals
                  </span>
                </h1>
                
                {/* Decorative line */}
                <div className="flex items-center justify-center gap-3 mt-6">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-400/40" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-400/40" />
                </div>
              </div>
              
              <p className="text-sm text-gray-400 uppercase tracking-[0.3em] font-light">
                Curated Greenery Collection
              </p>
            </div>

            {/* ── Stats bar ── */}
            <div className="mt-12 flex items-center justify-center gap-12">
              <div className="text-center">
                <p className="text-3xl font-extralight text-emerald-600">{plants.length}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Species</p>
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
              <div className="text-center">
                <p className="text-3xl font-extralight text-emerald-600">{categories.length - 1}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Categories</p>
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
              <div className="text-center">
                <p className="text-3xl font-extralight text-emerald-600">100%</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Premium</p>
              </div>
            </div>
          </div>

          {/* ── Filter section ── */}
          <div className="mb-16 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/5 via-emerald-400/10 to-emerald-500/5 rounded-3xl blur-2xl" />
            
            <div className="relative z-20 backdrop-blur-2xl bg-white/80 border border-emerald-200/30 rounded-3xl shadow-[0_20px_70px_-15px_rgba(16,185,129,0.15)]">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
              
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-5">
                  
                  {/* ── Search input ── */}
                  <div className="flex-1 relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                        <svg className="w-5 h-5 text-emerald-400 transition-colors group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search by name or scientific name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-emerald-200/40 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-200/30 transition-all duration-300 font-light"
                      />
                      
                      {/* ── Clear search button ── */}
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors group/clear"
                        >
                          <svg className="w-4 h-4 text-gray-500 group-hover/clear:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Category dropdown ── */}
                  <CategoryDropdown
                    categories={categories.filter(c => c !== 'All')}
                    selected={selectedCategories}
                    onChange={setSelectedCategories}
                  />

                  {/* ── Sort dropdown ── */}
                  <div className="relative group lg:w-56">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none w-full pl-6 pr-12 py-4 bg-white/90 backdrop-blur-sm border border-emerald-200/40 rounded-2xl text-gray-700 focus:outline-none focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-200/30 transition-all duration-300 font-light cursor-pointer"
                      >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="price-asc">Price (Low-High)</option>
                        <option value="price-desc">Price (High-Low)</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-emerald-400 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Active filters display ── */}
                {(searchQuery || selectedCategories.length > 0) && (
                  <div className="mt-6 pt-6 border-t border-emerald-200/30">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-gray-400 uppercase tracking-widest">Active Filters:</span>
                      
                      {searchQuery && (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full text-sm text-emerald-700">
                          Search: "{searchQuery}"
                          <button
                            onClick={() => setSearchQuery('')}
                            className="hover:bg-emerald-100 rounded-full p-0.5 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                      
                      {selectedCategories.map(cat => (
                        <span key={cat} className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full text-sm text-emerald-700">
                          {cat}
                          <button
                            onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                            className="hover:bg-emerald-100 rounded-full p-0.5 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Loading state ── */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-32">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-emerald-200/30 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
                <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin-slow" />
              </div>
              <p className="mt-8 text-sm text-gray-400 uppercase tracking-widest font-light animate-pulse">
                Loading Collection...
              </p>
            </div>
          ) : (
            <>
              {/* ── Results header ── */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extralight text-gray-900">
                    {filteredAndSortedPlants.length} {filteredAndSortedPlants.length === 1 ? 'Plant' : 'Plants'}
                  </h2>
                  <p className="text-sm text-gray-400 font-light mt-1">
                    {selectedCategories.length > 0 ? `in ${selectedCategories.join(', ')}` : 'Available Now'}
                  </p>
                </div>

                {/* ── Grid / List toggle ── */}
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200/30 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
                      viewMode === 'grid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
                      viewMode === 'list'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* ── Plant grid/list container ── */}
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl blur-3xl opacity-40 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(167,243,208,0.25) 0%, transparent 60%)' }} />
                
                <div className="relative border border-emerald-200/40 rounded-3xl bg-gradient-to-br from-white/70 via-white/50 to-white/70 backdrop-blur-md shadow-[0_20px_70px_-15px_rgba(16,185,129,0.1)] overflow-hidden">
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                  
                  <div className="p-8 lg:p-12">
                    {filteredAndSortedPlants.length > 0 ? (
                      viewMode === 'grid' ? (
                        <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${columnsPerRow}, minmax(0, 1fr))` }}>
                          {paginatedPlants.map((plant, index) => (
                            <div
                              key={plant.id}
                              className="opacity-0 animate-fade-in-up"
                              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                            >
                              <PlantCard plant={plant} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          {paginatedPlants.map((plant, index) => (
                            <div
                              key={plant.id}
                              className="opacity-0 animate-fade-in-up"
                              style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'forwards' }}
                            >
                              <PlantCard plant={plant} viewMode="list" />
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      /* ── Empty state ── */
                      <div className="text-center py-24">
                        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100/30 flex items-center justify-center">
                          <svg className="w-16 h-16 text-emerald-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-extralight text-gray-900 mb-3">
                          No Plants Found
                        </h3>
                        <p className="text-gray-400 font-light mb-8 max-w-md mx-auto">
                          We couldn't find any plants matching your search criteria. Try adjusting your filters or search terms.
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategories([]);
                          }}
                          className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full font-light hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Pagination ── */}
              {filteredAndSortedPlants.length > 0 && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200/30 rounded-xl px-6 py-3">
                    <span className="text-sm text-gray-500 font-light">
                      Showing {startIndex + 1}–{Math.min(startIndex + plantsPerPage, filteredAndSortedPlants.length)} of {filteredAndSortedPlants.length} results
                    </span>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm rounded-xl border border-emerald-200/40 bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 text-sm rounded-xl border transition-all ${
                            currentPage === page
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                              : 'bg-white/80 text-gray-600 border-emerald-200/40 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm rounded-xl border border-emerald-200/40 bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 mt-20 border-t border-emerald-200/30 bg-white/60 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 font-light">
              © 2024 Plantify. Premium botanical collection.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Custom animations ── */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }

        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 40px) scale(1.15); }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 25s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
