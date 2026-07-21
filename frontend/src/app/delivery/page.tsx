'use client';

// ============================================================
// DELIVERY DASHBOARD (Delivery Staff) — '/delivery'
// Order management with status updates, filtering, sorting
// ============================================================

import { useEffect, useState } from 'react';
import Header from '@/components/Header';

const ordersPerPage = 10;

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface OrderItem {
  id: number;
  plant_id: number;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  user_id: number;
  total_price: string;
  plant_ids: string;
  status: string;
  created_at: string;
  user: User;
  items: OrderItem[];
}

// ── Status Configuration ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string;
  colors: { bg: string; text: string; border: string; dot: string; glow: string };
  icon: React.ReactNode;
  step: number;
}> = {
  pending: {
    label: 'Pending',
    colors: {
      bg: 'rgba(255,251,235,0.9)',
      text: 'rgb(180,130,0)',
      border: 'rgba(251,191,36,0.35)',
      dot: 'rgb(251,191,36)',
      glow: 'rgba(251,191,36,0.15)',
    },
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    step: 1,
  },
  processing: {
    label: 'Processing',
    colors: {
      bg: 'rgba(239,246,255,0.9)',
      text: 'rgb(37,99,235)',
      border: 'rgba(96,165,250,0.35)',
      dot: 'rgb(96,165,250)',
      glow: 'rgba(96,165,250,0.15)',
    },
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    step: 2,
  },
  shipped: {
    label: 'Shipped',
    colors: {
      bg: 'rgba(245,243,255,0.9)',
      text: 'rgb(109,40,217)',
      border: 'rgba(167,139,250,0.35)',
      dot: 'rgb(167,139,250)',
      glow: 'rgba(167,139,250,0.15)',
    },
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    step: 3,
  },
  delivered: {
    label: 'Delivered',
    colors: {
      bg: 'rgba(240,253,250,0.9)',
      text: 'rgb(5,150,105)',
      border: 'rgba(52,211,153,0.35)',
      dot: 'rgb(52,211,153)',
      glow: 'rgba(52,211,153,0.15)',
    },
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
    step: 4,
  },
  cancelled: {
    label: 'Cancelled',
    colors: {
      bg: 'rgba(254,242,242,0.9)',
      text: 'rgb(220,38,38)',
      border: 'rgba(252,165,165,0.35)',
      dot: 'rgb(252,165,165)',
      glow: 'rgba(252,165,165,0.15)',
    },
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    step: 0,
  },
};

// ── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-light rounded-full ${
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'
      }`}
      style={{
        background: cfg.colors.bg,
        color: cfg.colors.text,
        border: `1px solid ${cfg.colors.border}`,
        boxShadow: `0 2px 8px ${cfg.colors.glow}`,
      }}
    >
      <span className="flex-shrink-0" style={{ color: cfg.colors.dot }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};

// ── Progress Track ───────────────────────────────────────────────────────────
const OrderProgressTrack = ({ status }: { status: string }) => {
  if (status === 'cancelled') return null;
  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  const current = STATUS_CONFIG[status]?.step ?? 1;
  return (
    <div className="flex items-center gap-0 mt-4">
      {steps.map((s, i) => {
        const cfg   = STATUS_CONFIG[s];
        const done  = cfg.step <= current;
        const active = cfg.step === current;
        return (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0"
                style={{
                  background: done
                    ? `linear-gradient(145deg, rgb(52,211,153), rgb(16,185,129))`
                    : 'rgba(243,244,246,0.8)',
                  border: active
                    ? '2px solid rgba(52,211,153,0.6)'
                    : done
                      ? 'none'
                      : '2px solid rgba(229,231,235,0.8)',
                  boxShadow: active ? '0 0 12px rgba(52,211,153,0.35)' : 'none',
                }}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <span className="text-[9px] font-medium uppercase tracking-wider"
                style={{ color: done ? 'rgb(16,185,129)' : 'rgb(209,213,219)' }}>
                {cfg.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-1 mb-4 rounded-full transition-all duration-700"
                style={{
                  background: steps[i + 1] && STATUS_CONFIG[steps[i + 1]].step <= current
                    ? 'linear-gradient(90deg, rgb(52,211,153), rgb(16,185,129))'
                    : 'rgb(229,231,235)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Premium Select ───────────────────────────────────────────────────────────
const PremiumSelect = ({
  value, onChange, options, disabled, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  placeholder?: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      {!disabled && (
        <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${
          focused ? 'bg-gradient-to-r from-emerald-400/50 via-emerald-300/30 to-emerald-400/50' : 'bg-transparent'
        }`} />
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        className="relative w-full pl-4 pr-10 py-3 rounded-xl text-sm font-light focus:outline-none appearance-none transition-all duration-300"
        style={{
          background: disabled ? 'rgba(249,250,251,0.6)' : 'rgba(255,255,255,0.95)',
          border: focused && !disabled
            ? '1px solid transparent'
            : '1px solid rgba(209,250,229,0.7)',
          color: disabled ? 'rgb(156,163,175)' : 'rgb(55,65,81)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: focused && !disabled
            ? '0 0 0 3px rgba(52,211,153,0.08), 0 2px 8px rgba(16,185,129,0.06)'
            : '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ${focused ? 'rotate-180' : ''}`}>
        <svg className="w-4 h-4" style={{ color: disabled ? 'rgb(209,213,219)' : focused ? 'rgb(52,211,153)' : 'rgb(209,213,219)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, icon, accent,
}: {
  label: string; value: number | string; icon: React.ReactNode; accent: string;
}) => (
  <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] group"
    style={{
      background: 'rgba(255,255,255,0.92)',
      border: '1px solid rgba(209,250,229,0.55)',
      boxShadow: '0 4px 20px rgba(16,185,129,0.05), 0 1px 4px rgba(0,0,0,0.03)',
    }}>
    {/* Ambient corner glow */}
    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-30 transition-opacity duration-300 group-hover:opacity-50"
      style={{ background: accent }} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.16em] mb-2">{label}</p>
        <p className="text-3xl font-extralight text-gray-800 tracking-[-0.02em]">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `linear-gradient(145deg, ${accent}30, ${accent}15)`,
          border: `1px solid ${accent}30`,
        }}>
        {icon}
      </div>
    </div>
  </div>
);

