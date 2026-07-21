'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Category {
  id: number;
  name: string;
}

// ── Hoisted Field Components (no focus loss) ─────────────────────────────────

const FormField = ({
  id, label, required = false, focused, setFocused, children,
}: {
  id: string; label: string; required?: boolean;
  focused: string | null; setFocused: (v: string | null) => void;
  children: (props: { onFocus: () => void; onBlur: () => void; isFocused: boolean }) => React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest">
      {label}
      {required && <span className="text-emerald-500 ml-1">*</span>}
    </label>
    <div className={`relative transition-all duration-300 ${focused === id ? 'scale-[1.005]' : ''}`}>
      <div className={`absolute -inset-0.5 rounded-xl blur transition-opacity duration-300 ${
        focused === id ? 'bg-emerald-400/20 opacity-100' : 'opacity-0'
      }`} />
      {children({
        onFocus: () => setFocused(id),
        onBlur:  () => setFocused(null),
        isFocused: focused === id,
      })}
    </div>
  </div>
);

const inputCls = "relative w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm font-light focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 transition-all duration-300";
const textareaCls = `${inputCls} resize-none`;

export default function CreatePlant() {
  const router            = useRouter();
  const thumbnailRef      = useRef<HTMLInputElement>(null);
  const imagesRef         = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [thumbnail, setThumbnail]   = useState('');
  const [images, setImages]         = useState<string[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [user, setUser]             = useState<any>(null);
  const [focused, setFocused]       = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [dragOver, setDragOver]     = useState<'thumb' | 'images' | null>(null);

  const [formData, setFormData] = useState({
    name: '', scientific_name: '', category: '',
    price: '', description: '', care_tips: '', stock: '',
  });

  const sanitizePrice = (value: string) => {
    // Allow only digits and at most one decimal point
    const sanitized = value.replace(/[^\d.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    return sanitized;
  };

  const sanitizeStock = (value: string) => {
    // Allow only digits
    return value.replace(/\D/g, '');
  };

  const preventNonNumeric = (e: React.KeyboardEvent, allowDecimal: boolean = false) => {
    // Allow navigation & editing keys
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    // Allow Ctrl shortcuts (copy, paste, cut, select all)
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
    // Allow decimal point for price
    if (allowDecimal && e.key === '.') return;
    // Block everything that's not a digit
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch { console.error('Failed to fetch categories'); }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > 10 * 1024 * 1024) {
      showToast(`${file.name} exceeds 10MB limit`, 'error'); return null;
    }
    if (!['image/jpeg','image/jpg','image/png','image/gif','image/webp'].includes(file.type)) {
      showToast(`${file.name} is not a valid image type`, 'error'); return null;
    }
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      return res.ok ? data.url : null;
    } catch { return null; }
  };

  const handleThumbnailUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) setThumbnail(url);
    else showToast('Thumbnail upload failed', 'error');
    setUploading(false);
  };

  const handleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > 10) {
      showToast('Maximum 10 gallery images allowed', 'error'); return;
    }
    setUploading(true);
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) setImages(prev => [...prev, url]);
    }
    setUploading(false);
    if (imagesRef.current) imagesRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!thumbnail) { setError('Please upload a thumbnail image'); setLoading(false); return; }
    if (!images || images.length === 0) { setError('Please add at least one gallery image'); setLoading(false); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          specialist_id: userData?.id,
          thumbnail, images,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        const validationMsg = data.errors
          ? Object.values(data.errors).flat().join('. ')
          : null;
        setError(validationMsg || data.message || 'Failed to create plant');
      } else {
        router.push('/plants');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem('user'); setUser(null); router.push('/'); };

  const getImgSrc = (url: string) =>
    url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${url}`;

  // ── Completion progress ──────────────────────────────────────────────────
  const filled = [
    formData.name, formData.scientific_name, formData.category,
    formData.price, formData.description, formData.care_tips,
    formData.stock, thumbnail,
  ].filter(Boolean).length;
  const progress = Math.round((filled / 8) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white font-['Inter',sans-serif] antialiased">

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-100/15 via-transparent to-transparent pointer-events-none" />

      <Header user={user} onLogout={handleLogout} />

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-xl ${
          toast.type === 'success'
            ? 'bg-emerald-50/95 border-emerald-200/60 text-emerald-700'
            : 'bg-red-50/95 border-red-200/60 text-red-700'
        }`}>
          {toast.type === 'success'
            ? <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            : <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          }
          <p className="text-sm font-light">{toast.msg}</p>
        </div>
      )}

      <main className="flex-1 relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-12">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-extralight text-gray-900 tracking-tight">Add New Plant</h1>
                <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent mt-2 rounded-full" />
              </div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-light text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-full shadow-sm hover:shadow-md hover:border-emerald-200 hover:text-emerald-700 transition-all duration-300"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* ── Completion Progress ── */}
        <div className="mb-10 relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-light text-gray-500 uppercase tracking-widest">Form Completion</span>
              <span className="text-sm font-light text-emerald-600">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="mb-8 flex items-start gap-3 px-5 py-4 bg-red-50/80 border border-red-200/60 rounded-2xl">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600 font-light">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

            {/* ── LEFT: Form Fields ── */}
            <div className="space-y-7">

              {/* Basic Info Card */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                  <div className="p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-base font-light text-gray-700">Basic Information</h2>
                    </div>

                    <FormField id="name" label="Plant Name" required focused={focused} setFocused={setFocused}>
                      {({ onFocus, onBlur }) => (
                        <input type="text" required value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="e.g., Peace Lily"
                          className={inputCls}
                        />
                      )}
                    </FormField>

                    <FormField id="scientific_name" label="Scientific Name" focused={focused} setFocused={setFocused}>
                      {({ onFocus, onBlur }) => (
                        <input type="text" value={formData.scientific_name}
                          onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="e.g., Spathiphyllum wallisii"
                          className={`${inputCls} italic`}
                        />
                      )}
                    </FormField>

                    <div className="grid grid-cols-2 gap-5">
                      <FormField id="category" label="Category" required focused={focused} setFocused={setFocused}>
                        {({ onFocus, onBlur }) => (
                          <div className="relative">
                            <select required value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              onFocus={onFocus} onBlur={onBlur}
                              className={`${inputCls} appearance-none cursor-pointer pr-10`}
                            >
                              <option value="">Select category</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))}
                            </select>
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        )}
                      </FormField>

                      <FormField id="price" label="Price (TK)" required focused={focused} setFocused={setFocused}>
                        {({ onFocus, onBlur }) => (
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-light pointer-events-none">TK</span>
                            <input type="number" step="0.01" min="0" required value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: sanitizePrice(e.target.value) })}
                              onKeyDown={(e) => preventNonNumeric(e, true)}
                              onFocus={onFocus} onBlur={onBlur}
                              placeholder="0.00"
                              className={`${inputCls} pl-12`}
                            />
                          </div>
                        )}
                      </FormField>
                    </div>

                    <FormField id="stock" label="Stock Quantity" focused={focused} setFocused={setFocused}>
                      {({ onFocus, onBlur }) => (
                        <div className="relative">
                          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <input type="number" min="1" required value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: sanitizeStock(e.target.value) })}
                            onKeyDown={(e) => preventNonNumeric(e, false)}
                            onFocus={onFocus} onBlur={onBlur}
                            placeholder="0"
                            className={`${inputCls} pl-12`}
                          />
                        </div>
                      )}
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                  <div className="p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h2 className="text-base font-light text-gray-700">Description & Care</h2>
                    </div>

                    <FormField id="description" label="Description" focused={focused} setFocused={setFocused}>
                      {({ onFocus, onBlur }) => (
                        <textarea rows={4} value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="Describe this plant — appearance, origin, characteristics..."
                          className={textareaCls}
                        />
                      )}
                    </FormField>

                    <FormField id="care_tips" label="Care Tips" focused={focused} setFocused={setFocused}>
                      {({ onFocus, onBlur }) => (
                        <textarea rows={4} value={formData.care_tips}
                          onChange={(e) => setFormData({ ...formData, care_tips: e.target.value })}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="Watering frequency, sunlight needs, soil type, fertiliser..."
                          className={textareaCls}
                        />
                      )}
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Images + Submit ── */}
            <div className="space-y-7 lg:sticky lg:top-28 h-fit">

              {/* Thumbnail Upload */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                  <div className="p-7">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-base font-light text-gray-700">Thumbnail</h2>
                    </div>

                    <input type="file" ref={thumbnailRef} accept="image/*"
                      onChange={(e) => handleThumbnailUpload(e.target.files)} className="hidden" />

                    {thumbnail ? (
                      <div className="relative group">
                        <img
                          src={getImgSrc(thumbnail)} alt="Thumbnail"
                          className="w-full h-52 object-cover rounded-2xl border border-gray-100 shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            type="button" onClick={() => setThumbnail('')}
                            className="px-4 py-2 bg-white/90 text-red-600 text-sm font-light rounded-xl hover:bg-white transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => thumbnailRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver('thumb'); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => {
                          e.preventDefault(); setDragOver(null);
                          handleThumbnailUpload(e.dataTransfer.files);
                        }}
                        className={`h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${
                          dragOver === 'thumb'
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                        }`}
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-xs text-gray-400 font-light">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500 font-light">Drop image or click to upload</p>
                              <p className="text-xs text-gray-300 font-light mt-1">JPG, PNG, WEBP · Max 10MB</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <h2 className="text-base font-light text-gray-700">Gallery</h2>
                      </div>
                      <span className="text-xs text-gray-400 font-light">{images.length}/10</span>
                    </div>

                    <input type="file" ref={imagesRef} accept="image/*" multiple
                      onChange={(e) => handleImagesUpload(e.target.files)} className="hidden" />

                    {images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {images.map((url, idx) => (
                          <div key={idx} className="relative group aspect-square">
                            <img
                              src={getImgSrc(url)} alt={`Gallery ${idx + 1}`}
                              className="w-full h-full object-cover rounded-xl border border-gray-100"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {images.length < 10 && (
                      <div
                        onClick={() => imagesRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver('images'); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => {
                          e.preventDefault(); setDragOver(null);
                          handleImagesUpload(e.dataTransfer.files);
                        }}
                        className={`h-24 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${
                          dragOver === 'images'
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                        }`}
                      >
                        {uploading ? (
                          <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                            </svg>
                            <p className="text-sm text-gray-400 font-light">Add more images</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || uploading}
                className="group relative w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light tracking-wide rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 rounded-2xl" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Plant...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Create Plant
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}