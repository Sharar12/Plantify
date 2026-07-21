'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Category {
  id: number;
  name: string;
}

// ── Premium Field Wrapper ────────────────────────────────────────────────────
const FieldWrapper = ({
  label, required, hint, children, icon,
}: {
  label: string; required?: boolean; hint?: string;
  children: React.ReactNode; icon?: React.ReactNode;
}) => (
  <div className="group/field space-y-2">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-[0.12em]">
        {icon && (
          <span className="w-4 h-4 text-emerald-400 flex-shrink-0 transition-colors duration-300 group-focus-within/field:text-emerald-500">
            {icon}
          </span>
        )}
        {label}
        {required && (
          <span className="text-emerald-400 text-[10px] font-bold">✦</span>
        )}
      </label>
      {hint && (
        <span className="text-[10px] text-gray-300 font-light">{hint}</span>
      )}
    </div>
    {children}
  </div>
);

// ── Premium Text Input ───────────────────────────────────────────────────────
const PremiumInput = ({
  type = 'text', value, onChange, placeholder, required, step, min, onKeyDown,
}: {
  type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; step?: string; min?: number | string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      {/* Glow ring */}
      <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${
        focused
          ? 'bg-gradient-to-r from-emerald-400/50 via-emerald-300/30 to-emerald-400/50'
          : 'bg-transparent'
      }`} />
      {/* Ambient glow */}
      <div className={`absolute -inset-1 rounded-2xl blur-md transition-all duration-500 ${
        focused ? 'bg-emerald-400/08 opacity-100' : 'opacity-0'
      }`} />
      <input
        type={type}
        required={required}
        step={step}
        min={min}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="relative w-full px-4 py-3.5 bg-white/90 rounded-xl text-sm font-light text-gray-800 placeholder-gray-300 focus:outline-none transition-all duration-300 shadow-sm"
        style={{
          border: focused
            ? '1px solid transparent'
            : '1px solid rgba(209,250,229,0.8)',
          boxShadow: focused
            ? '0 0 0 3px rgba(52,211,153,0.08), 0 2px 12px rgba(16,185,129,0.06)'
            : '0 1px 4px rgba(0,0,0,0.03)',
          letterSpacing: '0.01em',
        }}
      />
    </div>
  );
};

// ── Premium Textarea ─────────────────────────────────────────────────────────
const PremiumTextarea = ({
  value, onChange, placeholder, rows = 4,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${
        focused
          ? 'bg-gradient-to-r from-emerald-400/50 via-emerald-300/30 to-emerald-400/50'
          : 'bg-transparent'
      }`} />
      <div className={`absolute -inset-1 rounded-2xl blur-md transition-all duration-500 ${
        focused ? 'opacity-100' : 'opacity-0'
      }`} style={{ background: 'rgba(52,211,153,0.04)' }} />
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="relative w-full px-4 py-3.5 bg-white/90 rounded-xl text-sm font-light text-gray-800 placeholder-gray-300 focus:outline-none transition-all duration-300 resize-none shadow-sm"
        style={{
          border: focused ? '1px solid transparent' : '1px solid rgba(209,250,229,0.8)',
          boxShadow: focused
            ? '0 0 0 3px rgba(52,211,153,0.08), 0 2px 12px rgba(16,185,129,0.06)'
            : '0 1px 4px rgba(0,0,0,0.03)',
          letterSpacing: '0.01em',
          lineHeight: '1.7',
        }}
      />
      {/* Char count */}
      <div className={`absolute bottom-3 right-4 text-[10px] transition-all duration-300 ${
        focused ? 'opacity-100 text-emerald-400' : 'opacity-0'
      }`}>
        {value.length} chars
      </div>
    </div>
  );
};

