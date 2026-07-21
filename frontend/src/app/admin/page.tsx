/* ==========================================================================
 * Admin Dashboard Page
 * ==========================================================================
 * Full-featured admin panel with three tabs:
 *   - Plants: CRUD operations, search/filter/sort, stock alerts, pagination
 *   - Orders: View/update order statuses, search by customer, pagination
 *   - Users: View/edit/delete users, role management, search/filter/sort
 *
 * Includes reusable UI atoms: StatusBadge, PremiumInput, PremiumTextarea,
 * PremiumSelect, StatCard, SectionCard, Modal, TabBtn, CategoryDropdown.
 * ========================================================================== */
'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';

const plantsPerPage = 10;
const ordersPerPage = 10;
const usersPerPage = 10;

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  password?: string;
}

interface Plant {
  id: number;
  name: string;
  scientific_name: string;
  category: string;
  price: number;
  thumbnail: string;
  stock: number;
  status: string;
  average_rating: number;
  reviews_count: number;
  sold: number;
  description: string;
  care_tips: string;
  images?: string;
}

interface Order {
  id: string;
  user_id: number;
  total_price: string;
  plant_ids: string;
  status: string;
  created_at: string;
  user: User;
  items: any[];
}

// ── Status Configs ───────────────────────────────────────────────────────────
const ORDER_STATUS: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  pending:    { label: 'Pending',    bg: 'rgba(255,251,235,0.9)', text: 'rgb(180,130,0)',   border: 'rgba(251,191,36,0.35)',  dot: 'rgb(251,191,36)' },
  processing: { label: 'Processing', bg: 'rgba(239,246,255,0.9)', text: 'rgb(37,99,235)',   border: 'rgba(96,165,250,0.35)',  dot: 'rgb(96,165,250)' },
  shipped:    { label: 'Shipped',    bg: 'rgba(245,243,255,0.9)', text: 'rgb(109,40,217)',  border: 'rgba(167,139,250,0.35)', dot: 'rgb(167,139,250)' },
  delivered:  { label: 'Delivered',  bg: 'rgba(240,253,250,0.9)', text: 'rgb(5,150,105)',   border: 'rgba(52,211,153,0.35)',  dot: 'rgb(52,211,153)' },
  cancelled:  { label: 'Cancelled',  bg: 'rgba(254,242,242,0.9)', text: 'rgb(220,38,38)',   border: 'rgba(252,165,165,0.35)', dot: 'rgb(252,165,165)' },
};

const PLANT_STATUS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  available:   { label: 'Available',    bg: 'rgba(240,253,250,0.9)', text: 'rgb(5,150,105)',  border: 'rgba(52,211,153,0.35)' },
  limited:     { label: 'Limited',      bg: 'rgba(255,251,235,0.9)', text: 'rgb(180,130,0)',  border: 'rgba(251,191,36,0.35)' },
  out_of_stock:{ label: 'Out of Stock', bg: 'rgba(254,242,242,0.9)', text: 'rgb(220,38,38)',  border: 'rgba(252,165,165,0.35)' },
  seasonal:    { label: 'Seasonal',     bg: 'rgba(245,243,255,0.9)', text: 'rgb(109,40,217)', border: 'rgba(167,139,250,0.35)' },
  rare:        { label: 'Rare',         bg: 'rgba(253,242,248,0.9)', text: 'rgb(190,24,93)',  border: 'rgba(249,168,212,0.35)' },
};

const ROLE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: string }> = {
  admin:      { label: 'Admin',      bg: 'rgba(245,243,255,0.9)', text: 'rgb(109,40,217)', border: 'rgba(167,139,250,0.4)', icon: '👑' },
  specialist: { label: 'Specialist', bg: 'rgba(239,246,255,0.9)', text: 'rgb(37,99,235)',  border: 'rgba(96,165,250,0.4)',  icon: '🌿' },
  delivery:   { label: 'Delivery',   bg: 'rgba(255,251,235,0.9)', text: 'rgb(180,130,0)',  border: 'rgba(251,191,36,0.4)',  icon: '🚚' },
  customer:   { label: 'Customer',   bg: 'rgba(240,253,250,0.9)', text: 'rgb(5,150,105)',  border: 'rgba(52,211,153,0.4)',  icon: '👤' },
};

// ── Reusable Premium Atoms ───────────────────────────────────────────────────
const StatusBadge = ({ status, map }: { status: string; map: Record<string, any> }) => {
  const cfg = map[status] || { label: status, bg: 'rgba(249,250,251,0.9)', text: 'rgb(107,114,128)', border: 'rgba(229,231,235,0.6)', dot: 'rgb(209,213,219)' };
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-light"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, boxShadow: `0 2px 6px ${cfg.border}` }}>
      {cfg.dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />}
      {cfg.label || cfg.icon && `${cfg.icon} ${cfg.label}` || cfg.label}
    </span>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.customer;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-light"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
      <span>{cfg.icon}</span>{cfg.label}
    </span>
  );
};

const PremiumInput = ({
  label, type = 'text', value, onChange, placeholder, required, step, min, hint, name, defaultValue, onKeyDown,
}: {
  label: string; type?: string; value?: string; onChange?: (v: string) => void;
  placeholder?: string; required?: boolean; step?: string; min?: number | string; hint?: string;
  name?: string; defaultValue?: string | number; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">
        {label}{required && <span className="text-emerald-400 text-[10px]">✦ required</span>}
      </label>
      <div className="relative">
        <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${focused ? 'bg-gradient-to-r from-emerald-400/50 via-emerald-300/30 to-emerald-400/50' : 'bg-transparent'}`} />          <input
          type={type} name={name} required={required} step={step} min={min} placeholder={placeholder}
          defaultValue={defaultValue} value={value}
          onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          className="relative w-full px-4 py-3 bg-white/90 rounded-xl text-sm font-light text-gray-800 placeholder-gray-300 focus:outline-none transition-all duration-300"
          style={{
            border: focused ? '1px solid transparent' : '1px solid rgba(209,250,229,0.8)',
            boxShadow: focused ? '0 0 0 3px rgba(52,211,153,0.08), 0 2px 8px rgba(16,185,129,0.06)' : '0 1px 3px rgba(0,0,0,0.03)',
          }}
        />
      </div>
      {hint && <p className="text-[10px] text-gray-300 font-light">{hint}</p>}
    </div>
  );
};

const PremiumTextarea = ({
  label, name, defaultValue, required, rows = 3, placeholder,
}: {
  label: string; name?: string; defaultValue?: string;
  required?: boolean; rows?: number; placeholder?: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">
        {label}{required && <span className="text-emerald-400 text-[10px]">✦ required</span>}
      </label>
      <div className="relative">
        <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${focused ? 'bg-gradient-to-r from-emerald-400/50 via-emerald-300/30 to-emerald-400/50' : 'bg-transparent'}`} />
        <textarea
          name={name} required={required} rows={rows} placeholder={placeholder} defaultValue={defaultValue}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="relative w-full px-4 py-3 bg-white/90 rounded-xl text-sm font-light text-gray-800 placeholder-gray-300 focus:outline-none resize-none transition-all duration-300"
          style={{
            border: focused ? '1px solid transparent' : '1px solid rgba(209,250,229,0.8)',
            boxShadow: focused ? '0 0 0 3px rgba(52,211,153,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
          }}
        />
      </div>
    </div>
  );
};

