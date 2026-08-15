'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Product, Order, CustomOrderRequest, Category, Coupon } from '@/data/mockData';
import {
  orderStatusLabel,
  paymentStatusLabel,
  isRevenueCounted,
  hasTrackingInfo,
} from '@/lib/orderStatus';
import {
  Package,
  ShoppingBag,
  MessageSquare,
  Percent,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Clock,
  Sparkles,
  Save,
  X,
  LogOut,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Mail,
  MessageCircle,
  AlertTriangle,
  User,
  Home,
  Menu,
  ChevronRight,
  Loader2,
  FileText
} from 'lucide-react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type AdminTab = 'overview' | 'products' | 'orders' | 'completed-orders' | 'custom' | 'messages' | 'coupons';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Completed Orders Search & Filter States
  const [completedSearch, setCompletedSearch] = useState('');
  const [completedDateFilter, setCompletedDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [completedSort, setCompletedSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Messages States
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesFilter, setMessagesFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [messagesSearch, setMessagesSearch] = useState('');
  const [messagesSort, setMessagesSort] = useState<'newest' | 'oldest'>('newest');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<any | null>(null);

  const {
    products,
    categories,
    orders,
    customOrders,
    coupons,
    addProduct,
    updateProduct,
    deleteProduct,
    loadingOrders,
    updateCustomOrderStatus,
    addCoupon,
    toggleCoupon,
    deleteCoupon,
    logout
  } = useStore();

  // Verification & Auth check (Secure Server-side Validation)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (res.ok && data.authenticated && data.user.role === 'admin') {
          setAuthorized(true);
          setAdminUser(data.user);
        } else {
          router.push('/login?redirect=/admin');
        }
      } catch (err) {
        console.error('Admin Auth check failed:', err);
        router.push('/login?redirect=/admin');
      }
    };
    checkAuth();
  }, [router]);

  // Fetch contact messages from backend API
  const fetchMessages = async () => {
    if (!authorized) return;
    try {
      setLoadingMessages(true);
      const query = new URLSearchParams({
        filter: messagesFilter,
        search: messagesSearch,
        sort: messagesSort
      });
      const res = await fetch(`/api/messages?${query.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Failed to fetch contact messages:', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchMessages();
    }
  }, [authorized, messagesFilter, messagesSearch, messagesSort]);

  // Form states: New Product
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(0);
  const [newProdCompare, setNewProdCompare] = useState('');
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.id || 'keychains');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('/images/butterfly_keychain.jpg');
  const [newProdCustomizable, setNewProdCustomizable] = useState(false);
  const [newProdFeatured, setNewProdFeatured] = useState(false);
  const [newProdBestseller, setNewProdBestseller] = useState(false);
  const [newProdNew, setNewProdNew] = useState(true);
  const [newProdAvailability, setNewProdAvailability] = useState<'available' | 'temporarily_unavailable' | 'discontinued'>('available');
  const [newProdMadeToOrder, setNewProdMadeToOrder] = useState(true);
  const [newProdPrepTime, setNewProdPrepTime] = useState('3–5 days');

  // Form states: Editing Product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states: New Coupon
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState('');

  // Handle Log out trigger
  const handleAdminLogout = async () => {
    await logout();
  };

  // Handle messages API operations
  const handleOpenMessage = async (msg: any) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      try {
        const res = await fetch(`/api/messages/${msg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'read' }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
          setSelectedMessage({ ...msg, status: 'read' });
        }
      } catch (e) {
        console.error('Failed to mark message read:', e);
      }
    }
  };

  const handleMarkMessageStatus = async (id: string, currentStatus: 'read' | 'unread') => {
    const nextStatus = currentStatus === 'read' ? 'unread' : 'read';
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus } : m));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({ ...selectedMessage, status: nextStatus });
        }
      }
    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
        setMessageToDelete(null);
      }
    } catch (e) {
      console.error('Failed to delete message:', e);
    }
  };

  // Product Add submit handler
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || newProdPrice <= 0 || !newProdDesc.trim()) return;

    const slug = newProdName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    addProduct({
      name: newProdName.trim(),
      slug,
      description: newProdDesc.trim(),
      short_description: newProdDesc.trim(),
      price: Number(newProdPrice),
      compare_at_price: newProdCompare ? Number(newProdCompare) : undefined,
      category_id: newProdCategory,
      stock: 99, // Kept internally for backwards compatibility, ignored in UI
      availability_status: newProdAvailability,
      made_to_order: newProdMadeToOrder,
      sku: `PROD-${Date.now().toString().slice(-6)}`,
      images: [newProdImage],
      materials: ['100% Organic Cotton Yarn'],
      care_instructions: ['Gently spot clean with damp cloth.'],
      customization_available: newProdCustomizable,
      personalization_options: newProdCustomizable ? ['Vibrant Multi-color', 'Soft Pastel Tone'] : undefined,
      preparation_time: newProdPrepTime,
      shipping_time: '3–5 days',
      featured: newProdFeatured,
      bestseller: newProdBestseller,
      new_product: newProdNew,
      status: 'active',
    });

    // Reset
    setNewProdName('');
    setNewProdPrice(0);
    setNewProdCompare('');
    setNewProdDesc('');
    setNewProdCustomizable(false);
    setNewProdAvailability('available');
    setNewProdMadeToOrder(true);
    setNewProdPrepTime('3–5 days');
    setShowAddProduct(false);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || newCouponValue <= 0) return;

    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      type: newCouponType,
      value: Number(newCouponValue),
      minSubtotal: newCouponMin ? Number(newCouponMin) : undefined,
      active: true,
    });

    setNewCouponCode('');
    setNewCouponMin('');
  };

  // Active vs Completed Orders Filtering
  const activeOrders = orders.filter((o) => o.order_status !== 'delivered' && o.order_status !== 'cancelled');
  const completedOrders = orders.filter((o) => o.order_status === 'delivered');

  // Metrics (Made-to-Order + manual payment model). Revenue only ever counts
  // orders whose payment the admin has actually verified (including delivered orders).
  const totalRevenue = orders.filter(isRevenueCounted).reduce((acc, o) => acc + o.total, 0);
  const awaitingPaymentCount = orders.filter((o) => o.payment_status === 'awaiting_payment').length;
  const pendingCraftingCount = orders.filter((o) => o.order_status === 'being_crafted').length;
  const newCustomRequestsCount = customOrders.filter((r) => r.status === 'new').length;
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;
  const activeProductsCount = products.filter(p => p.status === 'active' && p.availability_status !== 'discontinued').length;

  // Products & Production Metrics (Replaced Low Stock / Out of Stock)
  const totalProducts = products.length;
  const madeToOrderCount = products.filter((p) => p.made_to_order).length;
  const temporarilyUnavailableCount = products.filter((p) => p.availability_status === 'temporarily_unavailable').length;

  // Recent lists for overview dashboard (Active orders only)
  const recentOrders = [...activeOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const recentRequests = [...customOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const recentMessages = [...messages].slice(0, 5);

  // Filtered Completed Orders computation
  const filteredCompletedOrders = completedOrders
    .filter((o) => {
      if (!completedSearch.trim()) return true;
      const term = completedSearch.trim().toLowerCase();
      const matchId = o.id.toLowerCase().includes(term);
      const matchName = o.shipping_address?.fullName?.toLowerCase().includes(term);
      const matchEmail = o.shipping_address?.email?.toLowerCase().includes(term);
      return matchId || matchName || matchEmail;
    })
    .filter((o) => {
      if (completedDateFilter === 'all') return true;
      const d = new Date(o.delivered_at || o.updated_at || o.created_at);
      const now = new Date();
      if (completedDateFilter === 'today') {
        return d.toDateString() === now.toDateString();
      }
      if (completedDateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      }
      if (completedDateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return d >= monthAgo;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.delivered_at || a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.delivered_at || b.updated_at || b.created_at).getTime();
      if (completedSort === 'newest') return dateB - dateA;
      if (completedSort === 'oldest') return dateA - dateB;
      if (completedSort === 'highest') return b.total - a.total;
      if (completedSort === 'lowest') return a.total - b.total;
      return 0;
    });

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };


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
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
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

            {/* Sidebar Menu Groups */}
            <nav className="space-y-4">
              {/* Group 1: General */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Dashboard
                </span>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-brand-rose text-brand-cream shadow-sm'
                      : 'text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose'
                  }`}
                >
                  <Home size={14} />
                  <span>Overview</span>
                </button>
              </div>

              {/* Group 2: Store Manage */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Store Management
                </span>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all ${
                    activeTab === 'products'
                      ? 'bg-brand-rose text-brand-cream shadow-sm'
                      : 'text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose'
                  }`}
                >
                  <Package size={14} />
                  <span>Products</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between py-2 px-3 rounded text-xs font-bold transition-all ${
                    activeTab === 'orders'
                      ? 'bg-brand-rose text-brand-cream shadow-sm'
                      : 'text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <ShoppingBag size={14} />
                    <span>Orders</span>
                  </span>
                  {activeOrders.length > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'orders' ? 'bg-brand-cream text-brand-rose' : 'bg-brand-rose text-brand-cream'
                    }`}>{activeOrders.length}</span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('completed-orders')}
                  className={`w-full flex items-center justify-between py-2 px-3 rounded text-xs font-bold transition-all ${
                    activeTab === 'completed-orders'
                      ? 'bg-brand-rose text-brand-cream shadow-sm'
                      : 'text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <CheckCircle2 size={14} />
                    <span>Completed Orders</span>
                  </span>
                  {completedOrders.length > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'completed-orders' ? 'bg-brand-cream text-brand-rose' : 'bg-brand-beige text-brand-cocoa'
                    }`}>{completedOrders.length}</span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`w-full flex items-center justify-between py-2 px-3 rounded text-xs font-bold transition-all ${
                    activeTab === 'custom'
                      ? 'bg-brand-rose text-brand-cream shadow-sm'
                      : 'text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Sparkles size={14} />
                    <span>Custom Requests</span>
                  </span>
                  {newCustomRequestsCount > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'custom' ? 'bg-brand-cream text-brand-rose' : 'bg-brand-rose text-brand-cream'
                    }`}>{newCustomRequestsCount}</span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full flex items-center justify-between py-2 px-3 rounded text-xs font-bold transition-all ${
                    activeTab === 'messages'
                      ? 'bg-brand-rose text-brand-cream shadow-sm'
                      : 'text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Mail size={14} />
                    <span>Messages</span>
                  </span>
                  {unreadMessagesCount > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'messages' ? 'bg-brand-cream text-brand-rose' : 'bg-brand-rose text-brand-cream'
                    }`}>{unreadMessagesCount}</span>
                  )}
                </button>
              </div>

              {/* Group 3: Marketing */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Marketing
                </span>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all ${
                    activeTab === 'coupons'
                      ? 'bg-brand-rose text-brand-cream shadow-sm'
                      : 'text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose'
                  }`}
                >
                  <Percent size={14} />
                  <span>Coupons</span>
                </button>
              </div>

              {/* Group 4: Website Content */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Website Content
                </span>
                <button
                  onClick={() => router.push('/admin/homepage')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <FileText size={14} />
                  <span>Homepage</span>
                </button>
                <button
                  onClick={() => router.push('/admin/artist')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <User size={14} />
                  <span>Artist Profile</span>
                </button>
              </div>
            </nav>

            {/* Logout Action */}
            <div className="pt-3 border-t border-brand-beige/50">
              <button
                onClick={handleAdminLogout}
                className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>

          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <section className="flex-grow space-y-8 min-w-0">
          
          {/* HEADER GREETINGS CARD */}
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
                {getGreeting()}, Admin ♡
              </h2>
              <p className="text-xs text-brand-cocoa/75 mt-1">
                Here's what's happening with Neeshiartique today.
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 self-start sm:self-center">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cocoa/60">
                Security Gateway: Gated Edge
              </span>
            </div>
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-3.5 shadow-sm flex items-center space-x-3">
                  <div className="p-2 bg-brand-sage/10 text-brand-sage rounded-full"><DollarSign size={16} /></div>
                  <div>
                    <span className="text-[9px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Revenue</span>
                    <span className="text-base font-bold text-brand-cocoa">₹{totalRevenue}</span>
                  </div>
                </div>
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-3.5 shadow-sm flex items-center space-x-3">
                  <div className="p-2 bg-brand-rose/10 text-brand-rose rounded-full"><ShoppingBag size={16} /></div>
                  <div>
                    <span className="text-[9px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Active Orders</span>
                    <span className="text-base font-bold text-brand-cocoa">{activeOrders.length}</span>
                  </div>
                </div>
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-3.5 shadow-sm flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full"><CheckCircle2 size={16} /></div>
                  <div>
                    <span className="text-[9px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Completed</span>
                    <span className="text-base font-bold text-brand-cocoa">{completedOrders.length}</span>
                  </div>
                </div>
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-3.5 shadow-sm flex items-center space-x-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-full"><AlertTriangle size={16} /></div>
                  <div>
                    <span className="text-[9px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Awaiting Pay</span>
                    <span className="text-base font-bold text-brand-cocoa">{awaitingPaymentCount}</span>
                  </div>
                </div>
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-3.5 shadow-sm flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-full"><Clock size={16} /></div>
                  <div>
                    <span className="text-[9px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Crafting Queue</span>
                    <span className="text-base font-bold text-brand-cocoa">{pendingCraftingCount}</span>
                  </div>
                </div>
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-3.5 shadow-sm flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-full"><Sparkles size={16} /></div>
                  <div>
                    <span className="text-[9px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Requests</span>
                    <span className="text-base font-bold text-brand-cocoa">{newCustomRequestsCount}</span>
                  </div>
                </div>
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-3.5 shadow-sm flex items-center space-x-3">
                  <div className="p-2 bg-pink-100 text-pink-700 rounded-full"><Mail size={16} /></div>
                  <div>
                    <span className="text-[9px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Messages</span>
                    <span className="text-base font-bold text-brand-cocoa">{unreadMessagesCount}</span>
                  </div>
                </div>
              </div>

              {/* Grid 2: Recent Orders & Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Recent Orders List Preview */}
                <div className="lg:col-span-7 bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-brand-beige/50 pb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif text-base font-bold text-brand-cocoa">Active Recent Orders</h3>
                      {activeOrders.length > 0 && (
                        <span className="text-[10px] bg-brand-rose/10 text-brand-rose px-2 py-0.5 rounded-full font-bold">
                          {activeOrders.length} active
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-[10px] font-bold text-brand-rose hover:text-brand-cocoa uppercase tracking-wider flex items-center space-x-0.5 transition-colors"
                    >
                      <span>View Active Orders</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  <div className="divide-y divide-brand-beige/20 overflow-x-auto min-h-[220px] flex flex-col justify-center">
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8 space-y-2">
                        <p className="text-xs font-semibold text-brand-cocoa">No active orders right now.</p>
                        <p className="text-[11px] text-brand-cocoa/60">You're all caught up. New orders will appear here.</p>
                        <div className="pt-2">
                          <button
                            onClick={() => setActiveTab('completed-orders')}
                            className="text-xs font-bold text-brand-rose hover:text-brand-cocoa transition-colors inline-flex items-center space-x-1"
                          >
                            <span>View Completed Orders ({completedOrders.length})</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="text-brand-cocoa/50 border-b border-brand-beige/35">
                            <th className="pb-2 font-bold uppercase">Order ID</th>
                            <th className="pb-2 font-bold uppercase">Customer</th>
                            <th className="pb-2 font-bold uppercase">Amount</th>
                            <th className="pb-2 font-bold uppercase">Work Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-beige/20 font-medium">
                          {recentOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-brand-beige/5">
                              <td className="py-2.5 font-serif font-bold text-brand-rose">
                                <Link href={`/admin/orders/${encodeURIComponent(o.id)}`} className="hover:underline">
                                  {o.id}
                                </Link>
                              </td>
                              <td className="py-2.5 text-brand-cocoa">{o.shipping_address.fullName}</td>
                              <td className="py-2.5 font-bold">₹{o.total}</td>
                              <td className="py-2.5">
                                <span className="px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold bg-amber-100 text-amber-800">
                                  {orderStatusLabel(o.order_status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Recent Messages Inbox Preview */}
                <div className="lg:col-span-5 bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-brand-beige/50 pb-3">
                    <h3 className="font-serif text-base font-bold text-brand-cocoa">Recent Messages</h3>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="text-[10px] font-bold text-brand-rose hover:text-brand-cocoa uppercase tracking-wider flex items-center space-x-0.5 transition-colors"
                    >
                      <span>View All Messages</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  <div className="divide-y divide-brand-beige/25 overflow-y-auto space-y-3 min-h-[250px] pr-1">
                    {recentMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-brand-cocoa/50 italic py-10">
                        No messages yet. Customer inquiries will appear here when someone reaches out.
                      </div>
                    ) : (
                      recentMessages.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleOpenMessage(m)}
                          className="pt-2 hover:bg-brand-cream/30 cursor-pointer rounded p-2 transition-all space-y-1 relative"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-brand-cocoa block truncate max-w-[150px]">
                              {m.name}
                            </span>
                            <span className="text-[9px] text-brand-cocoa/40">
                              {new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-[11px] block truncate font-serif ${m.status === 'unread' ? 'font-bold text-brand-rose' : 'text-brand-cocoa/80'}`}>
                              {m.subject}
                            </span>
                            {m.status === 'unread' && (
                              <span className="w-1.5 h-1.5 bg-brand-rose rounded-full ring-2 ring-brand-rose/25" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Grid 3: Custom Requests & Products & Production Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Custom Requests Preview */}
                <div className="lg:col-span-8 bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-beige/50 pb-3">
                    <h3 className="font-serif text-base font-bold text-brand-cocoa">Custom Crochet Requests</h3>
                    <button
                      onClick={() => setActiveTab('custom')}
                      className="text-[10px] font-bold text-brand-rose hover:text-brand-cocoa uppercase tracking-wider flex items-center space-x-0.5 transition-colors"
                    >
                      <span>Review Custom Requests</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {recentRequests.length === 0 ? (
                      <div className="text-center py-10 text-xs text-brand-cocoa/50 italic">
                        No custom requests yet.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="text-brand-cocoa/50 border-b border-brand-beige/35">
                            <th className="pb-2 font-bold uppercase">Customer</th>
                            <th className="pb-2 font-bold uppercase">Product Type</th>
                            <th className="pb-2 font-bold uppercase">Required Date</th>
                            <th className="pb-2 font-bold uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-beige/20 font-medium">
                          {recentRequests.map((req) => {
                            const isUrgent = req.requiredDate && new Date(req.requiredDate).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 7;
                            return (
                              <tr key={req.id} className="hover:bg-brand-beige/5">
                                <td className="py-2.5 text-brand-cocoa">{req.name}</td>
                                <td className="py-2.5">{req.productType}</td>
                                <td className={`py-2.5 font-mono ${isUrgent && req.status !== 'completed' ? 'text-brand-rose font-bold' : ''}`}>
                                  {req.requiredDate || 'Flexible'} {isUrgent && req.status !== 'completed' && '⚠ Urgent'}
                                </td>
                                <td className="py-2.5">
                                  <span className={`px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold ${
                                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>{req.status}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Products & Production Overview Card (Replaced Low Stock / Out of Stock) */}
                <div className="lg:col-span-4 bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="border-b border-brand-beige/50 pb-3">
                    <h3 className="font-serif text-base font-bold text-brand-cocoa">Creations & Production</h3>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-cocoa/70 uppercase">Total Catalog Items</span>
                      <span className="font-serif text-lg font-bold text-brand-cocoa">{totalProducts}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-cocoa/70 uppercase flex items-center space-x-1.5">
                        <Sparkles size={13} className="text-brand-sage" />
                        <span>Handmade to Order</span>
                      </span>
                      <span className="text-sm font-bold text-brand-sage bg-brand-sage/5 px-2 py-0.5 rounded border border-brand-sage/20">{madeToOrderCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-cocoa/70 uppercase flex items-center space-x-1.5">
                        <AlertTriangle size={13} className="text-brand-rose" />
                        <span>Paused / Unavailable</span>
                      </span>
                      <span className="text-sm font-bold text-brand-rose bg-rose-50 px-2 py-0.5 rounded border border-brand-rose/20">{temporarilyUnavailableCount}</span>
                    </div>
                  </div>

                  <div className="border-t border-brand-beige/50 pt-4 grid grid-cols-2 gap-3 text-center text-[10px] font-bold uppercase tracking-wider">
                    <button
                      onClick={() => { setActiveTab('products'); setShowAddProduct(true); }}
                      className="bg-brand-rose text-brand-cream py-2 rounded shadow-sm hover:bg-brand-cocoa transition-colors"
                    >
                      Add Product
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="border border-brand-beige hover:bg-brand-beige/25 py-2 rounded text-brand-cocoa transition-colors"
                    >
                      Manage Catalog
                    </button>
                  </div>
                </div>

              </div>

              {/* Grid 4: Quick Actions panel */}
              <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-brand-cocoa">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-bold uppercase tracking-wider">
                  <button
                    onClick={() => { setActiveTab('products'); setShowAddProduct(true); }}
                    className="p-3 bg-brand-rose/5 border border-brand-rose/20 rounded hover:bg-brand-rose/10 text-brand-rose transition-all flex flex-col items-center justify-center space-y-1.5"
                  >
                    <Plus size={16} />
                    <span>Add Product</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="p-3 bg-brand-rose/5 border border-brand-rose/20 rounded hover:bg-brand-rose/10 text-brand-rose transition-all flex flex-col items-center justify-center space-y-1.5"
                  >
                    <ShoppingBag size={16} />
                    <span>View Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="p-3 bg-brand-rose/5 border border-brand-rose/20 rounded hover:bg-brand-rose/10 text-brand-rose transition-all flex flex-col items-center justify-center space-y-1.5"
                  >
                    <Mail size={16} />
                    <span>View Messages</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className="p-3 bg-brand-rose/5 border border-brand-rose/20 rounded hover:bg-brand-rose/10 text-brand-rose transition-all flex flex-col items-center justify-center space-y-1.5"
                  >
                    <Sparkles size={16} />
                    <span>Review Custom Requests</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-brand-cocoa">Manage Products</h3>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Add Product Modal Overlay */}
              {showAddProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-cocoa/30 backdrop-blur-sm animate-fade-in">
                  <div className="bg-brand-cream border border-brand-beige w-full max-w-2xl rounded-lg shadow-2xl overflow-y-auto max-h-[90vh] p-6 sm:p-8 animate-slide-up space-y-6">
                    <div className="flex justify-between items-center border-b border-brand-beige pb-3">
                      <h4 className="font-serif text-lg font-bold text-brand-cocoa">Add New Crochet Creation</h4>
                      <button onClick={() => setShowAddProduct(false)}><X size={20} /></button>
                    </div>
                    
                    <form onSubmit={handleAddProductSubmit} className="space-y-5 text-xs font-bold uppercase tracking-wider text-brand-cocoa">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5"><label className="block">Product Name *</label><input type="text" required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="e.g. Lavender Bow Keychain" className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-sm font-medium normal-case text-brand-cocoa" /></div>
                        <div className="space-y-1.5"><label className="block">Price (INR) *</label><input type="number" required value={newProdPrice || ''} onChange={(e) => setNewProdPrice(Number(e.target.value))} placeholder="e.g. 299" className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-sm font-medium text-brand-cocoa" /></div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5"><label className="block">Compare-at Price (Optional)</label><input type="number" value={newProdCompare} onChange={(e) => setNewProdCompare(e.target.value)} placeholder="e.g. 349" className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-sm font-medium text-brand-cocoa" /></div>
                        <div className="space-y-1.5"><label className="block">Category</label><select value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-xs font-bold text-brand-cocoa">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div className="space-y-1.5"><label className="block">Preparation Time *</label><input type="text" required value={newProdPrepTime} onChange={(e) => setNewProdPrepTime(e.target.value)} placeholder="e.g. 3–5 days" className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-sm font-medium normal-case text-brand-cocoa" /></div>
                      </div>

                      {/* Product Availability & Production Settings (Replaced Stock counts) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-beige/25 p-4 rounded border border-brand-beige/50">
                        <div className="space-y-2">
                          <label className="block font-bold">Product Availability</label>
                          <div className="flex flex-col space-y-2 text-xs">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="radio" name="availability" checked={newProdAvailability === 'available'} onChange={() => setNewProdAvailability('available')} />
                              <span>Available (Accepting Orders)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="radio" name="availability" checked={newProdAvailability === 'temporarily_unavailable'} onChange={() => setNewProdAvailability('temporarily_unavailable')} />
                              <span>Temporarily Unavailable (Paused)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="radio" name="availability" checked={newProdAvailability === 'discontinued'} onChange={() => setNewProdAvailability('discontinued')} />
                              <span>Discontinued</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block font-bold">Production Mode</label>
                          <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                            <input type="checkbox" checked={newProdMadeToOrder} onChange={(e) => setNewProdMadeToOrder(e.target.checked)} />
                            <span>Made to Order ✓ (Crocheted after checkout)</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block">Image Selection</label>
                        <select value={newProdImage} onChange={(e) => setNewProdImage(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-xs font-bold text-brand-cocoa">
                          <option value="/images/butterfly_keychain.jpg">Butterfly Keychain</option>
                          <option value="/images/evil_eye_keychain.jpg">Evil Eye Keychain</option>
                          <option value="/images/flower_bookmark.jpg">Flower Bookmark</option>
                          <option value="/images/hair_accessories.jpg">Hair Bows</option>
                          <option value="/images/custom_gift.jpg">Kraft Gift Box</option>
                        </select>
                      </div>

                      <div className="space-y-1.5"><label className="block">Description *</label><textarea required rows={3} value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-sm font-medium normal-case text-brand-cocoa" /></div>

                      <div className="grid grid-cols-3 gap-3 bg-brand-beige/20 p-3 rounded font-semibold text-xs text-brand-cocoa/80">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdCustomizable} onChange={(e) => setNewProdCustomizable(e.target.checked)} /><span>Customizable</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdFeatured} onChange={(e) => setNewProdFeatured(e.target.checked)} /><span>Featured</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdBestseller} onChange={(e) => setNewProdBestseller(e.target.checked)} /><span>Bestseller</span></label>
                      </div>

                      <button type="submit" className="w-full bg-brand-rose text-brand-cream py-3.5 rounded font-bold uppercase tracking-wider text-xs shadow-sm hover:bg-brand-cocoa transition-colors">Add Creation to Shop</button>
                    </form>
                  </div>
                </div>
              )}

              {/* Editing Product Modal overlay */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-cocoa/30 backdrop-blur-sm animate-fade-in">
                  <div className="bg-brand-cream border border-brand-beige w-full max-w-2xl rounded-lg shadow-2xl overflow-y-auto max-h-[90vh] p-6 sm:p-8 animate-slide-up space-y-6">
                    <div className="flex justify-between items-center border-b border-brand-beige pb-3">
                      <h4 className="font-serif text-lg font-bold text-brand-cocoa">Edit Creation Details</h4>
                      <button onClick={() => setEditingProduct(null)}><X size={20} /></button>
                    </div>
                    
                    <form onSubmit={handleSaveEditProduct} className="space-y-5 text-xs font-bold uppercase tracking-wider text-brand-cocoa">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block">Product Name *</label>
                          <input type="text" required value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-sm font-medium normal-case text-brand-cocoa" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block">Price (INR) *</label>
                          <input type="number" required value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-sm font-medium text-brand-cocoa" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="block">Compare Price</label>
                          <input type="number" value={editingProduct.compare_at_price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-sm font-medium text-brand-cocoa" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block">Category</label>
                          <select value={editingProduct.category_id} onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-xs font-bold text-brand-cocoa">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block">Preparation Time *</label>
                          <input type="text" required value={editingProduct.preparation_time || '3–5 days'} onChange={(e) => setEditingProduct({ ...editingProduct, preparation_time: e.target.value })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-sm font-medium normal-case text-brand-cocoa" />
                        </div>
                      </div>

                      {/* Product Availability & Production Settings (Replaced Stock counts) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-beige/25 p-4 rounded border border-brand-beige/50">
                        <div className="space-y-2">
                          <label className="block font-bold">Product Availability</label>
                          <div className="flex flex-col space-y-2 text-xs">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="radio" name="availability-edit" checked={editingProduct.availability_status === 'available'} onChange={() => setEditingProduct({ ...editingProduct, availability_status: 'available' })} />
                              <span>Available (Accepting Orders)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="radio" name="availability-edit" checked={editingProduct.availability_status === 'temporarily_unavailable'} onChange={() => setEditingProduct({ ...editingProduct, availability_status: 'temporarily_unavailable' })} />
                              <span>Temporarily Unavailable (Paused)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="radio" name="availability-edit" checked={editingProduct.availability_status === 'discontinued'} onChange={() => setEditingProduct({ ...editingProduct, availability_status: 'discontinued' })} />
                              <span>Discontinued</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block font-bold">Production Mode</label>
                          <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                            <input type="checkbox" checked={editingProduct.made_to_order || false} onChange={(e) => setEditingProduct({ ...editingProduct, made_to_order: e.target.checked })} />
                            <span>Made to Order ✓ (Crocheted after checkout)</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block">Description *</label>
                        <textarea required rows={4} value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2.5 text-sm font-medium normal-case text-brand-cocoa" />
                      </div>

                      <div className="grid grid-cols-4 gap-3 bg-brand-beige/20 p-3 rounded font-semibold text-xs text-brand-cocoa/80">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={editingProduct.featured} onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })} /><span>Featured</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={editingProduct.bestseller} onChange={(e) => setEditingProduct({ ...editingProduct, bestseller: e.target.checked })} /><span>Bestseller</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={editingProduct.new_product} onChange={(e) => setEditingProduct({ ...editingProduct, new_product: e.target.checked })} /><span>New</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={editingProduct.customization_available} onChange={(e) => setEditingProduct({ ...editingProduct, customization_available: e.target.checked })} /><span>Customizable</span></label>
                      </div>

                      <button type="submit" className="w-full bg-brand-rose text-brand-cream py-3 rounded font-bold flex items-center justify-center space-x-2 hover:bg-brand-cocoa transition-colors uppercase tracking-wider text-xs"><Save size={16} /><span>Save Changes</span></button>
                    </form>
                  </div>
                </div>
              )}

              {/* Products Table (Availability Column Replaced Stock) */}
              <div className="bg-brand-offwhite border border-brand-beige rounded-lg overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-brand-beige/35 border-b border-brand-beige/70 text-xs font-bold uppercase tracking-wider text-brand-cocoa/60">
                      <th className="p-4">Product Info</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Availability</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-beige/30">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-brand-beige/10">
                        <td className="p-4 flex items-center space-x-3">
                          <div className="relative w-10 h-12 rounded border overflow-hidden bg-brand-cream flex-shrink-0">
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-brand-cocoa">{p.name}</h4>
                            <div className="flex space-x-1.5 mt-0.5 text-[9px] font-bold text-brand-rose uppercase">
                              {p.bestseller && <span>★ Bestseller</span>}
                              {p.new_product && <span>• New</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs">{p.sku}</td>
                        <td className="p-4 text-xs font-semibold capitalize">{p.category_id}</td>
                        <td className="p-4 font-semibold">₹{p.price}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-sm ${
                            p.availability_status === 'available'
                              ? 'bg-emerald-50 text-emerald-800 bg-emerald-50 border border-emerald-200'
                              : p.availability_status === 'temporarily_unavailable'
                              ? 'bg-rose-50 text-brand-rose border border-rose-200'
                              : 'bg-brand-cocoa/10 text-brand-cocoa/60'
                          }`}>
                            {p.availability_status === 'available' ? 'Made to Order' : p.availability_status === 'temporarily_unavailable' ? 'Unavailable' : 'Discontinued'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => setEditingProduct(p)} className="p-1.5 rounded bg-brand-cream hover:bg-brand-rose hover:text-brand-cream border border-brand-beige text-brand-cocoa transition-colors" title="Edit"><Edit2 size={13} /></button>
                          <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded bg-brand-cream hover:bg-brand-rose hover:text-brand-cream border border-brand-beige text-brand-cocoa transition-colors" title="Delete"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ACTIVE ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-serif text-xl font-bold text-brand-cocoa">Active Customer Orders</h3>
                  <p className="text-[11px] text-brand-cocoa/60 font-medium">
                    Orders currently in progress. Once delivered, they will move to Completed Orders.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('completed-orders')}
                  className="self-start sm:self-center text-xs font-bold text-brand-rose hover:text-brand-cocoa px-3 py-1.5 rounded border border-brand-rose/40 hover:border-brand-cocoa transition-colors flex items-center space-x-1"
                >
                  <CheckCircle2 size={13} />
                  <span>View Completed Orders ({completedOrders.length})</span>
                </button>
              </div>

              <div className="bg-brand-offwhite border border-brand-beige rounded-lg overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-brand-beige/35 border-b border-brand-beige/70 text-xs font-bold uppercase tracking-wider text-brand-cocoa/60">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Products</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4">Order Status</th>
                      <th className="p-4">Order Date</th>
                      <th className="p-4">Tracking</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-beige/30">
                    {loadingOrders ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-xs text-brand-cocoa/50 italic">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="animate-spin" size={14} /> Loading active orders...
                          </span>
                        </td>
                      </tr>
                    ) : activeOrders.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-12 text-center text-xs text-brand-cocoa/70 space-y-2">
                          <div className="font-serif text-base font-bold text-brand-cocoa">No active orders right now</div>
                          <p className="text-brand-cocoa/60">You're all caught up. New orders will appear here.</p>
                          <div className="pt-3">
                            <button
                              onClick={() => setActiveTab('completed-orders')}
                              className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-rose hover:text-brand-cocoa transition-colors"
                            >
                              <span>View Completed Orders ({completedOrders.length})</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      activeOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-brand-beige/10 align-top">
                          <td className="p-4 font-serif font-bold text-brand-cocoa whitespace-nowrap">
                            <Link
                              href={`/admin/orders/${encodeURIComponent(o.id)}`}
                              className="text-brand-rose hover:underline"
                            >
                              {o.id}
                            </Link>
                          </td>
                          <td className="p-4 text-xs font-semibold">{o.shipping_address.fullName}</td>
                          <td className="p-4 text-xs text-brand-cocoa/70 whitespace-nowrap">
                            {o.shipping_address.phone}
                          </td>
                          <td className="p-4 text-xs max-w-[16rem]">
                            {o.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
                          </td>
                          <td className="p-4 font-bold whitespace-nowrap">₹{o.total}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-[9px] uppercase font-bold whitespace-nowrap ${
                                o.payment_status === 'payment_verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.payment_status === 'payment_received'
                                  ? 'bg-blue-100 text-blue-800'
                                  : o.payment_status === 'payment_issue'
                                  ? 'bg-rose-100 text-rose-800'
                                  : o.payment_status === 'refunded'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {paymentStatusLabel(o.payment_status)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded text-[9px] uppercase font-bold whitespace-nowrap bg-brand-beige/60 text-brand-cocoa">
                              {orderStatusLabel(o.order_status)}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-brand-cocoa/60 font-medium whitespace-nowrap">
                            {new Date(o.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="p-4 text-xs">
                            {hasTrackingInfo(o) ? (
                              <div className="space-y-0.5">
                                <span className="block font-semibold text-brand-cocoa">{o.carrier}</span>
                                <span className="block font-mono text-[10px] text-brand-cocoa/70">
                                  {o.tracking_number}
                                </span>
                              </div>
                            ) : (
                              <span className="text-brand-cocoa/40 italic">Not added</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Link
                              href={`/admin/orders/${encodeURIComponent(o.id)}`}
                              className="inline-flex items-center gap-1 border border-brand-beige bg-brand-cream hover:bg-brand-rose hover:text-brand-cream text-brand-cocoa transition-colors font-bold text-[10px] uppercase tracking-wider py-2 px-3 rounded whitespace-nowrap"
                            >
                              Manage <ChevronRight size={11} />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: COMPLETED ORDERS */}
          {activeTab === 'completed-orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-serif text-xl font-bold text-brand-cocoa">Completed Orders</h3>
                  <p className="text-[11px] text-brand-cocoa/60 font-medium">
                    Orders that have been successfully delivered to customers.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="self-start sm:self-center text-xs font-bold text-brand-rose hover:text-brand-cocoa px-3 py-1.5 rounded border border-brand-rose/40 hover:border-brand-cocoa transition-colors flex items-center space-x-1"
                >
                  <ShoppingBag size={13} />
                  <span>View Active Orders ({activeOrders.length})</span>
                </button>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
                  <input
                    type="text"
                    value={completedSearch}
                    onChange={(e) => setCompletedSearch(e.target.value)}
                    placeholder="Search by Order ID, name, email..."
                    className="w-full bg-brand-cream border border-brand-beige rounded pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/50 font-medium"
                  />
                  {completedSearch && (
                    <button
                      onClick={() => setCompletedSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-cocoa/40 hover:text-brand-cocoa"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <div className="flex items-center space-x-1.5">
                    <Filter size={13} className="text-brand-cocoa/50" />
                    <select
                      value={completedDateFilter}
                      onChange={(e) => setCompletedDateFilter(e.target.value as any)}
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
                      value={completedSort}
                      onChange={(e) => setCompletedSort(e.target.value as any)}
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

              {/* Table */}
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
                    {loadingOrders ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-xs text-brand-cocoa/50 italic">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="animate-spin" size={14} /> Loading completed orders...
                          </span>
                        </td>
                      </tr>
                    ) : filteredCompletedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-xs text-brand-cocoa/70 space-y-2">
                          <div className="font-serif text-base font-bold text-brand-cocoa">No completed orders yet</div>
                          <p className="text-brand-cocoa/60">Delivered orders will appear here once they're completed.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCompletedOrders.map((o) => (
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
                          <td className="p-4">
                            <Link
                              href={`/admin/orders/${encodeURIComponent(o.id)}`}
                              className="inline-flex items-center gap-1 border border-brand-beige bg-brand-cream hover:bg-brand-rose hover:text-brand-cream text-brand-cocoa transition-colors font-bold text-[10px] uppercase tracking-wider py-2 px-3 rounded whitespace-nowrap"
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
            </div>
          )}

          {/* TAB: CUSTOM REQUESTS */}
          {activeTab === 'custom' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-serif text-xl font-bold text-brand-cocoa">Custom Gifting Requests</h3>

              <div className="bg-brand-offwhite border border-brand-beige rounded-lg overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-brand-beige/35 border-b border-brand-beige/70 text-xs font-bold uppercase tracking-wider text-brand-cocoa/60">
                      <th className="p-4">Request ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Product / Occasion</th>
                      <th className="p-4">Budget Range</th>
                      <th className="p-4">Required Date</th>
                      <th className="p-4">Request Details</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-beige/30">
                    {customOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-xs text-brand-cocoa/50 italic">
                          No custom requests yet.
                        </td>
                      </tr>
                    ) : (
                      customOrders.map((req) => {
                        const isUrgent = req.requiredDate && new Date(req.requiredDate).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 7;
                        return (
                          <tr key={req.id} className="hover:bg-brand-beige/10">
                            <td className="p-4 font-serif font-bold text-brand-cocoa">{req.id}</td>
                            <td className="p-4 text-xs font-semibold">
                              <p>{req.name}</p>
                              <p className="text-brand-cocoa/50 font-normal">{req.phone}</p>
                            </td>
                            <td className="p-4 text-xs">
                              <p className="font-bold">{req.productType}</p>
                              <p className="text-brand-cocoa/60">{req.occasion}</p>
                            </td>
                            <td className="p-4 text-xs font-semibold text-brand-rose">{req.budgetRange}</td>
                            <td className={`p-4 text-xs font-mono font-medium ${isUrgent && req.status !== 'completed' ? 'text-brand-rose font-bold' : ''}`}>
                              {req.requiredDate || 'Flexible'} {isUrgent && req.status !== 'completed' && '⚠ Urgent'}
                            </td>
                            <td className="p-4 text-xs max-w-xs leading-relaxed text-brand-cocoa/85">
                              <p className="line-clamp-2" title={req.customizationDetails}>{req.customizationDetails}</p>
                            </td>
                            <td className="p-4">
                              <select
                                value={req.status}
                                onChange={(e) => updateCustomOrderStatus(req.id, e.target.value as any)}
                                className="bg-brand-cream border border-brand-beige text-xs rounded p-1.5 text-brand-cocoa font-semibold focus:outline-none focus:border-brand-rose"
                              >
                                <option value="new">New Request</option>
                                <option value="reviewing">Reviewing</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="font-serif text-xl font-bold text-brand-cocoa">Customer Messages Inbox</h3>
                
                {/* Search & Filters block */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
                    <input
                      type="text"
                      value={messagesSearch}
                      onChange={(e) => setMessagesSearch(e.target.value)}
                      placeholder="Search messages..."
                      className="bg-brand-offwhite border border-brand-beige rounded pl-9 pr-3 py-1.5 text-xs text-brand-cocoa focus:outline-none focus:border-brand-rose w-44"
                    />
                  </div>

                  {/* Filter Dropdown */}
                  <div className="flex items-center space-x-1">
                    <Filter size={12} className="text-brand-cocoa/50" />
                    <select
                      value={messagesFilter}
                      onChange={(e) => setMessagesFilter(e.target.value as any)}
                      className="bg-brand-offwhite border border-brand-beige rounded p-1.5 text-xs text-brand-cocoa font-bold"
                    >
                      <option value="all">All Status</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                    </select>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center space-x-1">
                    <ArrowUpDown size={12} className="text-brand-cocoa/50" />
                    <select
                      value={messagesSort}
                      onChange={(e) => setMessagesSort(e.target.value as any)}
                      className="bg-brand-offwhite border border-brand-beige rounded p-1.5 text-xs text-brand-cocoa font-bold"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages Grid list */}
              <div className="bg-brand-offwhite border border-brand-beige rounded-lg overflow-hidden shadow-sm">
                
                {/* Columns Header (desktop) */}
                <div className="hidden sm:grid grid-cols-12 gap-4 p-3 bg-brand-beige/35 border-b border-brand-beige/70 text-xs font-bold text-brand-cocoa/55">
                  <span className="col-span-3">Customer</span>
                  <span className="col-span-4">Subject</span>
                  <span className="col-span-3">Received</span>
                  <span className="col-span-2 text-right">Actions</span>
                </div>

                <div className="divide-y divide-brand-beige/25">
                  {loadingMessages ? (
                    <div className="p-8 text-center text-xs text-brand-cocoa/60 flex items-center justify-center space-x-1.5">
                      <Loader2 className="animate-spin text-brand-rose" size={14} />
                      <span>Loading inbox...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-10 text-center text-xs text-brand-cocoa/50 italic space-y-1">
                      <p className="font-serif text-sm text-brand-rose">No messages found</p>
                      <p>Customer inquiries will appear here when someone reaches out.</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleOpenMessage(m)}
                        className={`p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center hover:bg-brand-cream/40 transition-colors cursor-pointer ${
                          m.status === 'unread' ? 'bg-brand-rose/[0.015]' : ''
                        }`}
                      >
                        {/* Customer Column */}
                        <div className="col-span-1 sm:col-span-3 flex items-center space-x-2.5">
                          {m.status === 'unread' && (
                            <span className="w-2 h-2 bg-brand-rose rounded-full flex-shrink-0" />
                          )}
                          <div className="truncate">
                            <h4 className={`text-xs font-bold text-brand-cocoa ${m.status === 'unread' ? 'text-brand-rose' : ''}`}>
                              {m.name}
                            </h4>
                            <p className="text-[10px] text-brand-cocoa/50 truncate font-mono">{m.email}</p>
                          </div>
                        </div>

                        {/* Subject & Preview Column */}
                        <div className="col-span-1 sm:col-span-4">
                          <p className={`text-xs truncate font-semibold font-serif ${m.status === 'unread' ? 'text-brand-cocoa font-bold' : 'text-brand-cocoa/80'}`}>
                            {m.subject}
                          </p>
                          <p className="text-[10px] text-brand-cocoa/60 truncate line-clamp-1">{m.message}</p>
                        </div>

                        {/* Date Column */}
                        <div className="col-span-1 sm:col-span-3 text-[11px] text-brand-cocoa/60 font-semibold font-mono">
                          {new Date(m.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* Action Column */}
                        <div className="col-span-1 sm:col-span-2 text-right space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleMarkMessageStatus(m.id, m.status)}
                            className="p-1 border border-brand-beige rounded bg-brand-cream hover:bg-brand-rose hover:text-brand-cream transition-colors text-[9px] font-bold uppercase tracking-wider px-2"
                            title={m.status === 'read' ? 'Mark unread' : 'Mark read'}
                          >
                            {m.status === 'read' ? 'Unread' : 'Read'}
                          </button>
                          <button
                            onClick={() => setMessageToDelete(m)}
                            className="p-1.5 border border-brand-beige rounded bg-brand-cream hover:bg-brand-rose hover:text-brand-cream transition-colors inline-flex items-center"
                            title="Delete message"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* Left Column: Create Coupon Form */}
              <div className="lg:col-span-4 bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4 h-fit">
                <h4 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">Create Coupon</h4>
                
                <form onSubmit={handleAddCouponSubmit} className="space-y-4 text-xs font-bold uppercase tracking-wider text-brand-cocoa">
                  <div className="space-y-1">
                    <label className="block">Coupon Code *</label>
                    <input type="text" required value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} placeholder="e.g. CROCHET10" className="w-full bg-brand-cream border border-brand-beige rounded p-2 text-sm text-brand-cocoa font-mono font-bold" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block">Type</label>
                      <select value={newCouponType} onChange={(e) => setNewCouponType(e.target.value as any)} className="w-full bg-brand-cream border border-brand-beige rounded p-2 text-xs font-bold text-brand-cocoa">
                        <option value="percentage">Percentage Off</option>
                        <option value="fixed">Fixed Amount Off</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block">Value *</label>
                      <input type="number" required value={newCouponValue} onChange={(e) => setNewCouponValue(Number(e.target.value))} className="w-full bg-brand-cream border border-brand-beige rounded p-2 text-sm text-brand-cocoa font-bold" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block">Minimum Subtotal (Optional)</label>
                    <input type="number" value={newCouponMin} onChange={(e) => setNewCouponMin(e.target.value)} placeholder="e.g. 500" className="w-full bg-brand-cream border border-brand-beige rounded p-2 text-sm text-brand-cocoa font-bold" />
                  </div>

                  <button type="submit" className="w-full bg-brand-rose text-brand-cream py-3 rounded font-bold uppercase tracking-wider text-xs shadow-sm hover:bg-brand-cocoa transition-colors">Create Coupon</button>
                </form>
              </div>

              {/* Right Column: Coupons List */}
              <div className="lg:col-span-8 space-y-4">
                <h4 className="font-serif text-lg font-bold text-brand-cocoa">Active Coupons</h4>
                
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg overflow-hidden shadow-sm">
                  <div className="p-3 bg-brand-beige/35 border-b border-brand-beige/50 text-xs font-bold text-brand-cocoa/55 grid grid-cols-12 gap-2">
                    <span className="col-span-4">Coupon Code</span>
                    <span className="col-span-3">Discount Type</span>
                    <span className="col-span-3">Requirements</span>
                    <span className="col-span-2 text-right">Actions</span>
                  </div>

                  <div className="divide-y divide-brand-beige/25 text-sm text-brand-cocoa/85">
                    {coupons.length === 0 ? (
                      <div className="p-6 text-center text-xs text-brand-cocoa/50 italic">
                        No active coupons configured.
                      </div>
                    ) : (
                      coupons.map((c) => (
                        <div key={c.code} className="p-3 grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4 flex items-center space-x-2">
                            <span className="font-mono font-bold">{c.code}</span>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {c.active ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          <span className="col-span-3 text-xs font-medium uppercase">
                            {c.type === 'percentage' ? `${c.value}% Off` : `₹${c.value} Off`}
                          </span>
                          <span className="col-span-3 text-xs text-brand-cocoa/60 font-medium">
                            {c.minSubtotal ? `Min: ₹${c.minSubtotal}` : 'No minimum'}
                          </span>
                          <div className="col-span-2 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => toggleCoupon(c.code)}
                              className="p-1 border border-brand-beige rounded bg-brand-cream hover:bg-brand-rose hover:text-brand-cream transition-colors text-[9px] font-bold uppercase tracking-wider px-2"
                            >
                              Toggle
                            </button>
                            <button
                              onClick={() => deleteCoupon(c.code)}
                              className="p-1.5 border border-brand-beige rounded bg-brand-cream hover:bg-brand-rose hover:text-brand-cream transition-colors inline-flex items-center"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* MESSAGE DETAILS MODAL DIALOG */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-brand-cocoa/40 backdrop-blur-sm" onClick={() => setSelectedMessage(null)} />

          <div className="bg-brand-cream border border-brand-beige w-full max-w-lg rounded-lg shadow-2xl overflow-hidden z-10 p-6 sm:p-8 animate-slide-up flex flex-col max-h-[90vh] relative">
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-brand-cocoa hover:text-brand-rose transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="border-b border-brand-beige/50 pb-4 mb-5 space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa pr-6">
                {selectedMessage.subject}
              </h3>
              <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-brand-rose">
                <span>Inquiry Details</span>
                <span>•</span>
                <span className={`px-1.5 py-0.5 rounded-sm ${selectedMessage.status === 'unread' ? 'bg-rose-100 text-brand-rose' : 'bg-brand-beige/50 text-brand-cocoa/75'}`}>
                  {selectedMessage.status}
                </span>
              </div>
            </div>

            <div className="overflow-y-auto space-y-5 pr-1 flex-grow text-xs leading-relaxed text-brand-cocoa">
              <div className="bg-brand-offwhite border border-brand-beige rounded p-4 space-y-2">
                <p><strong className="font-bold text-brand-cocoa/50 uppercase tracking-wide text-[9px] block">Customer Name</strong><span className="text-sm font-semibold">{selectedMessage.name}</span></p>
                <p><strong className="font-bold text-brand-cocoa/50 uppercase tracking-wide text-[9px] block">Email Address</strong><a href={`mailto:${selectedMessage.email}`} className="text-xs text-brand-rose font-medium hover:underline">{selectedMessage.email}</a></p>
                {selectedMessage.phone && (
                  <p><strong className="font-bold text-brand-cocoa/50 uppercase tracking-wide text-[9px] block">Phone / WhatsApp</strong><span className="text-xs font-semibold">{selectedMessage.phone}</span></p>
                )}
                <p><strong className="font-bold text-brand-cocoa/50 uppercase tracking-wide text-[9px] block">Submitted At</strong><span className="text-xs font-medium font-mono">{new Date(selectedMessage.created_at).toLocaleString('en-IN')}</span></p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-brand-cocoa/50 uppercase tracking-wide text-[9px] block">Customer Message</span>
                <p className="bg-brand-cream border border-brand-beige rounded p-4 text-xs whitespace-pre-wrap leading-relaxed text-brand-cocoa">
                  {selectedMessage.message}
                </p>
              </div>
            </div>

            <div className="border-t border-brand-beige/50 pt-5 mt-5 flex flex-wrap gap-2.5 justify-end">
              <button
                onClick={() => handleMarkMessageStatus(selectedMessage.id, selectedMessage.status)}
                className="px-4 py-2 border border-brand-beige bg-brand-offwhite rounded text-xs font-bold text-brand-cocoa hover:bg-brand-beige/25 transition-colors uppercase tracking-wider"
              >
                Mark as {selectedMessage.status === 'read' ? 'Unread' : 'Read'}
              </button>

              <button
                onClick={() => { setSelectedMessage(null); setMessageToDelete(selectedMessage); }}
                className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-bold hover:bg-rose-100 transition-colors uppercase tracking-wider"
              >
                Delete
              </button>

              {selectedMessage.phone && (
                <a
                  href={`https://wa.me/91${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi ${selectedMessage.name}, this is Neeshiartique regarding your message about ${selectedMessage.subject}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 text-brand-cream rounded text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center space-x-1.5 uppercase tracking-wider shadow-sm"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              )}

              <a
                href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}
                className="px-4 py-2 bg-brand-rose text-brand-cream rounded text-xs font-bold hover:bg-brand-cocoa transition-colors inline-flex items-center space-x-1.5 uppercase tracking-wider shadow-sm"
              >
                <Mail size={13} />
                <span>Reply Email</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-brand-cocoa/45 backdrop-blur-xs" onClick={() => setMessageToDelete(null)} />
          <div className="bg-brand-cream border border-brand-beige rounded-lg shadow-xl w-full max-w-sm p-6 relative z-10 text-center space-y-4 animate-slide-up">
            <h4 className="font-serif text-lg font-bold text-brand-cocoa">Delete this message?</h4>
            <p className="text-xs text-brand-cocoa/75 leading-relaxed">
              This will permanently delete the message from the inbox. This action cannot be undone.
            </p>
            <div className="pt-2 flex justify-center space-x-3 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setMessageToDelete(null)}
                className="px-5 py-2.5 border border-brand-beige bg-brand-offwhite text-brand-cocoa hover:bg-brand-beige/25 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMessage(messageToDelete.id)}
                className="px-5 py-2.5 bg-brand-rose text-brand-cream hover:bg-brand-cocoa rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
