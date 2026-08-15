'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  Loader2,
  X,
  ShoppingBag,
  Home,
  Package,
  Sparkles,
  Mail,
  Percent,
  FileText,
  User,
  LogOut
} from 'lucide-react';
import { Order } from '@/data/mockData';
import { hasTrackingInfo } from '@/lib/orderStatus';
import { useStore } from '@/context/StoreContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminCompletedOrders() {
  const router = useRouter();
  const { logout } = useStore();

  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Verify Admin Auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (res.ok && data.authenticated && data.user.role === 'admin') {
          setAuthorized(true);
          setAdminUser(data.user);
          fetchCompletedOrders();
        } else {
          router.push('/login?redirect=/admin/orders/completed');
        }
      } catch (err) {
        console.error('Admin Auth check failed:', err);
        router.push('/login?redirect=/admin/orders/completed');
      }
    };
    checkAuth();
  }, [router]);

  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders?status_group=completed');
      const data = await res.json();
      if (res.ok && data.success) {
        setCompletedOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch completed orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = completedOrders
    .filter((o) => {
      if (!search.trim()) return true;
      const term = search.trim().toLowerCase();
      const matchId = o.id.toLowerCase().includes(term);
      const matchName = o.shipping_address?.fullName?.toLowerCase().includes(term);
      const matchEmail = o.shipping_address?.email?.toLowerCase().includes(term);
      return matchId || matchName || matchEmail;
    })
    .filter((o) => {
      if (dateFilter === 'all') return true;
      const d = new Date(o.delivered_at || o.updated_at || o.created_at);
      const now = new Date();
      if (dateFilter === 'today') {
        return d.toDateString() === now.toDateString();
      }
      if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      }
      if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return d >= monthAgo;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.delivered_at || a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.delivered_at || b.updated_at || b.created_at).getTime();
      if (sortOrder === 'newest') return dateB - dateA;
      if (sortOrder === 'oldest') return dateA - dateB;
      if (sortOrder === 'highest') return b.total - a.total;
      if (sortOrder === 'lowest') return a.total - b.total;
      return 0;
    });

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream text-brand-cocoa space-y-3 font-serif italic">
        <Loader2 className="animate-spin text-brand-rose" size={28} />
        <span>Verifying admin authorization... ♡</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream/20">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col md:flex-row gap-8">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col space-y-6">
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm space-y-4">
            {/* Sidebar User Header */}
            <div className="flex items-center space-x-3 pb-3 border-b border-brand-beige/50">
              <div className="p-2.5 bg-brand-rose/10 text-brand-rose rounded-full">
                <User size={18} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-brand-cocoa uppercase tracking-wider truncate">
                  {adminUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-brand-cocoa/60 font-medium truncate">
                  {adminUser?.email || 'admin@neeshiartique.com'}
                </p>
              </div>
            </div>

            {/* Sidebar Menu */}
            <nav className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Dashboard
                </span>
                <Link
                  href="/admin"
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <Home size={14} />
                  <span>Overview</span>
                </Link>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Store Management
                </span>
                <Link
                  href="/admin"
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <Package size={14} />
                  <span>Products</span>
                </Link>
                <Link
                  href="/admin"
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <ShoppingBag size={14} />
                  <span>Orders</span>
                </Link>
                <Link
                  href="/admin/orders/completed"
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold bg-brand-rose text-brand-cream shadow-sm"
                >
                  <CheckCircle2 size={14} />
                  <span>Completed Orders</span>
                </Link>
                <Link
                  href="/admin"
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <Sparkles size={14} />
                  <span>Custom Requests</span>
                </Link>
                <Link
                  href="/admin"
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <Mail size={14} />
                  <span>Messages</span>
                </Link>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Website Content
                </span>
                <Link
                  href="/admin/homepage"
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <FileText size={14} />
                  <span>Homepage</span>
                </Link>
                <Link
                  href="/admin/artist"
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <User size={14} />
                  <span>Artist Profile</span>
                </Link>
              </div>
            </nav>

            <div className="pt-2 border-t border-brand-beige/50">
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <section className="flex-1 space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-brand-beige/60 pb-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
                Completed Orders
              </h1>
              <p className="text-xs text-brand-cocoa/75 mt-1">
                Orders that have been successfully delivered to customers.
              </p>
            </div>
            <Link
              href="/admin"
              className="self-start sm:self-center text-xs font-bold text-brand-rose hover:text-brand-cocoa px-3.5 py-2 rounded border border-brand-rose/40 hover:border-brand-cocoa transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <ShoppingBag size={13} />
              <span>Back to Active Orders</span>
            </Link>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order ID, customer, email..."
                className="w-full bg-brand-cream border border-brand-beige rounded pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/50 font-medium"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-cocoa/40 hover:text-brand-cocoa"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <div className="flex items-center space-x-1.5">
                <Filter size={13} className="text-brand-cocoa/50" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="bg-brand-cream border border-brand-beige rounded py-1.5 px-2.5 text-xs text-brand-cocoa font-semibold focus:outline-none focus:border-brand-rose"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <ArrowUpDown size={13} className="text-brand-cocoa/50" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-brand-cream border border-brand-beige rounded py-1.5 px-2.5 text-xs text-brand-cocoa font-semibold focus:outline-none focus:border-brand-rose"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Value</option>
                  <option value="lowest">Lowest Value</option>
                </select>
              </div>
            </div>
          </div>

          {/* Completed Orders Table */}
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-brand-beige/35 border-b border-brand-beige/70 text-xs font-bold uppercase tracking-wider text-brand-cocoa/60">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Products</th>
                  <th className="p-4">Delivery Date</th>
                  <th className="p-4">Tracking Number</th>
                  <th className="p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/30">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-xs text-brand-cocoa/50 italic">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="animate-spin text-brand-rose" size={16} /> Loading completed orders...
                      </span>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-16 text-center text-xs text-brand-cocoa/70 space-y-2">
                      <div className="font-serif text-base font-bold text-brand-cocoa">No completed orders yet</div>
                      <p className="text-brand-cocoa/60">Delivered orders will appear here once they're completed.</p>
                      <div className="pt-3">
                        <Link
                          href="/admin"
                          className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-rose hover:text-brand-cocoa transition-colors"
                        >
                          <span>Go to Active Orders</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-brand-beige/10 align-top">
                      <td className="p-4 font-serif font-bold text-brand-cocoa whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(o.id)}`}
                          className="text-brand-rose hover:underline"
                        >
                          {o.id}
                        </Link>
                      </td>
                      <td className="p-4 text-xs font-semibold">
                        <div>{o.shipping_address.fullName}</div>
                        <div className="text-[10px] text-brand-cocoa/60 font-normal">{o.shipping_address.email}</div>
                      </td>
                      <td className="p-4 text-xs text-brand-cocoa/70 whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4 font-bold whitespace-nowrap">₹{o.total}</td>
                      <td className="p-4 text-xs max-w-[14rem]">
                        {o.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
                      </td>
                      <td className="p-4 text-xs text-brand-cocoa/80 whitespace-nowrap font-medium">
                        {o.delivered_at ? (
                          new Date(o.delivered_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : o.updated_at ? (
                          new Date(o.updated_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : (
                          'Delivered'
                        )}
                      </td>
                      <td className="p-4 text-xs whitespace-nowrap">
                        {hasTrackingInfo(o) ? (
                          <span className="text-emerald-700 font-medium">
                            {o.carrier}: {o.tracking_number}
                          </span>
                        ) : (
                          <span className="text-brand-cocoa/40 italic text-[11px]">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-sm text-[9px] uppercase font-bold tracking-wider whitespace-nowrap bg-emerald-100 text-emerald-800 border border-emerald-200">
                          DELIVERED
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(o.id)}`}
                          className="inline-flex items-center gap-1 border border-brand-beige bg-brand-cream hover:bg-brand-rose hover:text-brand-cream text-brand-cocoa transition-colors font-bold text-[10px] uppercase tracking-wider py-2 px-3 rounded whitespace-nowrap shadow-sm"
                        >
                          Details <ChevronRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