export default function DeliveryDashboard() {
  const [user, setUser]                       = useState<User | null>(null);
  const [orders, setOrders]                   = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders]   = useState<Order[]>([]);
  const [plants, setPlants]                   = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedOrder, setSelectedOrder]     = useState<Order | null>(null);
  const [orderItems, setOrderItems]           = useState<OrderItem[]>([]);
  const [sortBy, setSortBy]                   = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder]             = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus]       = useState<string>('all');
  const [updatingId, setUpdatingId]           = useState<string | null>(null);
  const [toast, setToast]                     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [hoveredOrder, setHoveredOrder]       = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder]     = useState<string | null>(null);
  const [currentPage, setCurrentPage]         = useState(1);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const userData = JSON.parse(stored);
    setUser(userData);
    if (userData.role !== 'delivery') {
      window.location.href = '/'; return;
    }
    fetchOrders();
    fetchPlants();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const fetchPlants = async () => {
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`);
      const data = await res.json();
      setPlants(data);
    } catch {}
  };

  useEffect(() => {
    applyFiltersAndSort(orders, filterStatus, sortBy, sortOrder);
  }, [orders, filterStatus, sortBy, sortOrder]);

  useEffect(() => { setCurrentPage(1); }, [filterStatus, sortBy, sortOrder]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updated);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : prev);
      }
      showToast(`Order #${orderId} marked as ${newStatus}`);
    } catch {
      showToast('Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const applyFiltersAndSort = (
    src: Order[], status: string,
    sort: 'date' | 'status', dir: 'asc' | 'desc',
  ) => {
    let f = status === 'all' ? [...src] : src.filter(o => o.status === status);
    f.sort((a, b) => {
      const cmp = sort === 'date'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : a.status.localeCompare(b.status);
      return dir === 'asc' ? cmp : -cmp;
    });
    setFilteredOrders(f);
  };

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    setOrderItems(order.items || []);
    if (!order.items?.length) {
      try {
        const res  = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`);
        const data = await res.json();
        const full = data.find((o: Order) => o.id === order.id);
        if (full?.items) setOrderItems(full.items);
      } catch {}
    }
  };

  const handleLogout = () => { localStorage.removeItem('user'); window.location.href = '/'; };

  // Derived stats
  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    shipped:   orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  // ── Loading Screen ─────────────────────────────────────────────────────────
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
          <div className="absolute inset-[30px] rounded-full animate-pulse"
            style={{ background: 'rgb(52,211,153)' }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-light text-gray-400 uppercase tracking-[0.2em] animate-pulse">Loading Orders</p>
          <p className="text-xs text-gray-300 font-light mt-1">Fetching delivery data…</p>
        </div>
      </div>
    </div>
  );

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

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

      {/* ── Floating Orbs ── */}
      <div className="fixed pointer-events-none" style={{ zIndex: 0, top: '10%', right: '5%' }}>
        <div className="w-64 h-64 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, rgb(52,211,153) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* ── Toast ── */}
      <div className={`fixed top-6 right-6 z-[100] transition-all duration-700 ${
        toast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
      }`}>
        <div className={`relative flex items-center gap-4 pl-5 pr-6 py-4 rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-2xl ${
          toast?.type === 'success'
            ? 'bg-white/95 border-emerald-100 shadow-emerald-500/08'
            : 'bg-white/95 border-red-100 shadow-red-500/08'
        }`}>
          <div className={`absolute left-0 inset-y-0 w-1 rounded-l-2xl ${
            toast?.type === 'success'
              ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
              : 'bg-gradient-to-b from-red-400 to-red-600'
          }`} />
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
            <p className="text-sm font-medium text-gray-800">{toast?.type === 'success' ? 'Updated' : 'Error'}</p>
            <p className="text-xs text-gray-400 font-light mt-0.5">{toast?.msg}</p>
          </div>
        </div>
      </div>

      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 relative max-w-[1400px] mx-auto w-full px-5 sm:px-8 lg:px-14 py-12"
        style={{ zIndex: 10 }}>

        {/* ── Hero Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(209,250,229,0.6) 0%, rgba(167,243,208,0.3) 100%)',
                border: '1px solid rgba(110,231,183,0.4)',
              }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-[0.18em]">
                Delivery Dashboard
              </span>
            </div>

            <div className="flex items-start gap-5">
              <div className="relative flex-shrink-0 mt-1">
                <div className="absolute -inset-2 rounded-2xl blur-lg opacity-40"
                  style={{ background: 'linear-gradient(135deg, rgb(52,211,153), rgb(16,185,129))' }} />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{ background: 'linear-gradient(145deg, rgb(52,211,153) 0%, rgb(5,150,105) 100%)' }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-extralight text-gray-900 tracking-[-0.02em] leading-none">
                  Order
                  <span className="font-light" style={{ color: 'rgb(16,185,129)' }}> Deliveries</span>
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-px w-20 rounded-full"
                    style={{ background: 'linear-gradient(90deg, rgb(16,185,129), transparent)' }} />
                  <div className="w-1 h-1 rounded-full bg-emerald-300" />
                  <div className="h-px w-10 rounded-full bg-emerald-100" />
                </div>
                <p className="mt-2 text-sm text-gray-400 font-light">
                  Welcome back,{' '}
                  <span className="text-emerald-600 font-medium">{user?.name}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchOrders}
            className="group self-start lg:self-auto flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-light transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'white',
              border: '1px solid rgba(209,250,229,0.8)',
              color: 'rgb(107,114,128)',
              boxShadow: '0 2px 12px rgba(16,185,129,0.06)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(110,231,183,0.5)';
              (e.currentTarget as HTMLElement).style.color = 'rgb(5,150,105)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(209,250,229,0.8)';
              (e.currentTarget as HTMLElement).style.color = 'rgb(107,114,128)';
            }}
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Orders
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Orders" value={stats.total}
            accent="rgba(16,185,129,1)"
            icon={
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            label="Pending" value={stats.pending}
            accent="rgba(251,191,36,1)"
            icon={
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="In Transit" value={stats.shipped}
            accent="rgba(167,139,250,1)"
            icon={
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            }
          />
          <StatCard
            label="Delivered" value={stats.delivered}
            accent="rgba(52,211,153,1)"
            icon={
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* ── Filter Bar ── */}
        <div className="relative mb-8">
          <div className="absolute -inset-2 rounded-3xl blur-xl opacity-50"
            style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(167,243,208,0.20) 0%, transparent 70%)' }} />
          <div className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(209,250,229,0.6)',
              boxShadow: '0 4px 24px rgba(16,185,129,0.06), 0 1px 6px rgba(0,0,0,0.03)',
            }}>
            <div className="h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.5) 30%, rgba(16,185,129,0.8) 50%, rgba(52,211,153,0.5) 70%, transparent)' }} />
            <div className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-5">
              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.16em] mr-1">Status:</span>
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => {
                  const cfg = s !== 'all' ? STATUS_CONFIG[s] : null;
                  const active = filterStatus === s;
                  return (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-light transition-all duration-300 hover:scale-[1.03]"
                      style={{
                        background: active
                          ? cfg ? cfg.colors.bg : 'linear-gradient(135deg, rgba(209,250,229,0.8), rgba(167,243,208,0.5))'
                          : 'rgba(249,250,251,0.8)',
                        border: active
                          ? `1px solid ${cfg ? cfg.colors.border : 'rgba(110,231,183,0.4)'}`
                          : '1px solid rgba(229,231,235,0.8)',
                        color: active
                          ? cfg ? cfg.colors.text : 'rgb(5,150,105)'
                          : 'rgb(156,163,175)',
                        boxShadow: active && cfg ? `0 2px 8px ${cfg.colors.glow}` : 'none',
                      }}>
                      {cfg && <span style={{ color: cfg.colors.dot }}>{cfg.icon}</span>}
                      {s === 'all' ? 'All' : cfg!.label}
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-8 bg-gray-100 mx-2" />

              {/* Sort Controls */}
              <div className="flex items-center gap-3 md:ml-auto">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.16em]">Sort:</span>
                <PremiumSelect
                  value={sortBy}
                  onChange={v => setSortBy(v as 'date' | 'status')}
                  options={[
                    { value: 'date', label: 'By Date' },
                    { value: 'status', label: 'By Status' },
                  ]}
                />
                <button
                  onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-[1.05]"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(209,250,229,0.7)',
                    color: 'rgb(52,211,153)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <span className="text-sm text-gray-400 font-light whitespace-nowrap">
                  <span className="font-medium text-gray-700">{filteredOrders.length}</span> of {orders.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Empty State ── */}
        {orders.length === 0 ? (
          <div className="text-center py-28">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-3xl blur-xl opacity-25"
                style={{ background: 'linear-gradient(135deg, rgb(52,211,153), rgb(16,185,129))' }} />
              <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, rgba(209,250,229,0.8), rgba(167,243,208,0.4))',
                  border: '1px solid rgba(110,231,183,0.3)',
                }}>
                <svg className="w-12 h-12 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-extralight text-gray-700 mb-2">No Orders Yet</h3>
            <p className="text-sm text-gray-400 font-light">New orders will appear here when customers place them.</p>
          </div>
        ) : (
          <>
          <div className="space-y-5">
            {paginatedOrders.map((order, idx) => {
              const isHover    = hoveredOrder === order.id;
              const isUpdating = updatingId === order.id;
              const isLocked   = order.status === 'delivered' || order.status === 'cancelled';
              const cfg        = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  onMouseEnter={() => setHoveredOrder(order.id)}
                  onMouseLeave={() => setHoveredOrder(null)}
                  className="relative rounded-3xl overflow-hidden transition-all duration-500"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: isHover
                      ? `1px solid ${cfg.colors.border}`
                      : '1px solid rgba(209,250,229,0.5)',
                    boxShadow: isHover
                      ? `0 16px 48px ${cfg.colors.glow}, 0 4px 16px rgba(0,0,0,0.04)`
                      : '0 4px 20px rgba(16,185,129,0.05), 0 1px 4px rgba(0,0,0,0.03)',
                    transform: isHover ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  {/* Left status bar */}
                  <div className="absolute left-0 inset-y-0 w-1 rounded-l-3xl transition-all duration-500"
                    style={{
                      background: `linear-gradient(180deg, ${cfg.colors.dot}, ${cfg.colors.dot}80)`,
                      opacity: isHover ? 1 : 0.4,
                    }} />

                  {/* Top shimmer on hover */}
                  <div className="absolute inset-x-0 top-0 h-[2px] transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${cfg.colors.dot}60, transparent)`,
                      opacity: isHover ? 1 : 0,
                    }} />

                  <div className="pl-5 pr-6 pt-6 pb-6">
                    {/* ── Card Header ── */}
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">

                      {/* Left: Order Info */}
                      <div className="flex-1 min-w-0">
                        {/* Top row */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `linear-gradient(145deg, ${cfg.colors.bg}, ${cfg.colors.glow})`,
                                border: `1px solid ${cfg.colors.border}`,
                              }}>
                              <span style={{ color: cfg.colors.dot }}>{cfg.icon}</span>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em]">Order</p>
                              <p className="text-lg font-light text-gray-900 leading-none tracking-[-0.02em]">
                                #{order.id}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={order.status} />
                          {isUpdating && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                              <div className="w-3 h-3 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
                              <span className="text-[11px] text-emerald-600 font-light">Updating…</span>
                            </div>
                          )}
                          <span className="text-[11px] text-gray-300 font-light ml-auto lg:ml-0">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Customer grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                          {[
                            { label: 'Customer', value: order.user.name, icon: '👤' },
                            { label: 'Email', value: order.user.email, icon: '✉️' },
                            { label: 'Phone', value: order.user.phone, icon: '📱' },
                          ].map(f => (
                            <div key={f.label} className="space-y-1">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">
                                {f.label}
                              </p>
                              <p className="text-sm font-light text-gray-700 truncate">{f.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Progress Track */}
                        <OrderProgressTrack status={order.status} />

                        {/* Items summary */}
                        <div className="mt-5">
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="flex items-center gap-2 text-xs font-light text-gray-400 hover:text-emerald-600 transition-colors duration-300 mb-3"
                          >
                            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            {order.items?.length || 0} items — click to{' '}
                            {isExpanded ? 'collapse' : 'expand'}
                          </button>

                          {isExpanded && order.items?.length > 0 && (
                            <div className="space-y-2">
                              {order.items.map(item => {
                                const plant = plants.find(p => p.id === item.plant_id);
                                return (
                                  <div key={item.id}
                                    className="flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200"
                                    style={{
                                      background: 'rgba(240,253,250,0.5)',
                                      border: '1px solid rgba(209,250,229,0.5)',
                                    }}>
                                    <div className="flex items-center gap-3 min-w-0">
                                      {/* Plant thumb */}
                                      <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                                        style={{
                                          background: 'linear-gradient(145deg, rgba(209,250,229,0.8), rgba(167,243,208,0.4))',
                                          border: '1px solid rgba(110,231,183,0.3)',
                                        }}>
                                        {plant?.thumbnail ? (
                                          <img
                                            src={plant.thumbnail.startsWith('http') ? plant.thumbnail : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${plant.thumbnail}`}
                                            alt={plant.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-emerald-300 text-sm">🌿</span>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-light text-gray-800 truncate">
                                          {plant?.name || `Plant #${item.plant_id}`}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[11px] text-gray-400 font-light">
                                            × {item.quantity}
                                          </span>
                                          {plant && (
                                            <span className="text-[11px] px-1.5 py-0.5 rounded-md"
                                              style={{
                                                background: (plant.stock || 0) === 0 ? 'rgba(254,242,242,0.8)' : 'rgba(240,253,250,0.8)',
                                                color: (plant.stock || 0) === 0 ? 'rgb(220,38,38)' : 'rgb(5,150,105)',
                                              }}>
                                              Stock: {plant.stock || 0}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-baseline gap-1 flex-shrink-0">
                                      <span className="text-[10px] text-gray-300">TK</span>
                                      <span className="text-sm font-light text-gray-700 tabular-nums">
                                        {Math.round(Number(item.price) * item.quantity).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount + Actions */}
                      <div className="lg:w-56 flex flex-col gap-4 flex-shrink-0">
                        {/* Total amount card */}
                        <div className="relative overflow-hidden rounded-2xl p-4"
                          style={{
                            background: 'linear-gradient(145deg, rgba(240,253,250,0.8), rgba(255,255,255,0.6))',
                            border: '1px solid rgba(209,250,229,0.6)',
                          }}>
                          <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full blur-lg opacity-30"
                            style={{ background: 'rgb(52,211,153)' }} />
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-1">
                            Total Amount
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs text-emerald-400 font-light">TK</span>
                            <span className="text-2xl font-extralight tracking-[-0.03em]"
                              style={{ color: 'rgb(5,150,105)' }}>
                              {Math.round(Number(order.total_price)).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Status updater */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em]">
                            Update Status
                          </p>
                          <PremiumSelect
                            value={order.status}
                            onChange={v => updateOrderStatus(order.id, v)}
                            disabled={isLocked || isUpdating}
                            options={[
                              { value: 'pending', label: 'Pending' },
                              { value: 'processing', label: 'Processing' },
                              { value: 'shipped', label: 'Shipped' },
                              { value: 'delivered', label: 'Delivered' },
                              { value: 'cancelled', label: 'Cancelled' },
                            ]}
                          />
                          {isLocked && (
                            <p className="text-[11px] text-gray-300 font-light leading-relaxed">
                              {order.status === 'delivered'
                                ? '✓ Delivery confirmed — status locked'
                                : '✕ Order cancelled — status locked'}
                            </p>
                          )}
                        </div>

                        {/* View Details button */}
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="group relative w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-light text-white overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                          style={{
                            background: 'linear-gradient(145deg, rgb(52,211,153) 0%, rgb(16,185,129) 50%, rgb(5,150,105) 100%)',
                            boxShadow: '0 6px 20px rgba(16,185,129,0.22), inset 0 1px 0 rgba(255,255,255,0.2)',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.25)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(16,185,129,0.22), inset 0 1px 0 rgba(255,255,255,0.2)';
                          }}
                        >
                          {/* Shimmer */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                          <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                               d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                           <span className="relative z-10">View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOrders.length > ordersPerPage && (
            <div className="flex flex-col items-center gap-3 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-light">
                  {startIndex + 1}–{Math.min(startIndex + ordersPerPage, filteredOrders.length)} of {filteredOrders.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-4 py-2 text-sm rounded-xl border border-emerald-200/40 bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 text-sm rounded-xl border transition-all ${currentPage === page ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-white/80 text-gray-600 border-emerald-200/40 hover:bg-emerald-50 hover:text-emerald-700'}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm rounded-xl border border-emerald-200/40 bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next →</button>
              </div>
            </div>
          )}
        </>
      )}
      </main>
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedOrder(null)}>
          <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f9fffe 50%, #f0faf5 100%)' }}
            onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-8 py-6"
              style={{ borderBottom: '1px solid rgba(209,250,229,0.5)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em]">Order Details</p>
                  <p className="text-xl font-light text-gray-900 mt-1">#{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ background: 'rgba(249,250,251,0.8)', border: '1px solid rgba(229,231,235,0.8)' }}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 space-y-5 max-h-[50vh] overflow-y-auto">
              {/* Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Customer</p>
                  <p className="text-sm font-light text-gray-700 mt-0.5">{selectedOrder.user.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Email</p>
                  <p className="text-sm font-light text-gray-700 mt-0.5">{selectedOrder.user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Phone</p>
                  <p className="text-sm font-light text-gray-700 mt-0.5">{selectedOrder.user.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Status</p>
                  <p className="text-sm font-light text-gray-700 mt-0.5 capitalize">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Date</p>
                  <p className="text-sm font-light text-gray-700 mt-0.5">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Items</p>
                  <p className="text-sm font-light text-gray-700 mt-0.5">{orderItems.length} item{orderItems.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Items List */}
              {orderItems.length > 0 && (
                <div className="space-y-2">
                  {orderItems.map(item => {
                    const plant = plants.find(p => p.id === item.plant_id);
                    return (
                      <div key={item.id}
                        className="flex items-center justify-between px-4 py-3 rounded-2xl"
                        style={{ background: 'rgba(240,253,250,0.5)', border: '1px solid rgba(209,250,229,0.5)' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(145deg, rgba(209,250,229,0.8), rgba(167,243,208,0.4))' }}>
                            {plant?.thumbnail ? (
                              <img src={plant.thumbnail.startsWith('http') ? plant.thumbnail : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${plant.thumbnail}`} alt={plant.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-emerald-300 text-sm">🌿</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-light text-gray-800 truncate">{plant?.name || `Plant #${item.plant_id}`}</p>
                            <span className="text-[11px] text-gray-400 font-light">× {item.quantity}</span>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1 flex-shrink-0">
                          <span className="text-[10px] text-gray-300">TK</span>
                          <span className="text-sm font-light text-gray-700 tabular-nums">{Math.round(Number(item.price) * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total */}
                <div className="flex items-center justify-between pt-4"
                  style={{ borderTop: '1px solid rgba(209,250,229,0.5)' }}>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em]">Order Total</p>
                    <p className="text-xs text-gray-300 font-light mt-0.5">{orderItems.length} item{orderItems.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm text-emerald-400 font-light">TK</span>
                      <span className="text-3xl font-extralight tracking-[-0.03em]"
                        style={{ color: 'rgb(5,150,105)' }}>
                        {Math.round(Number(selectedOrder.total_price)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(240,253,250,0.8)' }}>
                <div className="flex gap-3">
                  {!(selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') && (
                    <div className="flex-1">
                      <PremiumSelect
                        value={selectedOrder.status}
                        onChange={v => updateOrderStatus(selectedOrder.id, v)}
                        disabled={updatingId === selectedOrder.id}
                        options={[
                          { value: 'pending', label: '⏳ Mark Pending' },
                          { value: 'processing', label: '🔄 Mark Processing' },
                          { value: 'shipped', label: '📦 Mark Shipped' },
                          { value: 'delivered', label: '✓ Mark Delivered' },
                          { value: 'cancelled', label: '✕ Mark Cancelled' },
                        ]}
                      />
                    </div>
                  )}
                  <button onClick={() => setSelectedOrder(null)}
                    className="flex-none px-6 py-3 rounded-2xl text-sm font-light transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'rgba(249,250,251,0.8)',
                      border: '1px solid rgba(229,231,235,0.8)',
                      color: 'rgb(107,114,128)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'white';
                      (e.currentTarget as HTMLElement).style.color = 'rgb(55,65,81)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(249,250,251,0.8)';
                      (e.currentTarget as HTMLElement).style.color = 'rgb(107,114,128)';
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}