'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Product, Order, CustomOrderRequest, Category, Coupon } from '@/data/mockData';
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
  LogOut
} from 'lucide-react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type AdminTab = 'products' | 'orders' | 'custom' | 'coupons';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('neeshi_user_role');
    if (role !== 'admin') {
      router.push('/login?redirect=/admin');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('neeshi_user_role');
    localStorage.removeItem('neeshi_user_email');
    router.push('/login');
  };
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
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Form states: New Product
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(0);
  const [newProdCompare, setNewProdCompare] = useState('');
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.id || 'crochet');
  const [newProdStock, setNewProdStock] = useState(10);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdShort, setNewProdShort] = useState('');
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

  // Overview metrics calculations
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((acc, o) => acc + o.total, 0);
  const pendingCraftingCount = orders.filter((o) => o.order_status === 'being_crafted').length;
  const newCustomRequestsCount = customOrders.filter((r) => r.status === 'new').length;

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-cocoa font-serif italic">
        Verifying authorization... ♡
      </div>
    );
  }

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
      materials: ['Handmade cotton blend'],
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
    setNewProdShort('');
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Admin Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-8">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-brand-beige pb-4 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-brand-cocoa">Admin Dashboard</h1>
            <p className="text-xs text-brand-rose font-semibold uppercase tracking-wider">
              Neeshiartique Backend Management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs bg-brand-rose text-brand-cream py-1 px-3.5 rounded font-mono uppercase">
              Security Mode: Active
            </span>
            <button
              onClick={handleLogout}
              className="text-xs border border-brand-beige bg-brand-cream hover:bg-brand-rose hover:text-brand-cream transition-colors text-brand-cocoa py-1 px-3.5 rounded font-bold uppercase tracking-wider flex items-center space-x-1.5"
            >
              <LogOut size={12} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard metrics overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-brand-sage/10 text-brand-sage rounded-full"><DollarSign size={20} /></div>
            <div>
              <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wide block">Total Revenue</span>
              <span className="text-xl font-bold text-brand-cocoa">₹{totalRevenue}</span>
            </div>
          </div>
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-brand-rose/10 text-brand-rose rounded-full"><ShoppingBag size={20} /></div>
            <div>
              <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wide block">Total Orders</span>
              <span className="text-xl font-bold text-brand-cocoa">{orders.length}</span>
            </div>
          </div>
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-full"><Clock size={20} /></div>
            <div>
              <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wide block">Crafting Queue</span>
              <span className="text-xl font-bold text-brand-cocoa">{pendingCraftingCount}</span>
            </div>
          </div>
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-full"><MessageSquare size={20} /></div>
            <div>
              <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wide block">New Requests</span>
              <span className="text-xl font-bold text-brand-cocoa">{newCustomRequestsCount}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-brand-beige overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`text-sm font-semibold tracking-wide py-2.5 px-5 transition-colors flex items-center space-x-2 border-b-2 ${
              activeTab === 'products' ? 'border-brand-rose text-brand-rose' : 'border-transparent text-brand-cocoa/75 hover:text-brand-rose'
            }`}
          >
            <Package size={15} />
            <span>Products</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`text-sm font-semibold tracking-wide py-2.5 px-5 transition-colors flex items-center space-x-2 border-b-2 ${
              activeTab === 'orders' ? 'border-brand-rose text-brand-rose' : 'border-transparent text-brand-cocoa/75 hover:text-brand-rose'
            }`}
          >
            <ShoppingBag size={15} />
            <span>Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`text-sm font-semibold tracking-wide py-2.5 px-5 transition-colors flex items-center space-x-2 border-b-2 ${
              activeTab === 'custom' ? 'border-brand-rose text-brand-rose' : 'border-transparent text-brand-cocoa/75 hover:text-brand-rose'
            }`}
          >
            <MessageSquare size={15} />
            <span>Custom Requests</span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`text-sm font-semibold tracking-wide py-2.5 px-5 transition-colors flex items-center space-x-2 border-b-2 ${
              activeTab === 'coupons' ? 'border-brand-rose text-brand-rose' : 'border-transparent text-brand-cocoa/75 hover:text-brand-rose'
            }`}
          >
            <Percent size={15} />
            <span>Coupons</span>
          </button>
        </div>

        {/* Tab view panels */}
        <div className="space-y-6">
          
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

              {/* Add Product Modal Drawer overlay */}
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

                      <div className="space-y-1"><label className="block font-bold">Image Selector</label><select value={newProdImage} onChange={(e) => setNewProdImage(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2"><option value="/images/butterfly_keychain.jpg">Butterfly Keychain</option><option value="/images/evil_eye_keychain.jpg">Evil Eye Keychain</option><option value="/images/flower_bookmark.jpg">Flower Bookmark</option><option value="/images/hair_accessories.jpg">Hair Bows</option><option value="/images/handmade_art.jpg">Canvas Painting</option><option value="/images/custom_gift.jpg">Kraft Gift Box</option></select></div>

                      <div className="space-y-1"><label className="block font-bold">Short Summary *</label><input type="text" required value={newProdShort} onChange={(e) => setNewProdShort(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" /></div>
                      <div className="space-y-1"><label className="block font-bold">Full Description *</label><textarea required rows={3} value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} className="w-full bg-brand-offwhite border border-brand-beige rounded p-2" /></div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-brand-beige/25 p-3 rounded border border-brand-beige/50 font-semibold text-xs text-brand-cocoa/80">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdCustomizable} onChange={(e) => setNewProdCustomizable(e.target.checked)} /><span>Customizable</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdFeatured} onChange={(e) => setNewProdFeatured(e.target.checked)} /><span>Featured</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdBestseller} onChange={(e) => setNewProdBestseller(e.target.checked)} /><span>Bestseller</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={newProdNew} onChange={(e) => setNewProdNew(e.target.checked)} /><span>New Release</span></label>
                      </div>

                      <button type="submit" className="w-full bg-brand-rose text-brand-cream py-3 rounded font-bold">Add Product to Shop</button>
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

                      <button type="submit" className="w-full bg-brand-rose text-brand-cream py-3 rounded font-bold flex items-center justify-center space-x-2"><Save size={16} /><span>Save Changes</span></button>
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
                          <div className="relative w-10 h-12 rounded border overflow-hidden bg-brand-cream">
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
                        <td className="p-4 text-right space-x-2">
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
                    {orders.map((o) => (
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
                          {/* 28. Status timelines updater */}
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
                    ))}
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
                    {customOrders.map((req) => (
                      <tr key={req.id} className="hover:bg-brand-beige/10">
                        <td className="p-4 font-serif font-bold text-brand-cocoa">{req.id}</td>
                        <td className="p-4 text-xs font-semibold">
                          <p>{req.name}</p>
                          <p className="text-brand-cocoa/50 font-normal">{req.phone}</p>
                        </td>
                        <td className="p-4 text-xs">
                          <p className="font-bold text-brand-cocoa">{req.productType}</p>
                          <p className="text-brand-rose font-medium">{req.occasion}</p>
                        </td>
                        <td className="p-4 text-xs font-semibold">{req.budgetRange}</td>
                        <td className="p-4 text-xs text-brand-cocoa/60">{req.requiredDate}</td>
                        <td className="p-4 text-xs max-w-xs truncate" title={req.customizationDetails}>
                          {req.customizationDetails}
                        </td>
                        <td className="p-4">
                          <select
                            value={req.status}
                            onChange={(e) => updateCustomOrderStatus(req.id, e.target.value as any)}
                            className="bg-brand-cream border border-brand-beige text-xs rounded p-1.5 text-brand-cocoa font-bold focus:outline-none"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="in_discussion">In Discussion</option>
                            <option value="approved">Approved</option>
                            <option value="being_crafted">Being Crafted</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
              {/* Left Column: Create Coupon */}
              <div className="lg:col-span-4 bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4">
                <h4 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                  Create Coupon Code
                </h4>
                <form onSubmit={handleAddCouponSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="block text-brand-cocoa uppercase">Coupon Code *</label>
                    <input type="text" required value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} placeholder="e.g. SUMMER20" className="w-full bg-brand-cream border border-brand-beige rounded p-2 text-sm uppercase font-semibold" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-brand-cocoa uppercase">Type</label>
                    <select value={newCouponType} onChange={(e) => setNewCouponType(e.target.value as any)} className="w-full bg-brand-cream border border-brand-beige rounded p-2 text-sm font-semibold">
                      <option value="percentage">Percentage Off (%)</option>
                      <option value="fixed">Fixed Flat Off (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-brand-cocoa uppercase">Discount Value *</label>
                    <input type="number" required value={newCouponValue} onChange={(e) => setNewCouponValue(Number(e.target.value))} className="w-full bg-brand-cream border border-brand-beige rounded p-2 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-brand-cocoa uppercase">Min Subtotal (Optional)</label>
                    <input type="number" value={newCouponMin} onChange={(e) => setNewCouponMin(e.target.value)} placeholder="e.g. 300" className="w-full bg-brand-cream border border-brand-beige rounded p-2 text-sm" />
                  </div>
                  <button type="submit" className="w-full bg-brand-rose text-brand-cream py-3 rounded font-bold uppercase tracking-wider text-xs">Create Coupon</button>
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
                    {coupons.map((c) => (
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
                        <div className="col-span-2 text-right space-x-1.5">
                          <button
                            onClick={() => toggleCoupon(c.code)}
                            className="p-1 border border-brand-beige rounded bg-brand-cream hover:bg-brand-rose hover:text-brand-cream transition-colors text-xs font-semibold px-2"
                          >
                            Toggle
                          </button>
                          <button
                            onClick={() => deleteCoupon(c.code)}
                            className="p-1 border border-brand-beige rounded bg-brand-cream hover:bg-brand-rose hover:text-brand-cream transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