const PremiumSelect = ({
  label, name, value, onChange, options, defaultValue, required, disabled,
}: {
  label?: string; name?: string; value?: string; onChange?: (v: string) => void;
  options: { value: string; label: string }[]; defaultValue?: string;
  required?: boolean; disabled?: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={label ? 'space-y-1.5' : ''}>
      {label && (
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">{label}</label>
      )}
      <div className="relative">
        {!disabled && (
          <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${focused ? 'bg-gradient-to-r from-emerald-400/50 via-emerald-300/30 to-emerald-400/50' : 'bg-transparent'}`} />
        )}
        <select
          name={name} required={required} disabled={disabled}
          defaultValue={defaultValue} value={value}
          onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="relative w-full pl-4 pr-10 py-3 bg-white/90 rounded-xl text-sm font-light text-gray-800 focus:outline-none appearance-none transition-all duration-300"
          style={{
            border: focused && !disabled ? '1px solid transparent' : '1px solid rgba(209,250,229,0.8)',
            boxShadow: focused && !disabled ? '0 0 0 3px rgba(52,211,153,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 ${focused ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4" style={{ color: focused && !disabled ? 'rgb(52,211,153)' : 'rgb(209,213,219)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon, accent }: {
  label: string; value: number | string; sub?: string; icon: React.ReactNode; accent: string;
}) => (
  <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-default"
    style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(209,250,229,0.55)', boxShadow: '0 4px 20px rgba(16,185,129,0.05)' }}>
    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"
      style={{ background: accent }} />
    <div className="flex items-start justify-between relative">
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.16em] mb-1.5">{label}</p>
        <p className="text-3xl font-extralight text-gray-800 tracking-[-0.03em]">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 font-light mt-1">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}22`, border: `1px solid ${accent}30` }}>
        {icon}
      </div>
    </div>
  </div>
);

// ── Section Card wrapper ─────────────────────────────────────────────────────
const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative rounded-3xl overflow-hidden ${className}`}
    style={{ background: 'rgba(255,255,255,0.93)', border: '1px solid rgba(209,250,229,0.5)', boxShadow: '0 4px 24px rgba(16,185,129,0.06), 0 1px 4px rgba(0,0,0,0.03)' }}>
    <div className="h-[2px]"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.5) 30%, rgba(16,185,129,0.8) 50%, rgba(52,211,153,0.5) 70%, transparent)' }} />
    {children}
  </div>
);

// ── Premium Modal ────────────────────────────────────────────────────────────
const Modal = ({
  open, onClose, title, subtitle, icon, children, accentColor = 'rgba(16,185,129,0.4)',
}: {
  open: boolean; onClose: () => void; title: string; subtitle?: string;
  icon?: React.ReactNode; children: React.ReactNode; accentColor?: string;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center p-5 z-[90]"
      style={{ background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(16px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-xl">
        <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }} />
        <div className="relative rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
          style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(32px)', border: '1px solid rgba(209,250,229,0.55)', boxShadow: '0 32px 80px rgba(0,0,0,0.10), 0 8px 24px rgba(16,185,129,0.08)' }}>
          <div className="h-[2px] flex-shrink-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.7) 30%, rgba(16,185,129,0.9) 50%, rgba(52,211,153,0.7) 70%, transparent)' }} />
          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(240,253,250,0.8)' }}>
            <div className="flex items-center gap-4">
              {icon && (
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg text-white"
                  style={{ background: 'linear-gradient(145deg, rgb(52,211,153), rgb(5,150,105))' }}>
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-lg font-light text-gray-900 tracking-[-0.01em]">{title}</h3>
                {subtitle && <p className="text-xs text-gray-400 font-light mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all duration-300 hover:scale-110"
              style={{ border: '1px solid rgba(229,231,235,0.8)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ── Tab Button ───────────────────────────────────────────────────────────────
const TabBtn = ({
  active, onClick, icon, label, count,
}: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; count?: number;
}) => (
  <button onClick={onClick}
    className="relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-light transition-all duration-300 hover:scale-[1.02]"
    style={{
      background: active
        ? 'linear-gradient(145deg, rgb(52,211,153) 0%, rgb(16,185,129) 60%, rgb(5,150,105) 100%)'
        : 'rgba(255,255,255,0.7)',
      color: active ? 'white' : 'rgb(107,114,128)',
      border: active ? 'none' : '1px solid rgba(209,250,229,0.7)',
      boxShadow: active
        ? '0 6px 20px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
        : '0 1px 4px rgba(0,0,0,0.03)',
    }}>
    {active && (
      <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 skew-x-12 rounded-2xl overflow-hidden pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
    )}
    <span className="relative z-10 flex-shrink-0">{icon}</span>
    <span className="relative z-10">{label}</span>
    {count !== undefined && (
      <span className="relative z-10 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-medium"
        style={{
          background: active ? 'rgba(255,255,255,0.25)' : 'rgba(209,250,229,0.8)',
          color: active ? 'white' : 'rgb(5,150,105)',
        }}>
        {count}
      </span>
    )}
  </button>
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
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white/90 rounded-xl text-sm font-light text-gray-700 focus:outline-none transition-all duration-300 cursor-pointer"
        style={{
          border: open ? '1px solid transparent' : '1px solid rgba(209,250,229,0.8)',
          boxShadow: open ? '0 0 0 3px rgba(52,211,153,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
        }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; if (!open) { el.style.borderColor = 'rgba(110,231,183,0.6)'; } }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; if (!open) { el.style.borderColor = 'rgba(209,250,229,0.8)'; } }}>
        <span className="truncate">{label}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-full max-h-72 overflow-y-auto bg-white/95 backdrop-blur-xl border border-emerald-200/40 rounded-xl shadow-xl shadow-emerald-500/10 z-50">
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

function AdminDashboardInner() {
  const [user, setUser]             = useState<User | null>(null);
  const [activeTab, setActiveTab]   = useState<'plants' | 'orders' | 'users'>('plants');
  const [plants, setPlants]         = useState<Plant[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editingUser, setEditingUser]   = useState<User | null>(null);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [showUserModal, setShowUserModal]   = useState(false);
  const [viewingUser, setViewingUser]       = useState<User | null>(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [orderSearch, setOrderSearch]       = useState('');
  const [userSearch, setUserSearch]         = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy]                 = useState('name-asc');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSortBy, setOrderSortBy]       = useState('newest');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSortBy, setUserSortBy]         = useState('name-asc');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [hoveredRow, setHoveredRow]         = useState<number | string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingId, setDeletingId]         = useState<number | null>(null);
  const [toast, setToast]                   = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [plantsPage, setPlantsPage]         = useState(1);
  const [ordersPage, setOrdersPage]         = useState(1);
  const [usersPage, setUsersPage]           = useState(1);
  const [confirmDelete, setConfirmDelete]   = useState<{ type: 'plant' | 'user'; id: number; name: string } | null>(null);
  const [searchFocused, setSearchFocused]   = useState(false);
  const [orderSearchFocused, setOrderSearchFocused] = useState(false);
  const [userSearchFocused, setUserSearchFocused] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [imagesDragOver, setImagesDragOver] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const router      = useRouter();
  const searchParams = useSearchParams();

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders') setActiveTab('orders');
    else if (tab === 'users') setActiveTab('users');
    else setActiveTab('plants');
  }, [searchParams]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const userData = JSON.parse(stored);
    setUser(userData);
    if (userData.role?.toLowerCase() !== 'admin') {
      window.location.href = '/'; return;
    }
    fetchData();
  }, []);

  useEffect(() => { setPlantsPage(1); }, [searchQuery, selectedCategories, sortBy]);
  useEffect(() => { setOrdersPage(1); }, [orderSearch, orderStatusFilter, orderSortBy]);
  useEffect(() => { setUsersPage(1); }, [userSearch, userRoleFilter, userSortBy]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchPlants(), fetchOrders(), fetchUsers(), fetchCategories()]);
    setLoading(false);
  };

  const fetchPlants = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`);
    setPlants(await res.json());
  };
  const fetchOrders = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`);
    setOrders(await res.json());
  };
  const fetchUsers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`);
    setUsers(await res.json());
  };
  const fetchCategories = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
    setCategories(await res.json());
  };

  const categoryOptions = ['All', ...categories.map(c => c.name)];

  const filteredPlants = plants
    .filter(p => {
      const q = searchQuery.toLowerCase();
      return ((p.name || '').toLowerCase().includes(q) || (p.scientific_name || '').toLowerCase().includes(q))
        && (selectedCategories.length === 0 || selectedCategories.some(cat => cat.toLowerCase() === p.category.toLowerCase()));
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc')    return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc')   return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc')   return a.price - b.price;
      if (sortBy === 'price-desc')  return b.price - a.price;
      if (sortBy === 'stock-asc')   return a.stock - b.stock;
      if (sortBy === 'stock-desc')  return b.stock - a.stock;
      return 0;
    });

  const filteredOrders = orders
    .filter(o => {
      const q = orderSearch.toLowerCase();
      const matchesSearch = !q ||
        (o.user?.name || '').toLowerCase().includes(q) ||
        (o.user?.email || '').toLowerCase().includes(q) ||
        o.id.toString().includes(q);
      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (orderSortBy === 'newest')    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (orderSortBy === 'oldest')   return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (orderSortBy === 'high')     return Number(b.total_price) - Number(a.total_price);
      if (orderSortBy === 'low')      return Number(a.total_price) - Number(b.total_price);
      return 0;
    });

  const filteredUsers = users
    .filter(u => {
      const q = userSearch.toLowerCase();
      const matchesSearch = !q ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q);
      const matchesRole = userRoleFilter === 'all' || (u.role || '') === userRoleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (userSortBy === 'name-asc')  return a.name.localeCompare(b.name);
      if (userSortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (userSortBy === 'role')      return a.role.localeCompare(b.role);
      if (userSortBy === 'newest')    return b.id - a.id;
      return 0;
    });

  const plantsTotalPages = Math.ceil(filteredPlants.length / plantsPerPage);
  const plantsStartIndex = (plantsPage - 1) * plantsPerPage;
  const paginatedPlants = filteredPlants.slice(plantsStartIndex, plantsStartIndex + plantsPerPage);

  const ordersTotalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const ordersStartIndex = (ordersPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(ordersStartIndex, ordersStartIndex + ordersPerPage);

  const usersTotalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const usersStartIndex = (usersPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(usersStartIndex, usersStartIndex + usersPerPage);

  const collectFormData = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const data: Record<string, any> = {};
    fd.forEach((value, key) => { data[key] = value; });
    data.price = parseFloat(data.price || '0');
    data.stock = parseInt(data.stock || '0', 10);
    data.images = modalImages;
    data.thumbnail = thumbnailPreview || editingPlant?.thumbnail || '';
    return data;
  };

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = collectFormData(e.target as HTMLFormElement);
    if (!data.thumbnail) { showToast('Please upload a thumbnail image', 'error'); return; }
    if (!data.images || data.images.length === 0) { showToast('Please add at least one gallery image', 'error'); return; }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) { await fetchPlants(); setShowPlantModal(false); showToast('Plant added successfully'); }
    else {
      try {
        const data = await res.json();
        const msg = data.errors
          ? Object.values(data.errors).flat().join('. ')
          : data.message;
        showToast(msg || 'Failed to add plant', 'error');
      } catch {
        showToast('Failed to add plant', 'error');
      }
    }
  };

  const handleUpdatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlant) return;
    const data = collectFormData(e.target as HTMLFormElement);
    if (!data.thumbnail) { showToast('Please upload a thumbnail image', 'error'); return; }
    if (!data.images || data.images.length === 0) { showToast('Please add at least one gallery image', 'error'); return; }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${editingPlant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) { await fetchPlants(); setShowPlantModal(false); setEditingPlant(null); showToast('Plant updated'); }
    else {
      try {
        const data = await res.json();
        const msg = data.errors
          ? Object.values(data.errors).flat().join('. ')
          : data.message;
        showToast(msg || 'Failed to update plant', 'error');
      } catch {
        showToast('Failed to update plant', 'error');
      }
    }
  };

  const handleDeletePlant = async (id: number) => {
    setDeletingId(id);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants/${id}`, { method: 'DELETE' });
    if (res.ok) { await fetchPlants(); showToast('Plant removed'); }
    else showToast('Failed to delete plant', 'error');
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { await fetchOrders(); showToast(`Order #${orderId} → ${newStatus}`); }
    else showToast('Failed to update order', 'error');
    setUpdatingOrderId(null);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingUser.name, email: editingUser.email, phone: editingUser.phone, password: editingUser.password || '', role: editingUser.role }),
    });
    if (res.ok) { await fetchUsers(); setShowUserModal(false); setEditingUser(null); showToast('User created'); }
    else showToast('Failed to create user', 'error');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || editingUser.id === 0) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${editingUser.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingUser.name, email: editingUser.email, phone: editingUser.phone, role: editingUser.role }),
    });
    if (res.ok) { await fetchUsers(); setShowUserModal(false); setEditingUser(null); showToast('User updated'); }
    else showToast('Failed to update user', 'error');
  };

  const handleDeleteUser = async (id: number) => {
    setDeletingId(id);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) { await fetchUsers(); showToast('User removed'); }
    else showToast('Failed to delete user', 'error');
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const handleLogout = () => { localStorage.removeItem('user'); window.location.href = '/'; };

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
    setThumbnailUploading(true);
    const url = await uploadFile(file);
    if (url) {
      setThumbnailPreview(url);
      showToast('Thumbnail uploaded');
    } else {
      showToast('Thumbnail upload failed', 'error');
    }
    setThumbnailUploading(false);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const handleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (modalImages.length + files.length > 10) {
      showToast('Maximum 10 gallery images allowed', 'error'); return;
    }
    setImagesUploading(true);
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) setModalImages(prev => [...prev, url]);
    }
    setImagesUploading(false);
    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  const getImgSrc = (url: string) =>
    url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${url}`;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col min-h-screen font-['Inter',sans-serif]"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f9fffe 40%, #f0faf5 70%, #ffffff 100%)' }}>
      <Header user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
            style={{ borderTopColor: 'rgb(52,211,153)', animationDuration: '1s' }} />
          <div className="absolute inset-3 rounded-full border-[2px] border-transparent animate-spin"
            style={{ borderTopColor: 'rgba(16,185,129,0.5)', animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="absolute inset-[30px] rounded-full animate-pulse" style={{ background: 'rgb(52,211,153)' }} />
        </div>
        <p className="text-sm font-light text-gray-400 uppercase tracking-[0.2em] animate-pulse">Loading Dashboard</p>
      </div>
    </div>
  );

  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_price), 0);

  return (
    <div className="flex flex-col min-h-screen font-['Inter',sans-serif] antialiased"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f9fffe 40%, #f0faf5 70%, #ffffff 100%)' }}>

      {/* ── Ambient Layers ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(167,243,208,0.18) 0%, transparent 60%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 50% 40% at 100% 100%, rgba(110,231,183,0.10) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* ── Toast ── */}
      <div className={`fixed top-6 right-6 z-[100] transition-all duration-700 ${toast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
        <div className="relative flex items-center gap-4 pl-5 pr-6 py-4 rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-2xl bg-white/95"
          style={{ borderColor: toast?.type === 'success' ? 'rgba(209,250,229,0.8)' : 'rgba(252,165,165,0.5)' }}>
          <div className={`absolute left-0 inset-y-0 w-1 rounded-l-2xl ${toast?.type === 'success' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-red-400 to-red-600'}`} />
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${toast?.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'}`}>
            {toast?.type === 'success'
              ? <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{toast?.type === 'success' ? 'Success' : 'Error'}</p>
            <p className="text-xs text-gray-400 font-light mt-0.5">{toast?.msg}</p>
          </div>
        </div>
      </div>

      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 relative max-w-[1400px] mx-auto w-full px-5 sm:px-8 lg:px-14 py-12" style={{ zIndex: 10 }}>

        {/* ── Hero Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, rgba(209,250,229,0.6), rgba(167,243,208,0.3))', border: '1px solid rgba(110,231,183,0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-[0.18em]">Admin Control Panel</span>
            </div>
            <div className="flex items-start gap-5">
              <div className="relative flex-shrink-0 mt-1">
                <div className="absolute -inset-2 rounded-2xl blur-lg opacity-40"
                  style={{ background: 'linear-gradient(135deg, rgb(52,211,153), rgb(16,185,129))' }} />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{ background: 'linear-gradient(145deg, rgb(52,211,153) 0%, rgb(5,150,105) 100%)' }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-extralight text-gray-900 tracking-[-0.02em] leading-none">
                  Admin<span className="font-light" style={{ color: 'rgb(16,185,129)' }}> Dashboard</span>
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-px w-20 rounded-full" style={{ background: 'linear-gradient(90deg, rgb(16,185,129), transparent)' }} />
                  <div className="w-1 h-1 rounded-full bg-emerald-300" />
                  <div className="h-px w-10 rounded-full bg-emerald-100" />
                </div>
                <p className="mt-2 text-sm text-gray-400 font-light">
                  Welcome back, <span className="text-emerald-600 font-medium">{user?.name}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick action */}
          <button onClick={() => router.push('/admin/analytics')}
            className="group self-start lg:self-auto relative inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-light text-white overflow-hidden transition-all duration-500 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(145deg, rgb(52,211,153) 0%, rgb(16,185,129) 50%, rgb(5,150,105) 100%)',
              boxShadow: '0 8px 28px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 44px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'; }}>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="relative z-10">View Analytics</span>
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Plants" value={plants.length}
            sub={`${plants.filter(p => p.stock <= lowStockThreshold).length} low stock`}
            accent="rgba(16,185,129,1)"
            icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} />
          <StatCard label="Total Orders" value={orders.length}
            sub={`${orders.filter(o => o.status === 'pending').length} pending`}
            accent="rgba(96,165,250,1)"
            icon={<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
          <StatCard label="Total Users" value={users.length}
            sub={`${users.filter(u => u.role === 'customer').length} customers`}
            accent="rgba(167,139,250,1)"
            icon={<svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
          <StatCard label="Revenue" value={revenue >= 1000 ? `TK ${(revenue / 1000).toFixed(1)}K` : `TK ${revenue}`}
            sub="from delivered orders"
            accent="rgba(52,211,153,1)"
            icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabBtn active={activeTab === 'plants'} onClick={() => setActiveTab('plants')}
            label="Plants" count={plants.length}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} />
          <TabBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}
            label="Orders" count={orders.length}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
          <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')}
            label="Users" count={users.length}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── PLANTS TAB ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'plants' && (
          <div className="space-y-6">
            {/* Ambient Glow Overlay for Plants Section */}
            <div className="absolute -inset-4 rounded-3xl blur-3xl opacity-40 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(167,243,208,0.20) 0%, transparent 60%)' }} />
            {/* Sub-header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extralight text-gray-800 tracking-[-0.01em]">Plant Management</h2>
                <p className="text-xs text-gray-400 font-light mt-1">
                  {filteredPlants.length} of {plants.length} plants ·{' '}
                  <span className="text-red-400">{plants.filter(p => p.stock <= lowStockThreshold).length} low stock</span>
                </p>
              </div>
              <button onClick={() => { setEditingPlant(null); setShowPlantModal(true); setModalImages([]); setThumbnailPreview(''); }}
                className="group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-light text-white overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(145deg, rgb(52,211,153), rgb(16,185,129), rgb(5,150,105))', boxShadow: '0 6px 20px rgba(16,185,129,0.22), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                <svg className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="relative z-10">Add Plant</span>
              </button>
            </div>

            {/* Filter Bar */}
            <SectionCard className="!overflow-visible">
              <div className="px-6 py-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search */}
                <div className={`relative flex-1 transition-all duration-300 ${searchFocused ? 'scale-[1.01]' : ''}`}>
                  <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${searchFocused ? 'bg-gradient-to-r from-emerald-400/50 via-emerald-300/30 to-emerald-400/50' : 'bg-transparent'}`} />
                  <div className="relative flex items-center">
                    <svg className="absolute left-4 w-4 h-4 pointer-events-none transition-colors duration-300"
                      style={{ color: searchFocused ? 'rgb(52,211,153)' : 'rgb(209,213,219)' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search plants..." value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                      className="w-full pl-11 pr-4 py-3 bg-white/90 rounded-xl text-sm font-light text-gray-800 placeholder-gray-300 focus:outline-none transition-all duration-300"
                      style={{ border: searchFocused ? '1px solid transparent' : '1px solid rgba(209,250,229,0.8)', boxShadow: searchFocused ? '0 0 0 3px rgba(52,211,153,0.08)' : '0 1px 3px rgba(0,0,0,0.03)' }} />
                  </div>
                </div>
                <CategoryDropdown
                  categories={categoryOptions.filter(c => c !== 'All')}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                />
                <PremiumSelect value={sortBy} onChange={setSortBy}
                  options={[
                    { value: 'name-asc', label: 'Name A–Z' }, { value: 'name-desc', label: 'Name Z–A' },
                    { value: 'price-asc', label: 'Price ↑' }, { value: 'price-desc', label: 'Price ↓' },
                    { value: 'stock-asc', label: 'Stock ↑' }, { value: 'stock-desc', label: 'Stock ↓' },
                  ]} />
                {/* Low stock threshold */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em] whitespace-nowrap">Low Stock ≤</span>
                  <input type="number" min="0" value={lowStockThreshold}
                    onChange={e => setLowStockThreshold(parseInt(e.target.value) || 0)}
                    className="w-16 px-3 py-3 bg-white/90 rounded-xl text-sm font-light text-center focus:outline-none transition-all duration-300"
                    style={{ border: '1px solid rgba(209,250,229,0.8)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} />
                </div>
              </div>
            </SectionCard>

            {/* Filter Bar */}
            <SectionCard className="!overflow-visible">
              {filteredPlants.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(240,253,250,0.8)', border: '1px solid rgba(167,243,208,0.3)' }}>
                    <svg className="w-8 h-8 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 font-light">No plants match your criteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(209,250,229,0.6)', background: 'linear-gradient(180deg, rgba(240,253,250,0.6), transparent)' }}>
                        {['Plant', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h, i) => (
                          <th key={h} className={`px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-[0.16em] ${i === 5 ? 'text-center' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPlants.map((plant, idx) => {
                        const isOutOfStock = plant.stock === 0;
                        const isLow        = !isOutOfStock && plant.stock <= lowStockThreshold;
                        const isHover = hoveredRow === plant.id;
                        return (
                          <tr key={plant.id}
                            onMouseEnter={() => setHoveredRow(plant.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className="transition-all duration-300"
                            style={{
                              borderBottom: '1px solid rgba(243,244,246,0.8)',
                              background: isHover
                                ? isOutOfStock ? 'rgba(254,242,242,0.6)' : isLow ? 'rgba(254,242,242,0.4)' : 'rgba(240,253,250,0.5)'
                                : isOutOfStock ? 'rgba(254,242,242,0.3)' : isLow ? 'rgba(254,242,242,0.15)' : 'transparent',
                              transform: isHover ? 'translateX(2px)' : 'none',
                            }}>
                            {/* Plant cell */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 flex-shrink-0">
                                  <div className="w-10 h-10 rounded-xl overflow-hidden"
                                    style={{ background: 'linear-gradient(145deg, rgba(209,250,229,0.8), rgba(167,243,208,0.4))', border: '1px solid rgba(110,231,183,0.3)' }}>
                                    {plant.thumbnail ? (
                                      <img src={plant.thumbnail.startsWith('http') ? plant.thumbnail : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${plant.thumbnail}`}
                                        alt={plant.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-sm">🌿</div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-light text-gray-800 transition-colors duration-300"
                                    style={{ color: isHover ? 'rgb(5,150,105)' : 'rgb(31,41,55)' }}>{plant.name}</p>
                                  <p className="text-xs italic text-gray-400 font-light">{plant.scientific_name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-gray-500 font-light px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(249,250,251,0.8)', border: '1px solid rgba(229,231,235,0.6)' }}>
                                {plant.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-baseline gap-1">
                                <span className="text-[10px] text-gray-300">TK</span>
                                <span className="text-sm font-light text-gray-800 tabular-nums">{Math.round(plant.price).toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                {isOutOfStock ? (
                                  <span className="text-sm font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200/60">
                                    Out of Stock
                                  </span>
                                ) : (
                                  <>
                                    <span className={`text-sm font-light tabular-nums ${isLow ? 'text-red-500' : 'text-gray-700'}`}>{plant.stock}</span>
                                    {isLow && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                                        style={{ background: 'rgba(254,242,242,0.9)', color: 'rgb(220,38,38)', border: '1px solid rgba(252,165,165,0.4)' }}>
                                        Low
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={plant.status} map={PLANT_STATUS} />
                            </td>
                            <td className="px-6 py-4">
                              <div className={`flex items-center justify-end gap-2 transition-all duration-300 ${isHover ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                                <button onClick={() => { setEditingPlant(plant); setShowPlantModal(true); setModalImages(plant.images ? JSON.parse(plant.images) : []); setThumbnailPreview(''); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-light transition-all duration-300 hover:scale-105"
                                  style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', color: 'rgb(107,114,128)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(240,253,250,0.8)'; el.style.borderColor='rgba(110,231,183,0.5)'; el.style.color='rgb(5,150,105)'; }}
                                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='white'; el.style.borderColor='rgba(229,231,235,0.8)'; el.style.color='rgb(107,114,128)'; }}>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button onClick={() => setConfirmDelete({ type: 'plant', id: plant.id, name: plant.name })}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-light transition-all duration-300 hover:scale-105"
                                  style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', color: 'rgb(156,163,175)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(254,242,242,0.8)'; el.style.borderColor='rgba(252,165,165,0.4)'; el.style.color='rgb(220,38,38)'; }}
                                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='white'; el.style.borderColor='rgba(229,231,235,0.8)'; el.style.color='rgb(156,163,175)'; }}>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                {filteredPlants.length > plantsPerPage && (
                  <div className="px-6 pb-5 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 font-light">
                        {plantsStartIndex + 1}–{Math.min(plantsStartIndex + plantsPerPage, filteredPlants.length)} of {filteredPlants.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPlantsPage(p => Math.max(1, p - 1))} disabled={plantsPage === 1}
                        className="px-4 py-2 text-sm rounded-xl border border-emerald-200/40 bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">← Prev</button>
                      {Array.from({ length: plantsTotalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setPlantsPage(page)}
                          className={`w-10 h-10 text-sm rounded-xl border transition-all ${plantsPage === page ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-white/80 text-gray-600 border-emerald-200/40 hover:bg-emerald-50 hover:text-emerald-700'}`}>{page}</button>
                      ))}
                      <button onClick={() => setPlantsPage(p => Math.min(plantsTotalPages, p + 1))} disabled={plantsPage === plantsTotalPages}
                        className="px-4 py-2 text-sm rounded-xl border border-emerald-200/40 bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next →</button>
                    </div>
                  </div>
                )}
            </SectionCard>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── ORDERS TAB ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
         {activeTab === 'orders' && (
           <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                 <h2 className="text-2xl font-extralight text-gray-800 tracking-[-0.01em]">Order Management</h2>
                 <p className="text-xs text-gray-400 font-light mt-1">{filteredOrders.length} of {orders.length} orders</p>
               </div>
             </div>

            {/* Filter Bar */}
            <SectionCard>
              <div className="px-6 py-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search */}
                <div className={`relative flex-1 transition-all duration-300 ${orderSearchFocused ? 'scale-[1.01]' : ''}`}>
                  <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${orderSearchFocused ? 'bg-gradient-to-r from-emerald-400/50 via-emerald-300/30 to-emerald-400/50' : 'bg-transparent'}`} />
                  <div className="relative flex items-center">
                    <svg className="absolute left-4 w-4 h-4 pointer-events-none transition-colors duration-300"
                      style={{ color: orderSearchFocused ? 'rgb(52,211,153)' : 'rgb(209,213,219)' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search by customer name, email, or order ID..." value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      onFocus={() => setOrderSearchFocused(true)} onBlur={() => setOrderSearchFocused(false)}
                      className="w-full pl-11 pr-4 py-3 bg-white/90 rounded-xl text-sm font-light text-gray-800 placeholder-gray-300 focus:outline-none transition-all duration-300"
                      style={{ border: orderSearchFocused ? '1px solid transparent' : '1px solid rgba(209,250,229,0.8)', boxShadow: orderSearchFocused ? '0 0 0 3px rgba(52,211,153,0.08)' : '0 1px 3px rgba(0,0,0,0.03)' }} />
                  </div>
                </div>
                <PremiumSelect value={orderStatusFilter} onChange={setOrderStatusFilter}
                  options={[
                    { value: 'all', label: 'All Status' }, { value: 'pending', label: '⏳ Pending' },
                    { value: 'processing', label: '🔄 Processing' }, { value: 'shipped', label: '📦 Shipped' },
                    { value: 'delivered', label: '✓ Delivered' }, { value: 'cancelled', label: '✕ Cancelled' },
                  ]} />
                <PremiumSelect value={orderSortBy} onChange={setOrderSortBy}
                  options={[
                    { value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' },
                    { value: 'high', label: 'Amount ↓' }, { value: 'low', label: 'Amount ↑' },
                  ]} />
              </div>
            </SectionCard>

            <div className="space-y-4">
              {paginatedOrders.map(order => {
                const cfg       = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                const isLocked  = order.status === 'delivered' || order.status === 'cancelled';
                const isUpdating= updatingOrderId === order.id;
                const isHoverOrd= hoveredRow === order.id;
                return (
                  <div key={order.id}
                    onMouseEnter={() => setHoveredRow(order.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className="relative rounded-3xl overflow-hidden transition-all duration-400"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      border: isHoverOrd ? `1px solid ${cfg.border}` : '1px solid rgba(209,250,229,0.5)',
                      boxShadow: isHoverOrd ? `0 12px 36px ${cfg.border}, 0 2px 8px rgba(0,0,0,0.03)` : '0 4px 16px rgba(16,185,129,0.04)',
                      transform: isHoverOrd ? 'translateY(-1px)' : 'none',
                    }}>
                    <div className="absolute left-0 inset-y-0 w-1 rounded-l-3xl transition-all duration-500"
                      style={{ background: `linear-gradient(180deg, ${cfg.dot}, ${cfg.dot}60)`, opacity: isHoverOrd ? 1 : 0.35 }} />
                    <div className="pl-5 pr-6 py-5">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-[0.14em]">Order</span>
                            <span className="text-lg font-light text-gray-900 tracking-[-0.02em]">#{order.id}</span>
                            <StatusBadge status={order.status} map={ORDER_STATUS} />
                            {isUpdating && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100">
                                <div className="w-3 h-3 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
                                Updating…
                              </span>
                            )}
                            <span className="text-[11px] text-gray-300 font-light ml-auto">
                              {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {[
                              { label: 'Customer', value: order.user.name },
                              { label: 'Email', value: order.user.email },
                              { label: 'Phone', value: order.user.phone },
                            ].map(f => (
                              <div key={f.label}>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em] mb-0.5">{f.label}</p>
                                <p className="text-sm font-light text-gray-700 truncate">{f.value}</p>
                              </div>
                            ))}
                          </div>
                          {(order.items?.length > 0 || order.plant_ids) && (
                            <div className="space-y-1.5">
                              {(order.items?.length > 0 ? order.items : (() => {
                                const ids = typeof order.plant_ids === 'string' ? JSON.parse(order.plant_ids) : order.plant_ids;
                                return (Array.isArray(ids) ? ids : []).map((id: number, i: number) => ({ id: `fallback-${i}`, plant_id: id, quantity: 1 }));
                              })()).map((item: any) => {
                                const plant = plants.find((p: Plant) => p.id === item.plant_id);
                                return (
                                <div key={item.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                                  style={{ background: 'rgba(240,253,250,0.4)', border: '1px solid rgba(209,250,229,0.4)' }}>
                                  <span className="text-xs font-light text-gray-600">{plant?.name || item.plant?.name || `Plant #${item.plant_id}`} × {item.quantity}</span>
                                  {item.price && (
                                    <span className="text-xs font-light text-gray-700 tabular-nums">TK {Math.round(Number(item.price) * item.quantity).toLocaleString()}</span>
                                  )}
                                </div>
                              );})}
                            </div>
                          )}
                        </div>
                        {/* Right panel */}
                        <div className="lg:w-52 flex flex-col gap-3 flex-shrink-0">
                          <div className="relative overflow-hidden rounded-2xl p-4"
                            style={{ background: 'linear-gradient(145deg, rgba(240,253,250,0.8), rgba(255,255,255,0.6))', border: '1px solid rgba(209,250,229,0.6)' }}>
                            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full blur-lg opacity-30"
                              style={{ background: 'rgb(52,211,153)' }} />
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em] mb-1">Total</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs text-emerald-400">TK</span>
                              <span className="text-xl font-extralight tracking-[-0.03em]" style={{ color: 'rgb(5,150,105)' }}>
                                {Math.round(Number(order.total_price)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <PremiumSelect value={order.status} disabled={isLocked || isUpdating}
                            onChange={v => handleUpdateOrderStatus(order.id, v)}
                            options={[
                              { value: 'pending', label: '⏳ Pending' }, { value: 'processing', label: '🔄 Processing' },
                              { value: 'shipped', label: '📦 Shipped' }, { value: 'delivered', label: '✓ Delivered' },
                              { value: 'cancelled', label: '✕ Cancelled' },
                            ]} />
                          {isLocked && (
                            <p className="text-[10px] text-gray-300 font-light text-center">
                              {order.status === 'delivered' ? '✓ Delivery confirmed' : '✕ Order cancelled'} — locked
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredOrders.length > ordersPerPage && (
                <div className="flex flex-col items-center gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 font-light">
                      {ordersStartIndex + 1}–{Math.min(ordersStartIndex + ordersPerPage, filteredOrders.length)} of {filteredOrders.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setOrdersPage(p => Math.max(1, p - 1))} disabled={ordersPage === 1}
                      className="px-4 py-2 text-sm rounded-xl border border-emerald-200/40 bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">← Prev</button>
                    {Array.from({ length: ordersTotalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setOrdersPage(page)}
                        className={`w-10 h-10 text-sm rounded-xl border transition-all ${ordersPage === page ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-white/80 text-gray-600 border-emerald-200/40 hover:bg-emerald-50 hover:text-emerald-700'}`}>{page}</button>
                    ))}
                    <button onClick={() => setOrdersPage(p => Math.min(ordersTotalPages, p + 1))} disabled={ordersPage === ordersTotalPages}
                      className="px-4 py-2 text-sm rounded-xl border border-emerald-200/40 bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next →</button>
                  </div>
                </div>
              )}
              {filteredOrders.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(240,253,250,0.8)', border: '1px solid rgba(167,243,208,0.3)' }}>
                    <svg className="w-8 h-8 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 font-light">No orders match your criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── USERS TAB ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
         {activeTab === 'users' && (
           <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                 <h2 className="text-2xl font-extralight text-gray-800 tracking-[-0.01em]">User Management</h2>
                 <p className="text-xs text-gray-400 font-light mt-1">{filteredUsers.length} of {users.length} registered users</p>
               </div>
               <button
                 onClick={() => { setEditingUser({ id: 0, name: '', email: '', phone: '', password: '', role: 'customer' }); setShowUserModal(true); }}
                 className="group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-light text-white overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                 style={{ background: 'linear-gradient(145deg, rgb(52,211,153), rgb(16,185,129), rgb(5,150,105))', boxShadow: '0 6px 20px rgba(16,185,129,0.22), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                 <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"
                   style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                 <svg className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                 </svg>
                 <span className="relative z-10">Add User</span>
               </button>
             </div>

            {/* Filter Bar */}
            <SectionCard>
              <div className="px-6 py-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search */}
                <div className={`relative flex-1 transition-all duration-300 ${userSearchFocused ? 'scale-[1.01]' : ''}`}>
                  <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${userSearchFocused ? 'bg-gradient-to-r from-emerald-400/50 via-emerald-300/30 to-emerald-400/50' : 'bg-transparent'}`} />
                  <div className="relative flex items-center">
                    <svg className="absolute left-4 w-4 h-4 pointer-events-none transition-colors duration-300"
                      style={{ color: userSearchFocused ? 'rgb(52,211,153)' : 'rgb(209,213,219)' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search by name, email, or phone..." value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      onFocus={() => setUserSearchFocused(true)} onBlur={() => setUserSearchFocused(false)}
                      className="w-full pl-11 pr-4 py-3 bg-white/90 rounded-xl text-sm font-light text-gray-800 placeholder-gray-300 focus:outline-none transition-all duration-300"
                      style={{ border: userSearchFocused ? '1px solid transparent' : '1px solid rgba(209,250,229,0.8)', boxShadow: userSearchFocused ? '0 0 0 3px rgba(52,211,153,0.08)' : '0 1px 3px rgba(0,0,0,0.03)' }} />
                  </div>
                </div>
                <PremiumSelect value={userRoleFilter} onChange={setUserRoleFilter}
                  options={[
                    { value: 'all', label: 'All Roles' }, { value: 'customer', label: '👤 Customer' },
                    { value: 'specialist', label: '🌿 Specialist' }, { value: 'delivery', label: '🚚 Delivery' },
                    { value: 'admin', label: '👑 Admin' },
                  ]} />
                <PremiumSelect value={userSortBy} onChange={setUserSortBy}
                  options={[
                    { value: 'name-asc', label: 'Name A–Z' }, { value: 'name-desc', label: 'Name Z–A' },
                    { value: 'role', label: 'By Role' }, { value: 'newest', label: 'Newest' },
                  ]} />
              </div>
            </SectionCard>

            <SectionCard>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(240,253,250,0.8)', border: '1px solid rgba(167,243,208,0.3)' }}>
                    <svg className="w-8 h-8 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 font-light">No users match your criteria</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(209,250,229,0.6)', background: 'linear-gradient(180deg, rgba(240,253,250,0.6), transparent)' }}>
                      {['User', 'Email', 'Phone', 'Role', 'Actions'].map((h, i) => (
                        <th key={h} className={`px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-[0.16em] ${i === 4 ? 'text-center' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map(u => {
                      const isHov = hoveredRow === u.id;
                      const isAdmin = u.role === 'admin';
                      return (
                        <tr key={u.id}
                          onMouseEnter={() => setHoveredRow(u.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className="transition-all duration-300"
                          style={{ borderBottom: '1px solid rgba(243,244,246,0.8)', background: isHov ? 'rgba(240,253,250,0.4)' : 'transparent', transform: isHov ? 'translateX(2px)' : 'none' }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 font-medium"
                                style={{ background: ROLE_CONFIG[u.role]?.bg || 'rgba(240,253,250,0.8)', border: `1px solid ${ROLE_CONFIG[u.role]?.border || 'rgba(110,231,183,0.3)'}`, color: ROLE_CONFIG[u.role]?.text || 'rgb(5,150,105)' }}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-light text-gray-800" style={{ color: isHov ? 'rgb(5,150,105)' : 'rgb(31,41,55)' }}>{u.name}</p>
                                <p className="text-[10px] text-gray-400 font-light">ID #{u.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-light text-gray-500">{u.email}</td>
                          <td className="px-6 py-4 text-sm font-light text-gray-500">{u.phone}</td>
                          <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                           <td className="px-6 py-4">
                            <div className={`flex items-center justify-end gap-2 transition-all duration-300 ${isHov ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                              <button onClick={() => setViewingUser(u)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-light transition-all duration-300 hover:scale-105"
                                style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', color: 'rgb(107,114,128)' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(239,246,255,0.8)'; el.style.borderColor='rgba(96,165,250,0.5)'; el.style.color='rgb(37,99,235)'; }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='white'; el.style.borderColor='rgba(229,231,235,0.8)'; el.style.color='rgb(107,114,128)'; }}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </button>
                              <button onClick={() => { setEditingUser(u); setShowUserModal(true); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-light transition-all duration-300 hover:scale-105"
                                style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', color: 'rgb(107,114,128)' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(240,253,250,0.8)'; el.style.borderColor='rgba(110,231,183,0.5)'; el.style.color='rgb(5,150,105)'; }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='white'; el.style.borderColor='rgba(229,231,235,0.8)'; el.style.color='rgb(107,114,128)'; }}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button disabled={isAdmin}
                                onClick={() => !isAdmin && setConfirmDelete({ type: 'user', id: u.id, name: u.name })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-light transition-all duration-300 ${isAdmin ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}`}
                                style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', color: 'rgb(156,163,175)' }}
                                onMouseEnter={e => { if (!isAdmin) { const el = e.currentTarget as HTMLElement; el.style.background='rgba(254,242,242,0.8)'; el.style.borderColor='rgba(252,165,165,0.4)'; el.style.color='rgb(220,38,38)'; }}}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='white'; el.style.borderColor='rgba(229,231,235,0.8)'; el.style.color='rgb(156,163,175)'; }}
                                title={isAdmin ? 'Cannot delete admin' : undefined}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {isAdmin ? 'Protected' : 'Delete'}
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
              {filteredUsers.length > usersPerPage && (
                <div className="px-6 pb-5 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 font-light">
                      {usersStartIndex + 1}–{Math.min(usersStartIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage === 1}
                      className="px-4 py-2 text-sm rounded-xl border border-emerald-200/40 bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">← Prev</button>
                    {Array.from({ length: usersTotalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setUsersPage(page)}
                        className={`w-10 h-10 text-sm rounded-xl border transition-all ${usersPage === page ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-white/80 text-gray-600 border-emerald-200/40 hover:bg-emerald-50 hover:text-emerald-700'}`}>{page}</button>
                    ))}
                    <button onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))} disabled={usersPage === usersTotalPages}
                      className="px-4 py-2 text-sm rounded-xl border border-emerald-200/40 bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next →</button>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ── Footer Trust Bar ── */}
        <div className="mt-20 pt-10 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: '🔒', label: 'Secure Admin', sub: 'Role-protected access' },
              { icon: '📊', label: 'Real-time Data', sub: 'Live dashboard sync' },
              { icon: '🌿', label: 'Plant Intelligence', sub: 'Smart stock alerts' },
              { icon: '⚡', label: 'Instant Updates', sub: 'Zero-delay actions' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 group cursor-default">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, rgba(209,250,229,0.6), rgba(167,243,208,0.3))', border: '1px solid rgba(110,231,183,0.3)' }}>
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

      {/* ══ Plant Modal ══ */}
      <Modal
        open={showPlantModal}
        onClose={() => { setShowPlantModal(false); setEditingPlant(null); setModalImages([]); setThumbnailPreview(''); }}
        title={editingPlant ? 'Edit Plant' : 'Add New Plant'}
        subtitle={editingPlant ? `Editing ${editingPlant.name}` : 'Fill in plant details below'}
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
      >
        <form onSubmit={editingPlant ? handleUpdatePlant : handleAddPlant} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Name" name="name" defaultValue={editingPlant?.name} required placeholder="e.g. Monstera" />
            <PremiumInput label="Scientific Name" name="scientific_name" defaultValue={editingPlant?.scientific_name} placeholder="e.g. M. deliciosa" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PremiumSelect label="Category" name="category" defaultValue={editingPlant?.category} required
              options={[
                ...categories.map(c => ({ value: c.name, label: c.name })),
              ]} />
            <PremiumInput label="Price (TK)" name="price" type="number" step="0.01" min="0" defaultValue={editingPlant?.price} required placeholder="0.00" onKeyDown={e => (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') && e.preventDefault()} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Stock" name="stock" type="number" min="1" defaultValue={editingPlant?.stock} required placeholder="1" onKeyDown={e => (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+' || e.key === '.') && e.preventDefault()} />
            <input type="hidden" name="status" value="available" />
          </div>
          <PremiumTextarea label="Description" name="description" defaultValue={editingPlant?.description} required placeholder="Describe the plant…" rows={3} />
          <PremiumTextarea label="Care Tips" name="care_tips" defaultValue={editingPlant?.care_tips} required placeholder="Watering, light, soil…" rows={3} />
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">
              Thumbnail{editingPlant ? '' : ''}
              {!thumbnailPreview && !editingPlant?.thumbnail && <span className="text-emerald-400 text-[10px]">✦ recommended</span>}
            </label>
            <input type="file" ref={thumbnailInputRef} accept="image/*"
              onChange={(e) => handleThumbnailUpload(e.target.files)} className="hidden" />
            {(thumbnailPreview || editingPlant?.thumbnail) ? (
              <div className="relative group">
                <img
                  src={getImgSrc(thumbnailPreview || editingPlant?.thumbnail || '')}
                  alt="Thumbnail"
                  className="w-full h-40 object-cover rounded-xl border border-gray-100 shadow-sm"
                  style={{ border: '1px solid rgba(209,250,229,0.8)' }}
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/90 text-emerald-700 text-xs font-light rounded-lg hover:bg-white transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailPreview('');
                      if (editingPlant) setEditingPlant({ ...editingPlant, thumbnail: '' });
                    }}
                    className="px-3 py-1.5 bg-white/90 text-red-600 text-xs font-light rounded-lg hover:bg-white transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false);
                  handleThumbnailUpload(e.dataTransfer.files);
                }}
                className={`h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
              >
                {thumbnailUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 font-light">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-light">Drop image or click to upload</p>
                      <p className="text-[10px] text-gray-300 font-light mt-0.5">JPG, PNG, WEBP · Max 10MB</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Gallery Images */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">
              Gallery Images
              <span className="text-gray-300 text-[10px]">{modalImages.length}/10</span>
            </label>
            <input type="file" ref={imagesInputRef} accept="image/*" multiple
              onChange={(e) => handleImagesUpload(e.target.files)} className="hidden" />
            {modalImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-2">
                {modalImages.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    <img
                      src={getImgSrc(url)} alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-100"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setModalImages(prev => prev.filter((_, i) => i !== idx))}
                        className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {modalImages.length < 10 && (
              <div
                onClick={() => imagesInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setImagesDragOver(true); }}
                onDragLeave={() => setImagesDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setImagesDragOver(false);
                  handleImagesUpload(e.dataTransfer.files);
                }}
                className={`h-20 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                  imagesDragOver
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
              >
                {imagesUploading ? (
                  <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-xs text-gray-400 font-light">{modalImages.length > 0 ? 'Add more images' : 'Click or drop images here'}</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowPlantModal(false); setEditingPlant(null); setModalImages([]); setThumbnailPreview(''); }}
              className="flex-none px-6 py-3 rounded-2xl text-sm font-light transition-all duration-300 hover:scale-[1.02]"
              style={{ background: 'rgba(249,250,251,0.8)', border: '1px solid rgba(229,231,235,0.8)', color: 'rgb(107,114,128)' }}>
              Cancel
            </button>
            <button type="submit"
              className="group flex-1 relative flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-light text-white overflow-hidden transition-all duration-500 hover:scale-[1.01]"
              style={{ background: 'linear-gradient(145deg, rgb(52,211,153), rgb(16,185,129), rgb(5,150,105))', boxShadow: '0 6px 20px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
              <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="relative z-10">{editingPlant ? 'Update Plant' : 'Add Plant'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ══ User Modal ══ */}
      <Modal
        open={showUserModal}
        onClose={() => { setShowUserModal(false); setEditingUser(null); }}
        title={editingUser?.id === 0 ? 'Add New User' : 'Edit User'}
        subtitle={editingUser?.id !== 0 ? `Editing ${editingUser?.name}` : 'Create a new platform user'}
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
      >
        {editingUser && (
          <form onSubmit={e => { e.preventDefault(); editingUser.id === 0 ? handleAddUser(e) : handleUpdateUser(e); }}
            className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <PremiumInput label="Full Name" value={editingUser.name} onChange={v => setEditingUser({ ...editingUser, name: v })} required placeholder="John Doe" />
              <PremiumInput label="Phone" value={editingUser.phone} onChange={v => setEditingUser({ ...editingUser, phone: v.replace(/\D/g, '').slice(0, 11) })} required placeholder="01XXXXXXXXX" />
            </div>
            <PremiumInput label="Email" type="email" value={editingUser.email} onChange={v => setEditingUser({ ...editingUser, email: v })} required placeholder="user@example.com" />
            {editingUser.id === 0 && (
              <PremiumInput label="Password" type="password" value={editingUser.password || ''}
                onChange={v => setEditingUser({ ...editingUser, password: v })} required
                placeholder="Min 8 characters" hint="Password must be at least 8 characters" />
            )}
            <PremiumSelect label="Role" value={editingUser.role} onChange={v => setEditingUser({ ...editingUser, role: v })} required
              options={[
                { value: 'customer', label: '👤 Customer' }, { value: 'specialist', label: '🌿 Specialist' },
                { value: 'delivery', label: '🚚 Delivery' },
              ]} />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowUserModal(false); setEditingUser(null); }}
                className="flex-none px-6 py-3 rounded-2xl text-sm font-light transition-all duration-300"
                style={{ background: 'rgba(249,250,251,0.8)', border: '1px solid rgba(229,231,235,0.8)', color: 'rgb(107,114,128)' }}>
                Cancel
              </button>
              <button type="submit"
                className="group flex-1 relative flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-light text-white overflow-hidden transition-all duration-500 hover:scale-[1.01]"
                style={{ background: 'linear-gradient(145deg, rgb(52,211,153), rgb(16,185,129), rgb(5,150,105))', boxShadow: '0 6px 20px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="relative z-10">{editingUser.id === 0 ? 'Create User' : 'Update User'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ══ User Detail Modal ══ */}
      <Modal
        open={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="User Details"
        subtitle={viewingUser ? `Viewing ${viewingUser.name}` : undefined}
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        accentColor="rgba(96,165,250,0.4)"
      >
        {viewingUser && (
          <div className="space-y-6">
            {/* Avatar & Name Header */}
            <div className="flex items-center gap-5 pb-5"
              style={{ borderBottom: '1px solid rgba(243,244,246,0.8)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${ROLE_CONFIG[viewingUser.role]?.bg || 'rgba(240,253,250,0.8)'}, white)`,
                  border: `1.5px solid ${ROLE_CONFIG[viewingUser.role]?.border || 'rgba(110,231,183,0.3)'}`,
                  color: ROLE_CONFIG[viewingUser.role]?.text || 'rgb(5,150,105)',
                }}>
                {viewingUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-light text-gray-900">{viewingUser.name}</h4>
                <div className="mt-1"><RoleBadge role={viewingUser.role} /></div>
              </div>
            </div>

            {/* Detail Fields */}
            <div className="space-y-4">
              {[
                { label: 'User ID', value: `#${viewingUser.id}`, icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                )},
                { label: 'Email', value: viewingUser.email, icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                )},
                { label: 'Phone', value: viewingUser.phone, icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                )},
                { label: 'Role', value: ROLE_CONFIG[viewingUser.role]?.label || viewingUser.role, icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                )},
              ].map(field => (
                <div key={field.label} className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: 'rgba(249,250,251,0.6)', border: '1px solid rgba(229,231,235,0.5)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', color: 'rgb(107,114,128)' }}>
                    {field.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">{field.label}</p>
                    <p className="text-sm font-light text-gray-800 mt-0.5 truncate">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid rgba(243,244,246,0.8)' }}>
              <button onClick={() => { setEditingUser(viewingUser); setShowUserModal(true); setViewingUser(null); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-light transition-all duration-300 hover:scale-[1.01]"
                style={{ background: 'rgba(239,246,255,0.8)', border: '1px solid rgba(96,165,250,0.3)', color: 'rgb(37,99,235)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit User
              </button>
              <button onClick={() => setViewingUser(null)}
                className="flex-none px-6 py-3 rounded-2xl text-sm font-light transition-all duration-300"
                style={{ background: 'rgba(249,250,251,0.8)', border: '1px solid rgba(229,231,235,0.8)', color: 'rgb(107,114,128)' }}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ Confirm Delete Modal ══ */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center p-5 z-[95]"
          style={{ background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(16px)' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="relative w-full max-w-sm">
            <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)' }} />
            <div className="relative rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(32px)', border: '1px solid rgba(254,202,202,0.4)', boxShadow: '0 32px 80px rgba(0,0,0,0.10)' }}>
              <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.6) 50%, transparent)' }} />
              <div className="p-8 text-center">
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-2xl blur-lg opacity-20" style={{ background: 'rgb(239,68,68)' }} />
                  <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(254,242,242,0.9)', border: '1px solid rgba(252,165,165,0.3)' }}>
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-light text-gray-800 mb-1.5">Delete {confirmDelete.type === 'plant' ? 'Plant' : 'User'}</h3>
                <div className="w-8 h-px mx-auto mb-4 rounded-full" style={{ background: 'rgba(239,68,68,0.4)' }} />
                <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
                  Remove <span className="font-medium text-gray-600">"{confirmDelete.name}"</span> permanently?
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => confirmDelete.type === 'plant' ? handleDeletePlant(confirmDelete.id) : handleDeleteUser(confirmDelete.id)}
                    disabled={deletingId === confirmDelete.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-light text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-70"
                    style={{ background: 'linear-gradient(145deg, rgb(248,113,113), rgb(239,68,68), rgb(220,38,38))', boxShadow: '0 6px 20px rgba(239,68,68,0.25)' }}>
                    {deletingId === confirmDelete.id
                      ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" /></svg>}
                    {deletingId === confirmDelete.id ? 'Deleting…' : 'Yes, Delete'}
                  </button>
                  <button onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-light transition-all duration-300 hover:scale-[1.02]"
                    style={{ background: 'rgba(249,250,251,0.8)', border: '1px solid rgba(229,231,235,0.8)', color: 'rgb(107,114,128)' }}>
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
export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen font-['Inter',sans-serif]"
        style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f9fffe 40%, #f0faf5 70%, #ffffff 100%)' }}>
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-[3px] border-gray-100" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
              style={{ borderTopColor: 'rgb(52,211,153)', animationDuration: '1s' }} />
            <div className="absolute inset-3 rounded-full border-[2px] border-transparent animate-spin"
              style={{ borderTopColor: 'rgba(16,185,129,0.5)', animationDuration: '1.5s', animationDirection: 'reverse' }} />
            <div className="absolute inset-[30px] rounded-full animate-pulse" style={{ background: 'rgb(52,211,153)' }} />
          </div>
          <p className="text-sm font-light text-gray-400 uppercase tracking-[0.2em] animate-pulse">Loading Dashboard</p>
        </div>
      </div>
    }>
      <AdminDashboardInner />
    </Suspense>
  );
}