// ── Premium Select ───────────────────────────────────────────────────────────
const PremiumSelect = ({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${
        focused
          ? 'bg-gradient-to-r from-emerald-400/50 via-emerald-300/30 to-emerald-400/50'
          : 'bg-transparent'
      }`} />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="relative w-full pl-4 pr-10 py-3.5 bg-white/90 rounded-xl text-sm font-light text-gray-800 focus:outline-none transition-all duration-300 appearance-none cursor-pointer shadow-sm"
        style={{
          border: focused ? '1px solid transparent' : '1px solid rgba(209,250,229,0.8)',
          boxShadow: focused
            ? '0 0 0 3px rgba(52,211,153,0.08), 0 2px 12px rgba(16,185,129,0.06)'
            : '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {/* Chevron */}
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ${
        focused ? 'rotate-180' : ''
      }`}>
        <svg className="w-4 h-4" style={{ color: focused ? 'rgb(52,211,153)' : 'rgb(209,213,219)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default function EditPlant({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef    = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnail, setThumbnail]   = useState('');
  const [images, setImages]         = useState<string[]>([]);
  const [dragOver, setDragOver]     = useState<'thumbnail' | 'images' | null>(null);

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

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [user, setUser]         = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    fetchCategories();
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${id}`)
      .then(r => r.json())
      .then(data => {
        setFormData({
          name:            data.name || '',
          scientific_name: data.scientific_name || '',
          category:        data.category || '',
          price:           data.price?.toString() || '',
          description:     data.description || '',
          care_tips:       data.care_tips || '',
          stock:           data.stock?.toString() || '',
        });
        setThumbnail(data.thumbnail || '');
        if (data.images) {
          try {
            const parsed = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
            setImages(Array.isArray(parsed) ? parsed : []);
          } catch { setImages([]); }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch {}
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > 10 * 1024 * 1024) {
      setError(`${file.name} exceeds 10MB limit`); return null;
    }
    if (!['image/jpeg','image/jpg','image/png','image/gif','image/webp'].includes(file.type)) {
      setError(`${file.name} is not a supported image format`); return null;
    }
    const fd = new FormData();
    fd.append('file', file);
    const res  = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    return res.ok ? data.url : null;
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    setUploadProgress(0);
    const interval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 85)), 200);
    const url = await uploadFile(file);
    clearInterval(interval);
    setUploadProgress(100);
    if (url) setThumbnail(url);
    setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (images.length + files.length > 10) {
      setError('Maximum 10 images allowed'); return;
    }
    setUploading(true); setError('');
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) setImages(prev => [...prev, url]);
    }
    setUploading(false);
    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent, target: 'thumbnail' | 'images') => {
    e.preventDefault(); setDragOver(null);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    setUploading(true); setError('');
    if (target === 'thumbnail') {
      const url = await uploadFile(files[0]);
      if (url) setThumbnail(url);
    } else {
      if (images.length + files.length > 10) { setError('Maximum 10 images allowed'); setUploading(false); return; }
      for (const f of files) {
        const url = await uploadFile(f);
        if (url) setImages(prev => [...prev, url]);
      }
    }
    setUploading(false);
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLogout = () => { localStorage.removeItem('user'); setUser(null); router.push('/'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    if (!thumbnail) { setError('Please upload a thumbnail image'); setSaving(false); return; }
    if (!images || images.length === 0) { setError('Please add at least one gallery image'); setSaving(false); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          thumbnail, images,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        const validationMsg = data.errors
          ? Object.values(data.errors).flat().join('. ')
          : null;
        setError(validationMsg || data.message || 'Failed to update plant');
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/plants'), 1200);
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  const imgSrc = (url: string) =>
    url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${url}`;

  const completionScore = [
    formData.name, formData.scientific_name, formData.category,
    formData.price, formData.description, formData.care_tips,
    formData.stock, thumbnail,
  ].filter(Boolean).length;
  const completionPct = Math.round((completionScore / 8) * 100);

  // ── Loading Screen ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col min-h-screen font-['Inter',sans-serif]"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f9fffe 40%, #f0faf5 70%, #ffffff 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(167,243,208,0.20) 0%, transparent 60%)' }} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
            style={{ borderTopColor: 'rgb(52,211,153)', animationDuration: '1s' }} />
          <div className="absolute inset-3 rounded-full border-[2px] border-transparent animate-spin"
            style={{ borderTopColor: 'rgba(16,185,129,0.5)', animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="absolute inset-[30px] rounded-full animate-pulse"
            style={{ background: 'rgb(52,211,153)' }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-light text-gray-400 uppercase tracking-[0.2em] animate-pulse">Loading Plant</p>
          <p className="text-xs text-gray-300 font-light mt-1">Fetching plant data…</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen font-['Inter',sans-serif] antialiased"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f9fffe 40%, #f0faf5 70%, #ffffff 100%)' }}>

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(167,243,208,0.18) 0%, transparent 60%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 50% 40% at 100% 100%, rgba(110,231,183,0.10) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* ── Success Overlay ── */}
      {success && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ background: 'rgb(52,211,153)' }} />
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(145deg, rgb(52,211,153), rgb(16,185,129))', boxShadow: '0 12px 40px rgba(16,185,129,0.35)' }}>
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-extralight text-gray-800">Plant Updated</p>
            <p className="text-sm text-gray-400 font-light">Redirecting to collection…</p>
          </div>
        </div>
      )}

      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 relative w-full max-w-3xl mx-auto px-5 sm:px-8 py-12" style={{ zIndex: 10 }}>

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between mb-10">
          <div className="space-y-3">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(209,250,229,0.7) 0%, rgba(167,243,208,0.35) 100%)',
                border: '1px solid rgba(110,231,183,0.4)',
              }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-[0.18em]">
                Editing Plant #{id}
              </span>
            </div>

            <h1 className="text-4xl font-extralight text-gray-900 tracking-[-0.02em]">
              Edit{' '}
              <span className="font-light" style={{ color: 'rgb(16,185,129)' }}>
                {formData.name || 'Plant'}
              </span>
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-px w-16 rounded-full"
                style={{ background: 'linear-gradient(90deg, rgb(16,185,129), transparent)' }} />
              <div className="w-1 h-1 rounded-full bg-emerald-300" />
              <div className="h-px w-8 rounded-full bg-emerald-100" />
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-light transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'white',
              border: '1px solid rgba(229,231,235,0.8)',
              color: 'rgb(107,114,128)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(110,231,183,0.5)';
              (e.currentTarget as HTMLElement).style.color = 'rgb(5,150,105)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229,231,235,0.8)';
              (e.currentTarget as HTMLElement).style.color = 'rgb(107,114,128)';
            }}
          >
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* ── Completion Bar ── */}
        <div className="mb-8 p-5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(209,250,229,0.6)',
            boxShadow: '0 2px 12px rgba(16,185,129,0.05)',
          }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-[0.12em]">
              Profile Completion
            </span>
            <span className="text-sm font-light"
              style={{ color: completionPct === 100 ? 'rgb(16,185,129)' : 'rgb(107,114,128)' }}>
              {completionPct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${completionPct}%`,
                background: completionPct === 100
                  ? 'linear-gradient(90deg, rgb(52,211,153), rgb(16,185,129))'
                  : 'linear-gradient(90deg, rgb(52,211,153), rgb(16,185,129))',
                boxShadow: '0 0 8px rgba(52,211,153,0.4)',
              }} />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {[
              formData.name, formData.scientific_name, formData.category,
              formData.price, formData.description, formData.care_tips,
              formData.stock, thumbnail,
            ].map((v, i) => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500"
                style={{ background: v ? 'rgb(52,211,153)' : 'rgb(229,231,235)' }} />
            ))}
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl"
            style={{
              background: 'rgba(254,242,242,0.9)',
              border: '1px solid rgba(252,165,165,0.4)',
              boxShadow: '0 2px 12px rgba(239,68,68,0.06)',
            }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(254,202,202,0.6)' }}>
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-700">Something went wrong</p>
              <p className="text-xs text-red-400 font-light mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto text-red-300 hover:text-red-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Upload Progress Bar ── */}
        {uploading && uploadProgress > 0 && (
          <div className="mb-6 p-4 rounded-2xl"
            style={{
              background: 'rgba(240,253,250,0.9)',
              border: '1px solid rgba(167,243,208,0.4)',
            }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-light text-emerald-700">Uploading…</span>
              <span className="text-xs font-light text-emerald-500">{uploadProgress}%</span>
            </div>
            <div className="h-1 rounded-full bg-emerald-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${uploadProgress}%`,
                  background: 'linear-gradient(90deg, rgb(52,211,153), rgb(16,185,129))',
                }} />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ══ Section 1: Basic Info ══ */}
          <SectionCard
            title="Basic Information"
            subtitle="Core plant details"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldWrapper label="Common Name" required icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                </svg>
              }>
                <PremiumInput
                  value={formData.name}
                  onChange={v => setFormData({ ...formData, name: v })}
                  placeholder="e.g. Monstera Deliciosa"
                  required
                />
              </FieldWrapper>

              <FieldWrapper label="Scientific Name" icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }>
                <PremiumInput
                  value={formData.scientific_name}
                  onChange={v => setFormData({ ...formData, scientific_name: v })}
                  placeholder="e.g. Monstera deliciosa"
                />
              </FieldWrapper>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-1">
                <FieldWrapper label="Category" required icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }>
                  <PremiumSelect
                    value={formData.category}
                    onChange={v => setFormData({ ...formData, category: v })}
                    placeholder="Select a category"
                    options={categories.map(c => ({ value: c.name, label: c.name }))}
                  />
                </FieldWrapper>
              </div>

              <FieldWrapper label="Price (TK)" required hint="BDT" icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }>                  <PremiumInput
                  type="number" step="0.01" min={0}
                  value={formData.price}
                  onKeyDown={e => preventNonNumeric(e, true)}
                  onChange={v => setFormData({ ...formData, price: sanitizePrice(v) })}
                  placeholder="0.00"
                  required
                />
              </FieldWrapper>

              <FieldWrapper label="Stock" hint="units" icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }>
                <PremiumInput
                  type="number" min={0}
                  value={formData.stock}
                  onKeyDown={e => preventNonNumeric(e, false)}
                  onChange={v => setFormData({ ...formData, stock: sanitizeStock(v) })}
                  placeholder="0"
                />
              </FieldWrapper>
            </div>
          </SectionCard>

          {/* ══ Section 2: Content ══ */}
          <SectionCard
            title="Plant Details"
            subtitle="Description and care information"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            }
          >
            <FieldWrapper label="Description" hint="Markdown supported" icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            }>
              <PremiumTextarea
                value={formData.description}
                onChange={v => setFormData({ ...formData, description: v })}
                placeholder="Describe this plant — its origin, appearance, and unique qualities…"
                rows={5}
              />
            </FieldWrapper>

            <FieldWrapper label="Care Tips" hint="Watering, light, soil, etc." icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }>
              <PremiumTextarea
                value={formData.care_tips}
                onChange={v => setFormData({ ...formData, care_tips: v })}
                placeholder="Share expert care guidance — watering frequency, light needs, humidity preferences…"
                rows={5}
              />
            </FieldWrapper>
          </SectionCard>

          {/* ══ Section 3: Thumbnail ══ */}
          <SectionCard
            title="Thumbnail Image"
            subtitle="Primary display image"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          >
            <input type="file" ref={thumbnailInputRef} accept="image/*"
              onChange={handleThumbnailUpload} className="hidden" />

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver('thumbnail'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, 'thumbnail')}
              onClick={() => !uploading && !thumbnail && thumbnailInputRef.current?.click()}
              className="relative rounded-2xl overflow-hidden transition-all duration-500"
              style={{
                border: dragOver === 'thumbnail'
                  ? '2px dashed rgba(52,211,153,0.8)'
                  : thumbnail
                    ? '1px solid rgba(209,250,229,0.6)'
                    : '2px dashed rgba(209,250,229,0.8)',
                background: dragOver === 'thumbnail'
                  ? 'rgba(240,253,250,0.9)'
                  : 'rgba(255,255,255,0.7)',
                cursor: thumbnail ? 'default' : 'pointer',
                minHeight: thumbnail ? 'auto' : '160px',
              }}
            >
              {thumbnail ? (
                /* Preview */
                <div className="relative group/thumb">
                  <img src={imgSrc(thumbnail)} alt="Thumbnail"
                    className="w-full max-h-64 object-cover rounded-2xl" />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 rounded-2xl flex items-center justify-center gap-3 opacity-0 group-hover/thumb:opacity-100 transition-all duration-300"
                    style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
                    <button type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-light text-white transition-all duration-300 hover:scale-105"
                      style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Replace
                    </button>
                    <button type="button" onClick={() => setThumbnail('')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-light text-white transition-all duration-300 hover:scale-105"
                      style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.4)', backdropFilter: 'blur(8px)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="relative w-14 h-14 mb-4">
                    <div className="absolute inset-0 rounded-2xl blur-md opacity-30"
                      style={{ background: 'linear-gradient(135deg, rgb(52,211,153), rgb(16,185,129))' }} />
                    <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(145deg, rgba(209,250,229,0.8) 0%, rgba(167,243,208,0.4) 100%)',
                        border: '1px solid rgba(110,231,183,0.3)',
                      }}>
                      <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-light text-gray-500 mb-1">
                    {dragOver === 'thumbnail' ? 'Release to upload' : 'Drop image here or click to browse'}
                  </p>
                  <p className="text-xs text-gray-300 font-light">JPG, PNG, WEBP · Max 10MB</p>
                  <button type="button"
                    disabled={uploading}
                    onClick={e => { e.stopPropagation(); thumbnailInputRef.current?.click(); }}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-light transition-all duration-300 hover:scale-105 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(209,250,229,0.8) 0%, rgba(167,243,208,0.4) 100%)',
                      border: '1px solid rgba(110,231,183,0.4)',
                      color: 'rgb(5,150,105)',
                      boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
                    }}>
                    {uploading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                    {uploading ? 'Uploading…' : 'Choose File'}
                  </button>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ══ Section 4: Gallery ══ */}
          <SectionCard
            title="Gallery Images"
            subtitle={`${images.length}/10 images uploaded`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            }
          >
            <input type="file" ref={imagesInputRef} accept="image/*"
              multiple onChange={handleImagesUpload} className="hidden" />

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver('images'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, 'images')}
              className="relative rounded-2xl p-6 transition-all duration-500 mb-4"
              style={{
                border: dragOver === 'images'
                  ? '2px dashed rgba(52,211,153,0.8)'
                  : '2px dashed rgba(209,250,229,0.8)',
                background: dragOver === 'images' ? 'rgba(240,253,250,0.9)' : 'rgba(255,255,255,0.5)',
              }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(145deg, rgba(209,250,229,0.8) 0%, rgba(167,243,208,0.4) 100%)',
                    border: '1px solid rgba(110,231,183,0.3)',
                  }}>
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-light text-gray-500">
                    {dragOver === 'images' ? 'Release to upload' : 'Drop images here or'}
                  </p>
                  <p className="text-xs text-gray-300 font-light">Up to {10 - images.length} more · JPG, PNG, WEBP · Max 10MB each</p>
                </div>
                <button type="button"
                  disabled={uploading || images.length >= 10}
                  onClick={() => imagesInputRef.current?.click()}
                  className="sm:ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-light transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(209,250,229,0.8) 0%, rgba(167,243,208,0.4) 100%)',
                    border: '1px solid rgba(110,231,183,0.4)',
                    color: 'rgb(5,150,105)',
                    boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
                  }}>
                  {uploading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  {uploading ? 'Uploading…' : `Add Images (${images.length}/10)`}
                </button>
              </div>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {images.map((url, idx) => (
                  <div key={idx}
                    className="relative group/img aspect-square rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(209,250,229,0.4)',
                    }}>
                    <img src={imgSrc(url)} alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover" />
                    {/* Delete overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300"
                      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
                      <button type="button" onClick={() => handleRemoveImage(idx)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                        style={{ background: 'rgba(239,68,68,0.8)', border: '1px solid rgba(255,255,255,0.3)' }}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {/* Index badge */}
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium text-white"
                      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                      {idx + 1}
                    </div>
                  </div>
                ))}
                {/* Ghost slots */}
                {Array.from({ length: Math.max(0, 5 - images.length) }).slice(0, 2).map((_, i) => (
                  <button key={`ghost-${i}`} type="button"
                    onClick={() => imagesInputRef.current?.click()}
                    disabled={uploading || images.length >= 10}
                    className="aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-[1.02] disabled:opacity-30"
                    style={{
                      background: 'rgba(249,250,251,0.6)',
                      border: '2px dashed rgba(209,250,229,0.6)',
                    }}>
                    <svg className="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ══ Submit Row ══ */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2 pb-8">
            {/* Cancel */}
            <button type="button" onClick={() => router.back()}
              className="flex-1 sm:flex-none sm:px-8 py-4 rounded-2xl text-sm font-light transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'white',
                border: '1px solid rgba(229,231,235,0.8)',
                color: 'rgb(107,114,128)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(209,213,219,0.8)';
                (e.currentTarget as HTMLElement).style.color = 'rgb(55,65,81)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229,231,235,0.8)';
                (e.currentTarget as HTMLElement).style.color = 'rgb(107,114,128)';
              }}
            >
              Cancel
            </button>

            {/* Save Changes */}
            <button type="submit" disabled={saving}
              className="group relative flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-light text-white overflow-hidden transition-all duration-500 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(145deg, rgb(52,211,153) 0%, rgb(16,185,129) 50%, rgb(5,150,105) 100%)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.28), 0 2px 8px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
              onMouseEnter={e => {
                if (!saving) (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(16,185,129,0.38), 0 4px 16px rgba(16,185,129,0.20), inset 0 1px 0 rgba(255,255,255,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(16,185,129,0.28), 0 2px 8px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent)' }} />
              {/* Top gloss */}
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />

              {saving ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span className="relative z-10">Saving Changes…</span>
                </>
              ) : (
                <>
                  <div className="relative z-10 w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="relative z-10 tracking-[0.04em]">Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// ── Premium Section Card ─────────────────────────────────────────────────────
function SectionCard({
  title, subtitle, icon, children,
}: {
  title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute -inset-3 rounded-3xl blur-2xl opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(167,243,208,0.25) 0%, transparent 70%)' }} />

      <div className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(209,250,229,0.55)',
          boxShadow: '0 4px 24px rgba(16,185,129,0.06), 0 1px 6px rgba(0,0,0,0.03)',
        }}>
        {/* Top accent */}
        <div className="h-[2px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.5) 30%, rgba(16,185,129,0.8) 50%, rgba(52,211,153,0.5) 70%, transparent 100%)' }} />

        {/* Header */}
        <div className="flex items-center gap-4 px-7 py-5 border-b"
          style={{ borderColor: 'rgba(240,253,250,0.8)', background: 'linear-gradient(180deg, rgba(240,253,250,0.5) 0%, transparent 100%)' }}>
          {icon && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-500"
              style={{
                background: 'linear-gradient(145deg, rgba(209,250,229,0.8) 0%, rgba(167,243,208,0.4) 100%)',
                border: '1px solid rgba(110,231,183,0.3)',
              }}>
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 tracking-[-0.01em]">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 font-light mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-5">{children}</div>
      </div>
    </div>
  );
}