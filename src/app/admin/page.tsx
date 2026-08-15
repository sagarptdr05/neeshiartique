'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Product, Order, CustomOrderRequest, Category, Coupon } from '@/data/mockData';
import { BRAND_CONFIG } from '@/config/brand';
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
  Loader2
} from 'lucide-react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type AdminTab = 'overview' | 'products' | 'orders' | 'custom' | 'messages' | 'coupons';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    updateOrderStatus,
    updateOrderPaymentStatus,
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
  const [newProdStock, setNewProdStock] = useState(10);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('/images/butterfly_keychain.jpg');
  const [newProdCustomizable, setNewProdCustomizable] = useState(false);
  const [newProdFeatured, setNewProdFeatured] = useState(false);
  const [newProdBestseller, setNewProdBestseller] = useState(false);
  const [newProdNew, setNewProdNew] = useState(true);

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
          // Update message in state
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
      stock: Number(newProdStock),
      sku: `PROD-${Date.now().toString().slice(-6)}`,
      images: [newProdImage],
      materials: ['Handmade cotton thread'],
      care_instructions: ['Gently spot clean with damp cloth.'],
      customization_available: newProdCustomizable,
      personalization_options: newProdCustomizable ? ['Vibrant Multi-color', 'Soft Pastel Tone'] : undefined,
      preparation_time: '2-3 days',
      shipping_time: '3-5 days',
      featured: newProdFeatured,
      bestseller: newProdBestseller,
      new_product: newProdNew,
      status: 'active',
    });

    // Reset
    setNewProdName('');
    setNewProdPrice(0);
    setNewProdCompare('');
    setNewProdStock(10);
    setNewProdDesc('');
    setNewProdCustomizable(false);
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

  // Metrics Calculations (loaded dynamically from database states)
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((acc, o) => acc + o.total, 0);
  const pendingCraftingCount = orders.filter((o) => o.order_status === 'being_crafted').length;
  const newCustomRequestsCount = customOrders.filter((r) => r.status === 'new').length;
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;

  // Inventory Metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 5).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;

  // Recent lists for overview dashboard
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const recentRequests = [...customOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const recentMessages = [...messages].slice(0, 5);

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
                  onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
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
                  onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
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
                  onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
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
                  {orders.length > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'orders' ? 'bg-brand-cream text-brand-rose' : 'bg-brand-rose text-brand-cream'
                    }`}>{orders.length}</span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('custom'); setMobileMenuOpen(false); }}
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
                  onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }}
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
                  onClick={() => { setActiveTab('coupons'); setMobileMenuOpen(false); }}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm flex items-center space-x-3.5">
                  <div className="p-2.5 bg-brand-sage/10 text-brand-sage rounded-full"><DollarSign size={18} /></div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Revenue</span>
                    <span className="text-lg font-bold text-brand-cocoa">₹{totalRevenue}</span>
                  </div>
                </div>
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm flex items-center space-x-3.5">
                  <div className="p-2.5 bg-brand-rose/10 text-brand-rose rounded-full"><ShoppingBag size={18} /></div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Total Orders</span>
                    <span className="text-lg font-bold text-brand-cocoa">{orders.length}</span>
                  </div>
                </div>
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm flex items-center space-x-3.5">
                  <div className="p-2.5 bg-amber-100 text-amber-700 rounded-full"><Clock size={18} /></div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Crafting Queue</span>
                    <span className="text-lg font-bold text-brand-cocoa">{pendingCraftingCount}</span>
                  </div>
                </div>
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm flex items-center space-x-3.5">
                  <div className="p-2.5 bg-rose-100 text-rose-700 rounded-full"><Mail size={18} /></div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">New Messages</span>
                    <span className="text-lg font-bold text-brand-cocoa">{unreadMessagesCount}</span>
                  </div>
                </div>
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm flex items-center space-x-3.5">
                  <div className="p-2.5 bg-blue-100 text-blue-700 rounded-full"><Sparkles size={18} /></div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Custom Requests</span>
                    <span className="text-lg font-bold text-brand-cocoa">{newCustomRequestsCount}</span>
                  </div>
                </div>
              </div>

              {/* Grid 2: Recent Orders & Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Recent Orders List Preview */}
                <div className="lg:col-span-7 bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-brand-beige/50 pb-3">
                    <h3 className="font-serif text-base font-bold text-brand-cocoa">Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-[10px] font-bold text-brand-rose hover:text-brand-cocoa uppercase tracking-wider flex items-center space-x-0.5 transition-colors"
                    >
                      <span>View All Orders</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  <div className="divide-y divide-brand-beige/20 overflow-x-auto min-h-[250px]">
                    {recentOrders.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-brand-cocoa/50 italic py-10">
                        No orders yet.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="text-brand-cocoa/50 border-b border-brand-beige/35">
                            <th className="pb-2 font-bold uppercase">Order ID</th>
                            <th className="pb-2 font-bold uppercase">Customer</th>
                            <th className="pb-2 font-bold uppercase">Amount</th>
                            <th className="pb-2 font-bold uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-beige/20 font-medium">
                          {recentOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-brand-beige/5">
                              <td className="py-2.5 font-serif font-bold text-brand-rose">{o.id}</td>
                              <td className="py-2.5 text-brand-cocoa">{o.shipping_address.fullName}</td>
                              <td className="py-2.5 font-bold">₹{o.total}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold ${
                                  o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {o.payment_status}
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

              {/* Grid 3: Custom Requests & Product Inventory */}
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

                {/* Product Inventory Summary */}
                <div className="lg:col-span-4 bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="border-b border-brand-beige/50 pb-3">
                    <h3 className="font-serif text-base font-bold text-brand-cocoa">Inventory Overview</h3>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-cocoa/70 uppercase">Total Unique Products</span>
                      <span className="font-serif text-lg font-bold text-brand-cocoa">{totalProducts}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-cocoa/70 uppercase flex items-center space-x-1.5">
                        <AlertTriangle size={13} className="text-amber-500" />
                        <span>Low Stock Items</span>
                      </span>
                      <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{lowStockProducts}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-cocoa/70 uppercase flex items-center space-x-1.5">
                        <AlertTriangle size={13} className="text-brand-rose" />
                        <span>Out of Stock</span>
                      </span>
                      <span className="text-sm font-bold text-brand-rose bg-rose-50 px-2 py-0.5 rounded border border-brand-rose/20">{outOfStockProducts}</span>
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
                      Manage Products
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
                      <h4 className="font-serif text-lg font-bold text-brand-cocoa">Add New Creation</h4>
                      <button onClick={() => setShowAddProduct(false)}><X size={20} /></button>
                    </div>
                    
                    <form onSubmit={handleAddProductSubmit} className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="block font-bold">Product Name *</label><input type="text" required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" /></div>
                        <div className="space-y-1"><label className="block font-bold">Price (INR) *</label><input type="number" required value={newProdPrice} onChange={(e) => setNewProdPrice(Number(e.target.value))} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" /></div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1"><label className="block font-bold">Stock Count</label><input type="number" required value={newProdStock} onChange={(e) => setNewProdStock(Number(e.target.value))} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" /></div>
                        <div className="space-y-1"><label className="block font-bold">Compare-at Price (Optional)</label><input type="number" value={newProdCompare} onChange={(e) => setNewProdCompare(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" /></div>
                        <div className="space-y-1"><label className="block font-bold">Category</label><select value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold">Image Selector</label>
                        <select value={newProdImage} onChange={(e) => setNewProdImage(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2">
                          <option value="/images/butterfly_keychain.jpg">Butterfly Keychain</option>
                          <option value="/images/evil_eye_keychain.jpg">Evil Eye Keychain</option>
                          <option value="/images/flower_bookmark.jpg">Flower Bookmark</option>
                          <option value="/images/hair_accessories.jpg">Hair Bows</option>
                          <option value="/images/custom_gift.jpg">Kraft Gift Box</option>
                        </select>
                      </div>

                      <div className="space-y-1"><label className="block font-bold">Full Description *</label><textarea required rows={4} value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" /></div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-brand-beige/25 p-3 rounded border border-brand-beige/50 font-semibold text-xs text-brand-cocoa/80">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdCustomizable} onChange={(e) => setNewProdCustomizable(e.target.checked)} /><span>Customizable</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdFeatured} onChange={(e) => setNewProdFeatured(e.target.checked)} /><span>Featured</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdBestseller} onChange={(e) => setNewProdBestseller(e.target.checked)} /><span>Bestseller</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdNew} onChange={(e) => setNewProdNew(e.target.checked)} /><span>New Release</span></label>
                      </div>

                      <button type="submit" className="w-full bg-brand-rose text-brand-cream py-3 rounded font-bold uppercase tracking-wider text-xs shadow-sm hover:bg-brand-cocoa transition-colors">Add Product to Shop</button>
                    </form>
                  </div>
                </div>
              )}

              {/* Editing Product Drawer overlay */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-cocoa/30 backdrop-blur-sm animate-fade-in">
                  <div className="bg-brand-cream border border-brand-beige w-full max-w-2xl rounded-lg shadow-2xl overflow-y-auto max-h-[90vh] p-6 sm:p-8 animate-slide-up space-y-6">
                    <div className="flex justify-between items-center border-b border-brand-beige pb-3">
                      <h4 className="font-serif text-lg font-bold text-brand-cocoa">Edit Product Details</h4>
                      <button onClick={() => setEditingProduct(null)}><X size={20} /></button>
                    </div>
                    
                    <form onSubmit={handleSaveEditProduct} className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold">Product Name *</label>
                          <input type="text" required value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold">Price (INR) *</label>
                          <input type="number" required value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold">Stock *</label>
                          <input type="number" required value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold">Compare Price</label>
                          <input type="number" value={editingProduct.compare_at_price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold">Description *</label>
                        <textarea required rows={4} value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-brand-beige/25 p-3 rounded border border-brand-beige/50 font-semibold text-xs text-brand-cocoa/80">
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

              {/* Products Table */}
              <div className="bg-brand-offwhite border border-brand-beige rounded-lg overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-brand-beige/35 border-b border-brand-beige/70 text-xs font-bold uppercase tracking-wider text-brand-cocoa/60">
                      <th className="p-4">Product Info</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
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
                          <span className={`text-xs font-bold ${p.stock === 0 ? 'text-brand-rose' : 'text-brand-cocoa/85'}`}>{p.stock} left</span>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => setEditingProduct(p)} className="p-1.5 rounded bg-brand-cream hover:bg-brand-rose hover:text-brand-cream border border-brand-beige text-brand-cocoa transition-colors animate-slide-up" title="Edit"><Edit2 size={13} /></button>
                          <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded bg-brand-cream hover:bg-brand-rose hover:text-brand-cream border border-brand-beige text-brand-cocoa transition-colors" title="Delete"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-serif text-xl font-bold text-brand-cocoa">Manage Customer Orders</h3>
              
              <div className="bg-brand-offwhite border border-brand-beige rounded-lg overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-brand-beige/35 border-b border-brand-beige/70 text-xs font-bold uppercase tracking-wider text-brand-cocoa/60">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items Summary</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Order Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-beige/30">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-xs text-brand-cocoa/50 italic">
                          No orders yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-brand-beige/10">
                          <td className="p-4 font-serif font-bold text-brand-cocoa">{o.id}</td>
                          <td className="p-4 text-xs font-semibold">
                            <p>{o.shipping_address.fullName}</p>
                            <p className="text-brand-cocoa/50 font-normal">{o.shipping_address.phone}</p>
                          </td>
                          <td className="p-4 text-xs max-w-xs truncate">
                            {o.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                          </td>
                          <td className="p-4 font-bold">₹{o.total}</td>
                          <td className="p-4">
                            <select
                              value={o.payment_status}
                              onChange={(e) => updateOrderPaymentStatus(o.id, e.target.value as any)}
                              className="bg-brand-cream border border-brand-beige text-xs rounded p-1.5 text-brand-cocoa font-medium focus:outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <select
                              value={o.order_status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                              className="bg-brand-cream border border-brand-beige text-xs rounded p-1.5 text-brand-cocoa font-semibold focus:outline-none focus:border-brand-rose"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="being_crafted">Being Crafted</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-4 text-xs text-brand-cocoa/60 font-medium">
                            {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-brand-cocoa/40 backdrop-blur-sm" onClick={() => setSelectedMessage(null)} />

          {/* Modal Container */}
          <div className="bg-brand-cream border border-brand-beige w-full max-w-lg rounded-lg shadow-2xl overflow-hidden z-10 p-6 sm:p-8 animate-slide-up flex flex-col max-h-[90vh]">
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

            {/* Modal Scrollable Contents */}
            <div className="overflow-y-auto space-y-5 pr-1 flex-grow text-xs leading-relaxed text-brand-cocoa">
              
              {/* Customer Contact Card */}
              <div className="bg-brand-offwhite border border-brand-beige rounded p-4 space-y-2">
                <p><strong className="font-bold text-brand-cocoa/50 uppercase tracking-wide text-[9px] block">Customer Name</strong><span className="text-sm font-semibold">{selectedMessage.name}</span></p>
                <p><strong className="font-bold text-brand-cocoa/50 uppercase tracking-wide text-[9px] block">Email Address</strong><a href={`mailto:${selectedMessage.email}`} className="text-xs text-brand-rose font-medium hover:underline">{selectedMessage.email}</a></p>
                {selectedMessage.phone && (
                  <p><strong className="font-bold text-brand-cocoa/50 uppercase tracking-wide text-[9px] block">Phone / WhatsApp</strong><span className="text-xs font-semibold">{selectedMessage.phone}</span></p>
                )}
                <p><strong className="font-bold text-brand-cocoa/50 uppercase tracking-wide text-[9px] block">Submitted At</strong><span className="text-xs font-medium font-mono">{new Date(selectedMessage.created_at).toLocaleString('en-IN')}</span></p>
              </div>

              {/* Message Details */}
              <div className="space-y-1.5">
                <span className="font-bold text-brand-cocoa/50 uppercase tracking-wide text-[9px] block">Customer Message</span>
                <p className="bg-brand-cream border border-brand-beige rounded p-4 text-xs whitespace-pre-wrap leading-relaxed text-brand-cocoa">
                  {selectedMessage.message}
                </p>
              </div>

            </div>

            {/* Modal Action Controls Footer */}
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

              {/* WhatsApp reply option */}
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

              {/* Mailto reply option */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
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
