'use client';

// ============================================================
// CATEGORIES PAGE (Specialist) — '/categories'
// CRUD management for plant categories (create, edit, delete)
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const categoriesPerPage = 10;

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

// ── Input Field ─────────────────────────────────────────────────────────────
const Field = ({
  id, label, value, onChange, placeholder, focused, setFocused, isTextarea = false,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; focused: string | null; setFocused: (v: string | null) => void;
  isTextarea?: boolean;
}) => (
  <div className="space-y-2">
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest">
      {label}
    </label>
    <div className={`relative transition-all duration-300 ${focused === id ? 'scale-[1.01]' : ''}`}>
      <div className={`absolute -inset-0.5 rounded-xl blur transition-opacity duration-300 ${
        focused === id ? 'bg-emerald-400/20 opacity-100' : 'opacity-0'
      }`} />
      {isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          placeholder={placeholder}
          rows={3}
          className="relative w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm font-light focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 transition-all duration-300 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          placeholder={placeholder}
          className="relative w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm font-light focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 transition-all duration-300"
        />
      )}
    </div>
  </div>
);

export default function Categories() {
  const router = useRouter();
  const [user, setUser]               = useState<User | null>(null);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading]         = useState(false);
  const [focused, setFocused]         = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { router.push('/login'); return; }
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'specialist') { router.push('/'); return; }
    setUser(userData);
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch { showToast('Failed to fetch categories', 'error'); }
  };

  const handleCreate = async () => {
    if (!newCategory.name.trim()) { showToast('Category name is required', 'error'); return; }
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      setNewCategory({ name: '', description: '' });
      fetchCategories();
      showToast('Category created successfully');
    } catch { showToast('Failed to create category', 'error'); }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });
      setEditingCategory(null);
      fetchCategories();
      showToast('Category updated successfully');
    } catch { showToast('Failed to update category', 'error'); }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchCategories();
      showToast('Category deleted');
    } catch { showToast('Failed to delete category', 'error'); }
  };

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/'); };

  const totalPages = Math.ceil(categories.length / categoriesPerPage);
  const startIndex = (currentPage - 1) * categoriesPerPage;
  const paginatedCategories = categories.slice(startIndex, startIndex + categoriesPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white font-['Inter',sans-serif] antialiased">

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-100/15 via-transparent to-transparent pointer-events-none" />

      <Header user={user} onLogout={handleLogout} />

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-50/95 border-emerald-200/60 text-emerald-700'
            : 'bg-red-50/95 border-red-200/60 text-red-700'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p className="text-sm font-light">{toast.msg}</p>
        </div>
      )}

      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-12">

        {/* ── Page Header ── */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extralight text-gray-900 tracking-tight">
                Categories
              </h1>
              <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent mt-2 rounded-full" />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-light ml-16">
            Manage your plant taxonomy — {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10">

          {/* ── LEFT: Create Panel ── */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/8 to-transparent rounded-3xl blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-light text-gray-900">New Category</h2>
                  </div>

                  <div className="space-y-5">
                    <Field
                      id="new-name"
                      label="Category Name"
                      value={newCategory.name}
                      onChange={(v) => setNewCategory({ ...newCategory, name: v })}
                      placeholder="e.g., Indoor Plants, Succulents"
                      focused={focused}
                      setFocused={setFocused}
                    />
                    <Field
                      id="new-desc"
                      label="Description"
                      value={newCategory.description}
                      onChange={(v) => setNewCategory({ ...newCategory, description: v })}
                      placeholder="Brief description of this category"
                      focused={focused}
                      setFocused={setFocused}
                      isTextarea
                    />

                    <button
                      onClick={handleCreate}
                      disabled={loading}
                      className="group relative w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light tracking-wide rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 rounded-2xl" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Category
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Categories List ── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extralight text-gray-900">
                All Categories
              </h2>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium rounded-full">
                {categories.length} total
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 font-light">No categories yet</p>
                  <p className="text-sm text-gray-300 font-light mt-1">Create your first category using the panel</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedCategories.map((category, idx) => (
                  <div
                    key={category.id}
                    className="group relative"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Card Hover Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200/60 transition-all duration-300 overflow-hidden">
                      <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {editingCategory?.id === category.id ? (
                        /* ── Edit Mode ── */
                        <div className="p-6 space-y-5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-xs text-amber-600 font-light uppercase tracking-widest">Editing</span>
                          </div>
                          <Field
                            id={`edit-name-${category.id}`}
                            label="Category Name"
                            value={editingCategory.name}
                            onChange={(v) => setEditingCategory({ ...editingCategory, name: v })}
                            focused={focused}
                            setFocused={setFocused}
                          />
                          <Field
                            id={`edit-desc-${category.id}`}
                            label="Description"
                            value={editingCategory.description}
                            onChange={(v) => setEditingCategory({ ...editingCategory, description: v })}
                            focused={focused}
                            setFocused={setFocused}
                            isTextarea
                          />
                          <div className="flex gap-3 pt-1">
                            <button
                              onClick={handleUpdate}
                              disabled={loading}
                              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="px-5 py-3 bg-white border border-gray-200 text-gray-500 text-sm font-light rounded-xl hover:border-gray-300 hover:text-gray-700 transition-all duration-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── View Mode ── */
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                              {/* Category Icon */}
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/40 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-emerald-600/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="text-base font-medium text-gray-900 truncate">
                                  {category.name}
                                </h3>
                                <p className="text-sm text-gray-400 font-light mt-1 line-clamp-2">
                                  {category.description || 'No description provided'}
                                </p>
                                <p className="text-[11px] text-gray-300 font-light mt-2 uppercase tracking-widest">
                                  Added {new Date(category.created_at).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => setEditingCategory(category)}
                                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-light text-gray-500 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all duration-300"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(category.id)}
                                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-light text-gray-400 bg-white border border-gray-200 rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 transition-all duration-300"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {categories.length > categoriesPerPage && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200/30 rounded-xl px-6 py-3">
                      <span className="text-sm text-gray-500 font-light">
                        Showing {startIndex + 1}–{Math.min(startIndex + categoriesPerPage, categories.length)} of {categories.length}
                      </span>
                    </div>
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm !== null && (
        <div
          className="fixed inset-0 bg-black/15 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div className="relative w-full max-w-sm">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 to-transparent rounded-3xl blur-2xl" />
            <div className="relative bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-2xl overflow-hidden">
              <div className="h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent" />
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-2">Delete Category</h3>
                <p className="text-sm text-gray-400 font-light mb-8">
                  This action cannot be undone. All plants in this category may be affected.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-light rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-[1.02]"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 text-sm font-light rounded-2xl hover:border-gray-300 hover:text-gray-700 transition-all duration-300"
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