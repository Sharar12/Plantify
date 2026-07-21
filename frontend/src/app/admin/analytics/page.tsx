/* ==========================================================================
 * Analytics Dashboard Page
 * ==========================================================================
 * Displays business intelligence metrics including:
 *   - KPI cards: Revenue, Orders, Customers, Products (with month-over-month deltas)
 *   - Monthly revenue bar chart (toggleable between total & delivered)
 *   - Category distribution donut chart with interactive segments
 *   - Order status breakdown with animated progress bars
 *   - Top 5 selling plants ranking with animated bar charts
 *   - Quick performance metrics (avg order value, products per order)
 * ========================================================================== */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface AnalyticsData {
  totalRevenue: number;
  deliveredRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  monthlyRevenue: number[];
  deliveredMonthlyRevenue: number[];
  categoryDistribution: { category: string; count: number }[];
  topSellingPlants: { name: string; sales: number }[];
  orderStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

// ── Color Palette ────────────────────────────────────────────────────────────
const CATEGORY_PALETTE = [
  { bg: 'rgb(52,211,153)',  light: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.3)'  },
  { bg: 'rgb(96,165,250)',  light: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.3)'  },
  { bg: 'rgb(167,139,250)', light: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)' },
  { bg: 'rgb(251,191,36)',  light: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)'  },
  { bg: 'rgb(249,115,22)',  light: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.3)'  },
  { bg: 'rgb(236,72,153)',  light: 'rgba(236,72,153,0.15)',  border: 'rgba(236,72,153,0.3)'  },
];

const ORDER_STATUS_CFG: Record<string, { label: string; color: string; light: string; border: string; dot: string }> = {
  pending:    { label: 'Pending',    color: 'rgb(251,191,36)',  light: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.35)',  dot: 'rgb(251,191,36)'  },
  processing: { label: 'Processing', color: 'rgb(96,165,250)',  light: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.35)',  dot: 'rgb(96,165,250)'  },
  shipped:    { label: 'Shipped',    color: 'rgb(167,139,250)', light: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', dot: 'rgb(167,139,250)' },
  delivered:  { label: 'Delivered',  color: 'rgb(52,211,153)',  light: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.35)',  dot: 'rgb(52,211,153)'  },
  cancelled:  { label: 'Cancelled',  color: 'rgb(248,113,113)', light: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', dot: 'rgb(248,113,113)' },
};

// ── Section Card ─────────────────────────────────────────────────────────────
const Card = ({
  children, className = '', accentColor = 'rgba(52,211,153,0.8)',
}: {
  children: React.ReactNode; className?: string; accentColor?: string;
}) => (
  <div className={`relative rounded-3xl overflow-hidden ${className}`}
    style={{
      background: 'rgba(255,255,255,0.93)',
      border: '1px solid rgba(209,250,229,0.55)',
      boxShadow: '0 4px 24px rgba(16,185,129,0.06), 0 1px 4px rgba(0,0,0,0.03)',
    }}>
    <div className="h-[2px]"
      style={{ background: `linear-gradient(90deg, transparent, ${accentColor} 30%, ${accentColor} 70%, transparent)` }} />
    {children}
  </div>
);

// ── KPI Metric Card ──────────────────────────────────────────────────────────
const MetricCard = ({
  label, value, sub, delta, deltaTitle, icon, accent, gradient,
}: {
  label: string; value: string | number; sub?: string | React.ReactNode;
  delta?: { value: string; positive: boolean };
  deltaTitle?: string;
  icon: React.ReactNode; accent: string; gradient: string;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 cursor-default transition-all duration-500"
      style={{
        background: 'rgba(255,255,255,0.93)',
        border: hovered ? `1px solid ${accent}50` : '1px solid rgba(209,250,229,0.55)',
        boxShadow: hovered
          ? `0 20px 48px ${accent}18, 0 4px 16px rgba(0,0,0,0.04)`
          : '0 4px 20px rgba(16,185,129,0.05), 0 1px 4px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ambient corner glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500"
        style={{ background: accent, opacity: hovered ? 0.12 : 0.05 }} />
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}90, transparent)`, opacity: hovered ? 1 : 0 }} />

      <div className="relative flex items-start justify-between mb-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: gradient,
            border: `1px solid ${accent}30`,
            boxShadow: `0 6px 20px ${accent}25`,
          }}>
          {icon}
        </div>
        {/* Delta chip */}
        {delta && (
          <div title={deltaTitle} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium"
            style={{
              background: delta.positive ? 'rgba(240,253,250,0.9)' : 'rgba(254,242,242,0.9)',
              border: delta.positive ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(252,165,165,0.3)',
              color: delta.positive ? 'rgb(5,150,105)' : 'rgb(220,38,38)',
            }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d={delta.positive ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
            </svg>
            {delta.value}
          </div>
        )}
      </div>

      <div className="relative">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.16em] mb-1.5">{label}</p>
        <p className="text-3xl font-extralight text-gray-900 tracking-[-0.03em] leading-none">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 font-light mt-1.5">{sub}</p>}
      </div>
    </div>
  );
};

// ── Animated Bar ─────────────────────────────────────────────────────────────
const AnimatedBar = ({
  height, color, delay = 0, value, month, maxVal, isActive, onHover,
}: {
  height: number; color: string; delay?: number; value: number;
  month: string; maxVal: number; isActive: boolean; onHover: (v: boolean) => void;
}) => {
  const [rendered, setRendered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRendered(true), delay); return () => clearTimeout(t); }, [delay]);

  const rgb = color.match(/\d+/g);
  const [r, g, b] = rgb ? rgb.map(Number) : [52, 211, 153];

  return (
    <div className="flex-1 flex flex-col items-center gap-2 group/bar cursor-pointer"
      onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      {/* Tooltip */}
      <div className={`transition-all duration-300 text-center ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <div className="px-2 py-1 rounded-lg text-[10px] font-light whitespace-nowrap"
          style={{ background: 'rgba(17,24,39,0.85)', color: 'white', backdropFilter: 'blur(8px)' }}>
          TK {Math.round(value).toLocaleString()}
        </div>
      </div>
      {/* Bar */}
      <div className="relative w-full flex flex-col justify-end" style={{ height: '180px' }}>
        <div
          className="w-full rounded-t-xl relative overflow-hidden transition-all duration-700 ease-out"
          style={{
            height: rendered ? `${Math.max(6, height)}px` : '4px',
            background: isActive
              ? `linear-gradient(180deg, rgba(${r},${g},${b},1) 0%, rgba(${r},${g},${b},0.8) 100%)`
              : `linear-gradient(180deg, rgba(${r},${g},${b},0.73) 0%, rgba(${r},${g},${b},0.53) 100%)`,
            boxShadow: isActive ? `0 -4px 20px rgba(${r},${g},${b},0.25)` : 'none',
            transitionDelay: `${delay}ms`,
          }}>
          {/* Gloss */}
          <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25), transparent)' }} />
          {/* Shimmer on hover */}
          {isActive && (
            <div className="absolute inset-0 animate-pulse"
              style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.15), transparent)` }} />
          )}
        </div>
      </div>
      <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">{month}</span>
    </div>
  );
};

// ── Donut Ring ───────────────────────────────────────────────────────────────
const DonutRing = ({ data }: { data: { category: string; count: number }[] }) => {
  const total = data.reduce((s, d) => s + d.count, 0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const size = 160;
  const radius = 58;
  const stroke = 20;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((d, i) => {
    const pct  = d.count / total;
    const dash = pct * circumference;
    const pal = CATEGORY_PALETTE[i % CATEGORY_PALETTE.length];
    const rgb = pal.bg.match(/\d+/g);
    const [r, g, b] = rgb ? rgb.map(Number) : [52, 211, 153];
    const seg  = { pct, dash, offset, color: pal.bg, rgba: (alpha: number) => `rgba(${r},${g},${b},${alpha})` };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-6">
      {/* SVG Donut */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Track */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(229,231,235,0.5)" strokeWidth={stroke} />
          {/* Segments */}
          {segments.map((seg, i) => (
            <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
              stroke={hoveredIdx === i ? seg.color : seg.rgba(0.8)}
              strokeWidth={hoveredIdx === i ? stroke + 4 : stroke}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ filter: hoveredIdx === i ? `drop-shadow(0 0 6px ${seg.rgba(0.5)})` : 'none' }}
            />
          ))}
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hoveredIdx !== null ? (
            <>
              <p className="text-lg font-extralight text-gray-800">{data[hoveredIdx].count}</p>
              <p className="text-[9px] text-gray-400 font-light uppercase tracking-wider truncate max-w-[60px] text-center">{data[hoveredIdx].category}</p>
            </>
          ) : (
            <>
              <p className="text-xl font-extralight text-gray-800">{total}</p>
              <p className="text-[9px] text-gray-400 font-light uppercase tracking-wider">Total</p>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5 min-w-0">
        {data.map((d, i) => {
          const pal = CATEGORY_PALETTE[i % CATEGORY_PALETTE.length];
          return (
            <div key={i}
              className="flex items-center gap-2.5 cursor-pointer transition-all duration-200"
              style={{ opacity: hoveredIdx === null || hoveredIdx === i ? 1 : 0.4 }}
              onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pal.bg }} />
              <span className="text-xs font-light text-gray-600 truncate max-w-[100px]">{d.category}</span>
              <span className="text-xs font-medium text-gray-800 ml-auto flex-shrink-0">{d.count}</span>
              <span className="text-[10px] text-gray-400 font-light flex-shrink-0">
                {((d.count / total) * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Horizontal Progress Bar ───────────────────────────────────────────────────
const ProgressBar = ({
  label, value, max, color, light, border, pct, animated,
}: {
  label: string; value: number; max: number; color: string;
  light: string; border: string; pct: string; animated: boolean;
}) => {
  const [width, setWidth] = useState(0);
  useEffect(() => { if (animated) { const t = setTimeout(() => setWidth(Number(pct)), 100); return () => clearTimeout(t); } }, [animated, pct]);

  const rgb = color.match(/\d+/g);
  const [r, g, b] = rgb ? rgb.map(Number) : [156, 163, 175];

  return (
    <div className="group/bar cursor-default">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-xs font-light text-gray-600 capitalize">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400 font-light tabular-nums">{value} orders</span>
          <span className="text-xs font-medium text-gray-700 tabular-nums w-10 text-right">{pct}%</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(243,244,246,0.8)' }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{ width: `${width}%`, background: `linear-gradient(90deg, rgba(${r},${g},${b},0.8), ${color})`, boxShadow: `0 0 8px rgba(${r},${g},${b},0.25)` }}>
          {/* Gloss */}
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.30), transparent)' }} />
        </div>
      </div>
    </div>
  );
};

// ── Top Plant Row ─────────────────────────────────────────────────────────────
const TopPlantRow = ({
  rank, name, sales, maxSales, index,
}: {
  rank: number; name: string; sales: number; maxSales: number; index: number;
}) => {
  const [width, setWidth]   = useState(0);
  const [hovered, setHovered] = useState(false);
  const pct = (sales / maxSales) * 100;
  const rankColors = [
    'linear-gradient(135deg, rgb(251,191,36), rgb(245,158,11))',
    'linear-gradient(135deg, rgb(156,163,175), rgb(107,114,128))',
    'linear-gradient(135deg, rgb(180,130,80), rgb(146,104,60))',
  ];

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 200 + index * 100);
    return () => clearTimeout(t);
  }, [pct, index]);

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 cursor-default"
      style={{ background: hovered ? 'rgba(240,253,250,0.6)' : 'transparent', transform: hovered ? 'translateX(3px)' : 'none' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      {/* Rank badge */}
      <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-semibold flex-shrink-0 text-white"
        style={{ background: rank <= 3 ? rankColors[rank - 1] : 'rgba(209,213,219,0.8)', color: rank <= 3 ? 'white' : 'rgb(107,114,128)' }}>
        {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : rank}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-light text-gray-700 truncate mb-1.5"
          style={{ color: hovered ? 'rgb(5,150,105)' : 'rgb(55,65,81)' }}>
          {name}
        </p>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(229,231,235,0.6)' }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${width}%`,
              background: 'linear-gradient(90deg, rgb(52,211,153), rgb(16,185,129))',
              boxShadow: hovered ? '0 0 8px rgba(52,211,153,0.4)' : 'none',
            }} />
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <span className="text-sm font-light tabular-nums" style={{ color: hovered ? 'rgb(5,150,105)' : 'rgb(107,114,128)' }}>
          {sales}
        </span>
        <p className="text-[10px] text-gray-300 font-light">units</p>
      </div>
    </div>
  );
};

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [user, setUser]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const [revenueMode, setRevenueMode] = useState<'total' | 'delivered'>('total');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    if (u.role !== 'admin') { router.push('/'); return; }
    fetchAnalytics();
  }, [router]);

  useEffect(() => {
    if (!loading) setTimeout(() => setBarsVisible(true), 300);
  }, [loading]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [plantsRes, ordersRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`),
      ]);
      const plants = await plantsRes.json();
      const orders = await ordersRes.json();
      const users  = await usersRes.json();

      const totalRevenue   = orders.reduce((s: number, o: any) => s + Number(o.total_price), 0);
      const deliveredRevenue = orders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + Number(o.total_price), 0);
      const totalOrders    = orders.length;
      const totalCustomers = users.filter((u: any) => u.role === 'customer').length;
      const totalProducts  = plants.length;

      const categoryMap = new Map<string, number>();
      plants.forEach((p: any) => categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1));
      const categoryDistribution = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

      const statusMap = new Map<string, number>();
      orders.forEach((o: any) => statusMap.set(o.status, (statusMap.get(o.status) || 0) + 1));
      const orderStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

      const monthlyRevenue = Array(12).fill(0);
      orders.forEach((o: any) => {
        const m = new Date(o.created_at).getMonth();
        monthlyRevenue[m] += Number(o.total_price);
      });

      const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const revenueByMonth = MONTHS.map((month, i) => ({ month, revenue: monthlyRevenue[i] }));

      const deliveredMonthlyRevenue = Array(12).fill(0);
      orders.filter((o: any) => o.status === 'delivered').forEach((o: any) => {
        const m = new Date(o.created_at).getMonth();
        deliveredMonthlyRevenue[m] += Number(o.total_price);
      });

      // Top selling plants — use the `sold` field directly from the plants table
      const topSellingPlants = plants
        .map((p: any) => ({ name: p.name, sales: p.sold || 0 }))
        .sort((a: { name: string; sales: number }, b: { name: string; sales: number }) => b.sales - a.sales)
        .slice(0, 5);

      setAnalytics({ totalRevenue, deliveredRevenue, totalOrders, totalCustomers, totalProducts, monthlyRevenue, deliveredMonthlyRevenue, categoryDistribution, topSellingPlants, orderStatus, revenueByMonth });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/'); };

  // ── Loading ──────────────────────────────────────────────────────────────
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
        <div className="text-center">
          <p className="text-sm font-light text-gray-400 uppercase tracking-[0.2em] animate-pulse">Loading Analytics</p>
          <p className="text-xs text-gray-300 font-light mt-1">Crunching your data…</p>
        </div>
      </div>
    </div>
  );

  if (!analytics) return (
    <div className="flex flex-col min-h-screen font-['Inter',sans-serif]"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f9fffe 40%, #f0faf5 70%, #ffffff 100%)' }}>
      <Header user={user} onLogout={handleLogout} />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-red-400 font-light">Failed to load analytics data</p>
      </div>
    </div>
  );

  const maxRevenue       = Math.max(...analytics.revenueByMonth.map(r => r.revenue), 1);
  const totalStatusCount = analytics.orderStatus.reduce((s, o) => s + o.count, 0);
  const avgOrderValue    = analytics.totalOrders > 0 ? Math.round(analytics.totalRevenue / analytics.totalOrders) : 0;
  const deliveredRevenue = typeof analytics.deliveredRevenue === 'number' && !isNaN(analytics.deliveredRevenue) ? analytics.deliveredRevenue : 0;

  // Real deltas: compare current month vs previous month
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const prevMonthIdx    = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
  const currentMonthRev = analytics.revenueByMonth[currentMonthIdx]?.revenue || 0;
  const prevMonthRev    = analytics.revenueByMonth[prevMonthIdx]?.revenue || 0;
  const revenueDelta    = prevMonthRev > 0 ? ((currentMonthRev - prevMonthRev) / prevMonthRev * 100).toFixed(1) : '0.0';
  const revenueDeltaPos = Number(revenueDelta) >= 0;

  const filteredRevenue = analytics.revenueByMonth.map((r, i) => ({
    ...r,
    revenue: revenueMode === 'delivered' ? (analytics.deliveredMonthlyRevenue[i] || 0) : r.revenue,
  }));
  const filteredMaxRevenue = Math.max(...filteredRevenue.map(r => r.revenue), 1);
  const chartColor = revenueMode === 'delivered' ? 'rgb(96,165,250)' : 'rgb(52,211,153)';

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

      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 relative max-w-[1400px] mx-auto w-full px-5 sm:px-8 lg:px-14 py-12" style={{ zIndex: 10 }}>

        {/* ── Hero Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, rgba(209,250,229,0.6), rgba(167,243,208,0.3))', border: '1px solid rgba(110,231,183,0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-[0.18em]">Analytics & Insights</span>
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
                  Analytics
                  <span className="font-light" style={{ color: 'rgb(16,185,129)' }}> Dashboard</span>
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-px w-20 rounded-full" style={{ background: 'linear-gradient(90deg, rgb(16,185,129), transparent)' }} />
                  <div className="w-1 h-1 rounded-full bg-emerald-300" />
                  <div className="h-px w-10 rounded-full bg-emerald-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Time Range + Back */}
          <div className="flex items-center gap-3">
            {/* Back to Admin */}
            <button onClick={() => router.push('/admin')}
              className="group flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-light transition-all duration-300 hover:scale-[1.02]"
              style={{ background: 'white', border: '1px solid rgba(209,250,229,0.8)', color: 'rgb(107,114,128)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(110,231,183,0.5)'; (e.currentTarget as HTMLElement).style.color = 'rgb(5,150,105)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(209,250,229,0.8)'; (e.currentTarget as HTMLElement).style.color = 'rgb(107,114,128)'; }}>
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </button>

            {/* Refresh */}
            <button onClick={fetchAnalytics}
              className="group w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.05]"
              style={{ background: 'white', border: '1px solid rgba(209,250,229,0.8)', color: 'rgb(107,114,128)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(110,231,183,0.5)'; (e.currentTarget as HTMLElement).style.color = 'rgb(5,150,105)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(209,250,229,0.8)'; (e.currentTarget as HTMLElement).style.color = 'rgb(107,114,128)'; }}>
              <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <MetricCard
            label="Total Revenue"
            value={analytics.totalRevenue >= 1000 ? `TK ${(analytics.totalRevenue / 1000).toFixed(1)}K` : `TK ${analytics.totalRevenue}`}
            sub={
              <span>TK {Math.round(analytics.totalRevenue).toLocaleString()} total ·<br />TK {Math.round(deliveredRevenue).toLocaleString()} delivered</span>
            }
            delta={{ value: `${revenueDelta}%`, positive: revenueDeltaPos }}
            deltaTitle="Current month revenue vs previous month"
            accent="rgb(52,211,153)"
            gradient="linear-gradient(145deg, rgb(52,211,153), rgb(16,185,129))"
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <MetricCard
            label="Total Orders"
            value={analytics.totalOrders}
            sub={`${analytics.orderStatus.find(s => s.status === 'pending')?.count || 0} pending`}
            accent="rgb(96,165,250)"
            gradient="linear-gradient(145deg, rgb(96,165,250), rgb(59,130,246))"
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <MetricCard
            label="Customers"
            value={analytics.totalCustomers}
            sub={`${analytics.totalCustomers} registered`}
            accent="rgb(167,139,250)"
            gradient="linear-gradient(145deg, rgb(167,139,250), rgb(139,92,246))"
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <MetricCard
            label="Products"
            value={analytics.totalProducts}
            sub={`Avg TK ${avgOrderValue.toLocaleString()}/order`}
            accent="rgb(251,191,36)"
            gradient="linear-gradient(145deg, rgb(251,191,36), rgb(245,158,11))"
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
          />
        </div>

        {/* ── Charts Row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Revenue Bar Chart — takes 2 cols */}
          <Card className="lg:col-span-2">
            <div className="px-7 pt-6 pb-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(209,250,229,0.8)', border: '1px solid rgba(110,231,183,0.3)' }}>
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700 tracking-[-0.01em]">Monthly Revenue</h3>
                  </div>
                  <div className="flex items-center gap-2 ml-11 mt-1.5">
                    <button onClick={() => setRevenueMode('total')}
                      className="px-3 py-1 rounded-lg text-[10px] font-medium transition-all duration-300"
                      style={{
                        background: revenueMode === 'total' ? 'rgb(52,211,153)' : 'rgba(229,231,235,0.5)',
                        color: revenueMode === 'total' ? 'white' : 'rgb(156,163,175)',
                      }}>Total</button>
                    <button onClick={() => setRevenueMode('delivered')}
                      className="px-3 py-1 rounded-lg text-[10px] font-medium transition-all duration-300"
                      style={{
                        background: revenueMode === 'delivered' ? 'rgb(96,165,250)' : 'rgba(229,231,235,0.5)',
                        color: revenueMode === 'delivered' ? 'white' : 'rgb(156,163,175)',
                      }}>Delivered</button>
                  </div>
                  <p className="text-xs text-gray-400 font-light ml-11">{revenueMode === 'delivered' ? 'Delivered orders only' : 'All orders'}</p>
                </div>
                {/* Max label */}
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Peak Month</p>
                  <p className="text-sm font-light text-emerald-600">
                    TK {Math.round(filteredMaxRevenue).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Y-axis grid lines */}
              <div className="relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                  {[100, 75, 50, 25, 0].map(pct => (
                    <div key={pct} className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-300 font-light w-8 text-right flex-shrink-0">
                        {pct > 0 ? `${Math.round((filteredMaxRevenue * pct) / 100 / 1000)}K` : '0'}
                      </span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(229,231,235,0.5)' }} />
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-1.5 pl-10 pb-0" style={{ height: '220px' }}>
                  {filteredRevenue.map((item, idx) => (
                    <AnimatedBar
                      key={idx}
                      height={(item.revenue / filteredMaxRevenue) * 180}
                      color={chartColor}
                      delay={idx * 60}
                      value={item.revenue}
                      month={item.month}
                      maxVal={filteredMaxRevenue}
                      isActive={activeBar === idx}
                      onHover={v => setActiveBar(v ? idx : null)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Category Donut */}
          <Card>
            <div className="px-6 pt-6 pb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(209,250,229,0.8)', border: '1px solid rgba(110,231,183,0.3)' }}>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Category Split</h3>
                  <p className="text-[11px] text-gray-400 font-light">Products by category</p>
                </div>
              </div>
              {analytics.categoryDistribution.length > 0 ? (
                <DonutRing data={analytics.categoryDistribution} />
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-xs text-gray-300 font-light">No category data</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Charts Row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Order Status */}
          <Card>
            <div className="px-7 pt-6 pb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(209,250,229,0.8)', border: '1px solid rgba(110,231,183,0.3)' }}>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Order Status</h3>
                  <p className="text-[11px] text-gray-400 font-light">{totalStatusCount} total orders</p>
                </div>
              </div>
              <div className="space-y-4">
                {analytics.orderStatus.map((item, idx) => {
                  const cfg = ORDER_STATUS_CFG[item.status] || { color: 'rgb(156,163,175)', light: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.3)', dot: 'rgb(156,163,175)', label: item.status };
                  const pct = ((item.count / totalStatusCount) * 100).toFixed(1);
                  return (
                    <ProgressBar key={idx} label={cfg.label} value={item.count}
                      max={totalStatusCount} color={cfg.color} light={cfg.light}
                      border={cfg.border} pct={pct} animated={barsVisible} />
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Top Selling Plants */}
          <Card>
            <div className="px-7 pt-6 pb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(209,250,229,0.8)', border: '1px solid rgba(110,231,183,0.3)' }}>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Top 5 Selling Plants</h3>
                  <p className="text-[11px] text-gray-400 font-light">Ranked by units sold</p>
                </div>
              </div>
              {analytics.topSellingPlants.length > 0 ? (
                <div className="space-y-1">
                  {analytics.topSellingPlants.map((plant, idx) => (
                    <TopPlantRow
                      key={idx} rank={idx + 1} name={plant.name}
                      sales={plant.sales} maxSales={analytics.topSellingPlants[0].sales} index={idx}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-xs text-gray-300 font-light">No sales data available</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Quick Stats ── */}
        <Card>
          <div className="px-7 pt-6 pb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(209,250,229,0.8)', border: '1px solid rgba(110,231,183,0.3)' }}>
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Quick Performance Metrics</h3>
                <p className="text-[11px] text-gray-400 font-light">Derived insights from your data</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  label: 'Products Per Order',
                  value: analytics.totalOrders > 0
                    ? (analytics.totalProducts / analytics.totalOrders).toFixed(1)
                    : '0.0',
                  sub: 'avg line items',
                  accent: 'rgb(96,165,250)',
                  light: 'rgba(239,246,255,0.8)',
                  icon: '📦',
                },
                {
                  label: 'Avg Order Value',
                  value: `TK ${avgOrderValue.toLocaleString()}`,
                  sub: 'avg line items',
                  accent: 'rgb(96,165,250)',
                  light: 'rgba(239,246,255,0.8)',
                  icon: '📦',
                },
              ].map(m => (
                <div key={m.label}
                  className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-default"
                  style={{ background: m.light, border: `1px solid ${m.accent}20` }}>
                  <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full blur-xl opacity-20"
                    style={{ background: m.accent }} />
                  <div className="text-2xl mb-3">{m.icon}</div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-1">{m.label}</p>
                  <p className="text-2xl font-extralight tracking-[-0.02em]" style={{ color: m.accent }}>{m.value}</p>
                  <p className="text-[11px] text-gray-400 font-light mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Footer Trust Bar ── */}
        <div className="mt-16 pt-10 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: '📊', label: 'Live Analytics', sub: 'Real-time data sync' },
              { icon: '🔒', label: 'Admin Only', sub: 'Role-protected access' },
              { icon: '💡', label: 'Smart Insights', sub: 'Automated calculations' },
              { icon: '🌿', label: 'Plant Intelligence', sub: 'Sales performance' },
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
    </div>
  );
}