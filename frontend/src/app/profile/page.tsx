'use client';

// ============================================================
// PROFILE PAGE — '/profile'
// Account settings, order history, wishlist, inbox, plants
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: string;
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
  items?: OrderItem[];
}

interface PlantActivity {
  id: number;
  plant_id: number;
  plant_name?: string;
  category?: string;
  price?: number;
  action: string;
  details: string;
  created_at: string;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  type Section = 'account' | 'orders' | 'plants' | 'password' | 'wishlist' | 'inbox';

  const [activeSection, setActiveSection] = useState<Section>('account');
  const [orders, setOrders] = useState<Order[]>([]);
  const [plantActivities, setPlantActivities] = useState<PlantActivity[]>([]);
  const [purchasedPlants, setPurchasedPlants] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [wishlistPlants, setWishlistPlants] = useState<any[]>([]);
  const [plantSort, setPlantSort] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('date-desc');
  const [selectedPlant, setSelectedPlant] = useState<any | null>(null);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      pending:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pending' },
      processing: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400',    label: 'Processing' },
      shipped:    { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400',  label: 'Shipped' },
      delivered:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Delivered' },
      cancelled:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400',     label: 'Cancelled' },
      available:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Available' },
      limited:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Limited' },
      rare:       { bg: 'bg-pink-50',    text: 'text-pink-700',    dot: 'bg-pink-400',    label: 'Rare' },
    };
    return configs[status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: status };
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = getStatusConfig(status);
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { router.push('/login'); return; }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setFormData({ name: userData.name, email: userData.email, phone: userData.phone, address: userData.address || '' });
    if (userData.role === 'customer') {
      fetchOrders(userData.id);
      fetchPurchasedPlants(userData.id);
      fetchWishlist(userData.id);
      fetchInbox(userData.id);
    } else {
      fetchPlantActivities();
    }
    fetchPlants();
  }, [router]);

  useEffect(() => {
    if (activeSection === 'plants' && user?.role === 'specialist') {
      fetchPlantActivities();
    }
  }, [activeSection, user?.role]);

  const fetchPurchasedPlants = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`);
      const orders = await res.json();
      const userOrders = orders.filter((o: any) => o.user_id === userId && o.status !== 'cancelled');
      const plantsWithStatus: any[] = [];
      userOrders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          plantsWithStatus.push({ ...item, order_id: order.id, order_status: order.status, created_at: order.created_at });
        });
      });
      const plantsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`);
      const allPlants = await plantsRes.json();
      const purchased = plantsWithStatus
        .map((item: any) => {
          const plant = allPlants.find((p: any) => p.id === item.plant_id);
          if (!plant) return null;
          return { ...plant, ...item, price: plant?.price || item.price, quantity: item.quantity, order_status: item.order_status, order_id: item.order_id, order_date: item.created_at };
        })
        .filter((p: any) => p !== null);
      setPurchasedPlants(purchased);
    } catch (error) { console.error('Failed to fetch purchased plants:', error); }
  };

  const fetchWishlist = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlists?user_id=${userId}`);
      const data = await res.json();
      setWishlistPlants(data);
    } catch (error) { console.error('Failed to fetch wishlist:', error); }
  };

  const fetchOrders = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`);
      const data = await res.json();
      setOrders(data.filter((o: Order) => o.user_id === userId));
    } catch (error) { console.error('Failed to fetch orders:', error); }
  };

  const fetchPlants = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`);
      setPlants(await res.json());
    } catch (error) { console.error('Failed to fetch plants:', error); }
  };

  const fetchInbox = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages?user_id=${userId}`);
      const data = await res.json();
      setInboxMessages(data);
      setUnreadCount(data.filter((m: { is_read: boolean }) => !m.is_read).length);
    } catch (error) { console.error('Failed to fetch inbox:', error); }
  };

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}/cancel`, { method: 'POST' });
      if (!res.ok) {
        const error = await res.json();
        alert(error.message || 'Failed to cancel order');
        return;
      }
      await fetchOrders(user!.id);
      await fetchInbox(user!.id);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) { console.error('Failed to cancel order:', error); alert('Failed to cancel order'); }
  };

  const fetchPlantActivities = async () => {
    if (!user?.id) return;
    try {
      const [plantRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plants`),
      ]);
      const allPlants = await plantRes.json();
      
      const specialistPlants = allPlants.filter((p: any) => p.specialist_id === user.id);
      
      const activities: PlantActivity[] = specialistPlants.map((plant: any) => {
        const created = new Date(plant.created_at);
        const updated = new Date(plant.updated_at);
        const isEdited = updated.getTime() - created.getTime() > 5000;
        
        return {
          id: plant.id, 
          plant_id: plant.id, 
          plant_name: plant.name, 
          category: plant.category,
          price: plant.price, 
          action: isEdited ? 'edited' : 'created',
          details: isEdited 
            ? `Updated: ${updated.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` 
            : `Created: ${created.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
          created_at: plant.updated_at || plant.created_at,
        };
      });
      
      setPlantActivities(activities);
    } catch (error) { 
      console.error('Failed to fetch plant activities:', error); 
    }
  };

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    setOrderItems(order.items || []);
    if (!order.items || order.items.length === 0) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`);
        const data = await res.json();
        const fullOrder = data.find((o: Order) => o.id === order.id);
        if (fullOrder?.items) setOrderItems(fullOrder.items);
      } catch (error) { console.error('Failed to fetch order details:', error); }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      const updatedUser: User = result.user;
      setEditing(false);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setFormData({ name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, address: updatedUser.address || '' });
    } catch { alert('Failed to update profile'); }
    setLoading(false);
  };

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/'); };

  // ─── Sidebar Nav Items ────────────────────────────────────────────────────
  const navItems: { key: Section; label: string; icon: React.ReactNode; roles?: string[] }[] = [
    {
      key: 'account', label: 'Account Settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      key: 'orders', label: 'Order History', roles: ['customer'],
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      key: 'wishlist', label: 'My Wishlist', roles: ['customer'],
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      key: 'plants', label: user?.role === 'specialist' ? 'Plant History' : 'My Plants',
      roles: ['customer', 'specialist'],
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      key: 'inbox', label: 'Inbox', roles: ['customer'],
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
    },
    {
      key: 'password', label: 'Change Password',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  const filteredNavItems = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role || '')
  );

  const sortedPlantActivities = [...plantActivities].sort((a, b) => {
    switch (plantSort) {
      case 'date-desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'date-asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name-asc': return (a.plant_name || '').localeCompare(b.plant_name || '');
      case 'name-desc': return (b.plant_name || '').localeCompare(a.plant_name || '');
      case 'price-asc': return (a.price || 0) - (b.price || 0);
      case 'price-desc': return (b.price || 0) - (a.price || 0);
      default: return 0;
    }
  });

  // ─── Input Component ────────────────────────────────────────────────────
  const PremiumInput = ({
    label, type = 'text', value, onChange, placeholder, readOnly = false, isTextarea = false,
  }: {
    label: string; type?: string; value: string; onChange?: (e: any) => void;
    placeholder?: string; readOnly?: boolean; isTextarea?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest">{label}</label>
      {isTextarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          readOnly={readOnly}
          className={`w-full px-5 py-3.5 bg-white border rounded-xl text-gray-800 placeholder-gray-300 text-sm font-light transition-all duration-300 resize-none ${
            readOnly
              ? 'border-gray-100 text-gray-600 cursor-default focus:outline-none'
              : 'border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
          }`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full px-5 py-3.5 bg-white border rounded-xl text-gray-800 placeholder-gray-300 text-sm font-light transition-all duration-300 ${
            readOnly
              ? 'border-gray-100 text-gray-600 cursor-default focus:outline-none'
              : 'border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
          }`}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white font-['Inter',sans-serif] antialiased">
      <Header user={user} onLogout={handleLogout} />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-12">
        <div className="flex gap-10">

          {/* ─── Premium Sidebar ───────────────────────────────────────────── */}
          <aside className="w-72 flex-shrink-0">
            <div className="sticky top-24">
              {/* User Card */}
              <div className="relative mb-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-emerald-100/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xl font-light shadow-lg shadow-emerald-500/25">
                        {user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 font-light truncate">{user?.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-full border border-emerald-100 capitalize">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {filteredNavItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-light transition-all duration-300 ${
                      activeSection === item.key
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-gray-600 hover:bg-white hover:text-emerald-700 hover:shadow-sm border border-transparent hover:border-emerald-100'
                    }`}
                  >
                    <span className={`transition-colors ${activeSection === item.key ? 'text-white' : 'text-emerald-500/60 group-hover:text-emerald-600'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {item.key === 'inbox' && unreadCount > 0 && (
                      <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        activeSection === item.key
                          ? 'bg-white/20 text-white'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {unreadCount}
                      </span>
                    )}
                    {activeSection === item.key && item.key !== 'inbox' && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="mt-4 w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-light text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </aside>

          {/* ─── Main Content ──────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* ── Account Settings ── */}
            {activeSection === 'account' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-extralight text-gray-900">Account Settings</h2>
                    <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent mt-3 rounded-full" />
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-light hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
                  <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                    <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                    <div className="p-8 space-y-6">
                      <PremiumInput
                        label="Full Name"
                        value={editing ? formData.name : (user?.name || '')}
                        onChange={editing ? (e) => setFormData({ ...formData, name: e.target.value }) : undefined}
                        readOnly={!editing}
                        placeholder="Your full name"
                      />
                      <PremiumInput
                        label="Email Address"
                        value={user?.email || ''}
                        readOnly
                      />
                      <PremiumInput
                        label="Phone Number"
                        type="tel"
                        value={editing ? formData.phone : (user?.phone || 'Not set')}
                        onChange={editing ? (e) => setFormData({ ...formData, phone: e.target.value }) : undefined}
                        readOnly={!editing}
                        placeholder="Your phone number"
                      />
                      {user?.role === 'customer' && (
                        <PremiumInput
                          label="Delivery Address"
                          value={editing ? formData.address : (user?.address || 'Not set')}
                          onChange={editing ? (e) => setFormData({ ...formData, address: e.target.value }) : undefined}
                          readOnly={!editing}
                          placeholder="Your delivery address"
                          isTextarea
                        />
                      )}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest">Account Role</label>
                        <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                          <span className="inline-flex items-center gap-2 text-sm text-gray-700 font-light capitalize">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      {editing && (
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-light hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => {
                              setEditing(false);
                              setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: user?.address || '' });
                            }}
                            className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-light hover:border-gray-300 transition-all duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Order History ── */}
            {activeSection === 'orders' && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-3xl font-extralight text-gray-900">Order History</h2>
                  <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent mt-3 rounded-full" />
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-light">No orders yet</p>
                    <Link href="/" className="mt-4 inline-block text-sm text-emerald-600 hover:text-emerald-700 font-light">
                      Start Shopping →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-200/60 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/3 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                                <StatusBadge status={order.status} />
                              </div>
                              <p className="text-xs text-gray-400 font-light">
                                {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xs text-gray-400 font-light mb-1">Total</p>
                              <p className="text-xl font-extralight text-gray-900">
                                TK.{Math.round(parseFloat(order.total_price)).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-light hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all duration-300 hover:shadow-sm"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Wishlist ── */}
            {activeSection === 'wishlist' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-extralight text-gray-900">My Wishlist</h2>
                    <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent mt-3 rounded-full" />
                  </div>
                  {wishlistPlants.length > 0 && (
                    <span className="text-sm text-gray-400 font-light">{wishlistPlants.length} plants</span>
                  )}
                </div>

                {wishlistPlants.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-light mb-2">Your wishlist is empty</p>
                    <p className="text-xs text-gray-300 font-light mb-6">Save your favorite plants for later</p>
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-light hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02]">
                      Browse Plants
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {wishlistPlants.map((plant) => (
                      <div
                        key={plant.id}
                        className="group relative bg-white rounded-3xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1"
                      >
                        {/* Ambient Hover Glow */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Image Section */}
                        <Link href={`/plant/${plant.id}`}>
                          <div className="relative h-52 bg-gradient-to-br from-white to-emerald-50 overflow-hidden">
                            {plant.thumbnail ? (
                              <img
                                src={plant.thumbnail?.startsWith('http') ? plant.thumbnail : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${plant.thumbnail}`}
                                alt={plant.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-6xl opacity-20">
                                🌿
                              </div>
                            )}

                            {/* Status Badge */}
                            {plant.status && (
                              <span className={`absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 text-[10px] font-medium rounded-full border shadow-sm ${
                                plant.status === 'available'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                  : plant.status === 'limited'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                                  : plant.status === 'rare'
                                  ? 'bg-pink-50 text-pink-600 border-pink-200/60'
                                  : 'bg-gray-50 text-gray-600 border-gray-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  plant.status === 'available' ? 'bg-emerald-400' :
                                  plant.status === 'limited' ? 'bg-amber-400' :
                                  plant.status === 'rare' ? 'bg-pink-400' : 'bg-gray-400'
                                }`} />
                                {plant.status.replace('_', ' ')}
                              </span>
                            )}

                            {/* Wishlist Heart - Always filled here since it's in wishlist */}
                            <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 flex items-center justify-center shadow-sm">
                              <svg className="w-5 h-5 text-rose-500 fill-rose-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
                          </div>
                        </Link>

                        {/* Content */}
                        <div className="p-5">
                          {/* Title & Scientific Name */}
                          <Link href={`/plant/${plant.id}`}>
                            <h3 className="text-base font-medium text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                              {plant.name}
                            </h3>
                            <p className="text-xs italic text-gray-400 mt-0.5">
                              {plant.scientific_name}
                            </p>
                          </Link>

                          {/* Rating & Stock */}
                          <div className="flex items-center gap-3 mt-3">
                            {plant.average_rating ? (
                              <div className="flex items-center gap-1">
                                <span className="text-amber-400 text-xs">★</span>
                                <span className="text-xs text-gray-600 font-medium">{Number(plant.average_rating).toFixed(1)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-300 text-xs">★</span>
                                <span className="text-xs text-gray-400">—</span>
                              </div>
                            )}
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                              Stock {plant.stock || 0}
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-gradient-to-r from-emerald-200/40 via-emerald-200/20 to-transparent my-4" />

                          {/* Price & Actions */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-400 font-light">Price</p>
                              <p className="text-2xl font-extralight text-gray-900">
                                TK.{Math.round(plant.price || 0).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Add to Cart */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  const cart = localStorage.getItem('cart');
                                  const items = cart ? JSON.parse(cart) : [];
                                  const existing = items.find((i: any) => i.id === plant.id);
                                  if (existing) existing.quantity += 1;
                                  else items.push({ id: plant.id, name: plant.name, price: plant.price, quantity: 1 });
                                  localStorage.setItem('cart', JSON.stringify(items));
                                  window.dispatchEvent(new Event('cartUpdated'));
                                }}
                                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-light rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Cart
                              </button>

                              {/* Remove */}
                              <button
                                onClick={async () => {
                                  try {
                                    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlists/${plant.id}?user_id=${user?.id}`, { method: 'DELETE' });
                                    setWishlistPlants(wishlistPlants.filter(p => p.id !== plant.id));
                                  } catch { console.error('Failed to remove from wishlist'); }
                                }}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all duration-300"
                                title="Remove from wishlist"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Plant History (Specialist) ── */}
            {activeSection === 'plants' && user?.role === 'specialist' && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-extralight text-gray-900">Plant History</h2>
                      <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent mt-3 rounded-full" />
                      <p className="text-sm text-gray-400 font-light mt-3">Create & edit history for your plants</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                        <div className="relative">
                          <select
                            value={plantSort}
                            onChange={(e) => setPlantSort(e.target.value as typeof plantSort)}
                            className="appearance-none w-48 pl-4 pr-10 py-2.5 bg-white border border-emerald-200/40 rounded-xl text-sm text-gray-700 font-light focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/30 transition-all duration-300 cursor-pointer"
                          >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="price-asc">Price (Low-High)</option>
                            <option value="price-desc">Price (High-Low)</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 font-light">{plantActivities.length} plants</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {plantActivities.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <span className="text-4xl opacity-30">🌱</span>
                    </div>
                    <p className="text-gray-400 font-light mb-4">No plants created yet</p>
                    <Link href="/plants/create" className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-light hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02]">
                      Create Your First Plant →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedPlantActivities.map((activity) => {
                      const actionConfig = activity.action === 'created' 
                        ? { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        : { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          )};
                      
                      return (
                        <Link key={activity.id} href={`/plants/edit/${activity.plant_id}`}>
                          <div className="group bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200/60 transition-all duration-300">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">{activity.plant_name}</p>
                                  <p className="text-xs text-gray-500 font-light">ID: {activity.plant_id} · {activity.category}</p>
                                  <p className="text-xs text-gray-400 font-light mt-0.5">TK.{activity.price}</p>
                                  <p className="text-xs text-gray-400 font-light mt-1">{activity.details}</p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${actionConfig.bg} ${actionConfig.text} text-xs font-medium rounded-full border ${actionConfig.border} capitalize`}>
                                {actionConfig.icon}
                                {activity.action}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── My Plants (Customer) ── */}
            {activeSection === 'plants' && user?.role === 'customer' && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-3xl font-extralight text-gray-900">My Plants</h2>
                  <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent mt-3 rounded-full" />
                  <p className="text-sm text-gray-400 font-light mt-3">Your plant orders and delivery status</p>
                </div>

                {purchasedPlants.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <span className="text-4xl opacity-30">🌿</span>
                    </div>
                    <p className="text-gray-400 font-light">No plants ordered yet</p>
                    <Link href="/" className="mt-4 inline-block text-sm text-emerald-600 hover:text-emerald-700 font-light">
                      Start Shopping →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {purchasedPlants.map((plant) => (
                      <button
                        key={`${plant.id}-${plant.order_id}`}
                        type="button"
                        onClick={() => setSelectedPlant(plant)}
                        className="group bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-emerald-200/60 transition-all duration-500 flex gap-5 text-left w-full"
                      >
                        <div className="w-24 h-24 rounded-xl bg-emerald-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {plant.thumbnail ? (
                            <img
                              src={plant.thumbnail?.startsWith('http') ? plant.thumbnail : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${plant.thumbnail}`}
                              alt={plant.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <span className="text-3xl opacity-30">🌿</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{plant.name}</h3>
                            <StatusBadge status={plant.order_status} />
                          </div>
                          <p className="text-xs text-gray-400 font-light">{plant.category}</p>
                          <p className="text-xs text-gray-400 italic font-light">{plant.scientific_name}</p>
                          <div className="flex items-end justify-between mt-3">
                            <div>
                              <p className="text-xs text-gray-400 font-light">Qty: {plant.quantity}</p>
                              <p className="text-xs text-gray-300 font-light">
                                {new Date(plant.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <p className="text-xl font-extralight text-gray-900">
                              TK.{typeof plant.price === 'number' ? Math.round(plant.price).toLocaleString() : Math.round(parseFloat(plant.price) || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Inbox ── */}
             {activeSection === 'inbox' && user?.role === 'customer' && (
               <div className="animate-fade-in">
                 <div className="mb-8">
                   <h2 className="text-3xl font-extralight text-gray-900">Inbox</h2>
                   <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent mt-3 rounded-full" />
                   <p className="text-sm text-gray-400 font-light mt-3">Your notifications and refund updates</p>
                 </div>

                 {inboxMessages.length === 0 ? (
                   <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
                     <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
                       <svg className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                       </svg>
                     </div>
                     <p className="text-gray-400 font-light">Your inbox is empty</p>
                     <p className="text-xs text-gray-300 font-light mt-2">Order cancellations and refund notifications will appear here</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {inboxMessages.map((message) => {
                       const refundAmount = message.refund_amount ? parseFloat(message.refund_amount) : 0;
                       return (
                         <div
                           key={message.id}
                           className={`group relative bg-white/80 backdrop-blur-sm border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
                             !message.is_read
                               ? 'border-emerald-200/60 border-l-4 border-l-emerald-500'
                               : 'border-gray-200/60'
                           }`}
                         >
                           <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/3 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className="relative">
                             <div className="flex items-start justify-between gap-4 mb-3">
                               <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                   message.refund_amount ? 'bg-emerald-50' : 'bg-gray-50'
                                 }`}>
                                   {message.refund_amount ? (
                                     <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                     </svg>
                                   ) : (
                                     <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                     </svg>
                                   )}
                                 </div>
                                 <div>
                                   <div className="flex items-center gap-2 mb-0.5">
                                     <h3 className="text-sm font-medium text-gray-900">{message.title}</h3>
                                     {!message.is_read && (
                                       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">New</span>
                                     )}
                                   </div>
                                   <p className="text-xs text-gray-400 font-light">
                                     {new Date(message.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                   </p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 {refundAmount > 0 && (
                                   <div className="text-right">
                                     <p className="text-xs text-gray-400 font-light">Refund Amount</p>
                                     <p className="text-lg font-extralight text-emerald-600">
                                       TK.{refundAmount.toLocaleString()}
                                     </p>
                                   </div>
                                 )}
                                 <button
                                   onClick={async () => {
                                     try {
                                       await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/${message.id}`, { method: 'DELETE' });
                                       setInboxMessages(inboxMessages.filter(m => m.id !== message.id));
                                       setUnreadCount(inboxMessages.filter(m => !m.is_read).length - (message.is_read ? 0 : 1));
                                     } catch { console.error('Failed to delete message'); }
                                   }}
                                   className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                                   title="Delete message"
                                 >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                   </svg>
                                 </button>
                               </div>
                             </div>
                             <p className="text-sm text-gray-600 font-light leading-relaxed mb-4">{message.message}</p>
                             {message.refund_code && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                  </svg>
                                  <div>
                                    <p className="text-xs text-gray-400 font-light">Refund Code</p>
                                    <p className="text-sm font-mono font-medium text-gray-700">{message.refund_code}</p>
                                  </div>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(message.refund_code)}
                                    className="ml-auto px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-300"
                                  >
                                    Copy
                                  </button>
                                </div>
                              )}
                              {message.order && message.order.items && message.order.items.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Refunded Items</p>
                                  <div className="space-y-2">
                                    {message.order.items.map((item: { plant_id: number; quantity: number; price: string; plant?: { name: string; category: string } }) => {
                                      const plant = item.plant;
                                      const itemTotal = parseFloat(item.price) * item.quantity;
                                      return (
                                        <div key={item.plant_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                              <span className="text-sm">🌿</span>
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-gray-900">{plant?.name || `Plant #${item.plant_id}`}</p>
                                              <p className="text-[10px] text-gray-400">Qty: {item.quantity} × TK.{Math.round(parseFloat(item.price)).toLocaleString()}</p>
                                            </div>
                                          </div>
                                          <p className="text-xs font-medium text-gray-700">TK.{Math.round(itemTotal).toLocaleString()}</p>
                                        </div>
                                      );
                                    })}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                      <p className="text-xs font-medium text-gray-700">Total Refund</p>
                                      <p className="text-sm font-bold text-emerald-600">TK.{refundAmount.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>
             )}

             {/* ── Change Password ── */}
            {activeSection === 'password' && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-3xl font-extralight text-gray-900">Change Password</h2>
                  <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent mt-3 rounded-full" />
                </div>

                <div className="max-w-lg relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-xl" />
                  <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                    <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                    <div className="p-8 space-y-5">
                      <PremiumInput
                        label="Current Password"
                        type="password"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        placeholder="••••••••"
                      />
                      <PremiumInput
                        label="New Password"
                        type="password"
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        placeholder="••••••••"
                      />
                      <PremiumInput
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button
                        onClick={() => {
                          if (passwordData.new !== passwordData.confirm) { alert('Passwords do not match'); return; }
                          if (passwordData.new.length < 6) { alert('Password must be at least 6 characters'); return; }
                          alert('Password changed successfully!');
                          setPasswordData({ current: '', new: '', confirm: '' });
                        }}
                        className="w-full px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-light hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] mt-2"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ─── Premium Order Details Modal ────────────────────────────────── */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}
        >
          <div className="relative w-full max-w-lg animate-fade-in">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-3xl blur-2xl" />
            <div className="relative bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden max-h-[85vh] flex flex-col">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-light text-gray-900">Order #{selectedOrder.id}</h3>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <p className="text-xs text-gray-400 font-light">
                    {new Date(selectedOrder.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 px-8 py-6">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Order Items</p>
                {orderItems.length > 0 ? (
                  <div className="space-y-3">
                    {orderItems.map((item) => {
                      const plant = plants.find((p) => p.id === item.plant_id);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                              <span className="text-lg">🌿</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{plant?.name || `Plant #${item.plant_id}`}</p>
                              <p className="text-xs text-gray-400 font-light">
                                {plant?.category || 'N/A'} · Qty {item.quantity} × TK.{Math.round(Number(item.price))}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            TK.{Math.round(Number(item.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-400 font-light mt-3">Loading items...</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 font-light">Order Total</p>
                  <p className="text-2xl font-extralight text-gray-900">
                    TK.{Math.round(parseFloat(selectedOrder.total_price)).toLocaleString()}
                  </p>
                </div>
                {selectedOrder.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={async () => {
                        await cancelOrder(selectedOrder.id);
                      }}
                      className="w-full px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 hover:border-red-300 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 18.364L9 9.514m0 0L18.364 9.514M9 9.514L5.636 12.878M9 9.514l3.364 3.364" />
                      </svg>
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Plant Detail Modal ───────────────────────────────────────── */}
      {selectedPlant && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPlant(null); }}
        >
          <div className="relative w-full max-w-2xl animate-fade-in">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-3xl blur-2xl" />
            <div className="relative bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden max-h-[85vh] flex flex-col">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-light text-gray-900">{selectedPlant.name}</h3>
                  <p className="text-xs text-gray-400 font-light italic mt-1">{selectedPlant.scientific_name}</p>
                </div>
                <button
                  onClick={() => setSelectedPlant(null)}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 px-8 py-6">
                {/* Image */}
                <div className="w-full h-48 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 overflow-hidden">
                  {selectedPlant.thumbnail ? (
                    <img
                      src={selectedPlant.thumbnail?.startsWith('http') ? selectedPlant.thumbnail : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${selectedPlant.thumbnail}`}
                      alt={selectedPlant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl opacity-30">🌿</span>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Category</p>
                    <p className="text-sm font-medium text-gray-900">{selectedPlant.category || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Price</p>
                    <p className="text-sm font-medium text-gray-900">
                      TK.{typeof selectedPlant.price === 'number' ? Math.round(selectedPlant.price).toLocaleString() : Math.round(parseFloat(selectedPlant.price) || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Quantity</p>
                    <p className="text-sm font-medium text-gray-900">{selectedPlant.quantity}</p>
                  </div>
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <StatusBadge status={selectedPlant.order_status} />
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Order Details</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-light">Order Date</span>
                    <span className="text-sm text-gray-900">
                      {new Date(selectedPlant.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600 font-light">Order ID</span>
                    <span className="text-sm text-gray-900">#{selectedPlant.order_id}</span>
                  </div>
                </div>

                {/* Description */}
                {selectedPlant.description && (
                  <div className="mt-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm text-gray-600 font-light leading-relaxed">{selectedPlant.description}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setSelectedPlant(null)}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-300"
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