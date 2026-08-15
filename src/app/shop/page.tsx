'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Grid, RotateCcw } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/data/mockData';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import Footer from '@/components/Footer';

// Inner component that handles logic using useSearchParams
function ShopContent() {
  const { products, categories } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL State Sync
  const catParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';

  // Local state
  const [selectedCategory, setSelectedCategory] = useState(catParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedStock, setSelectedStock] = useState('all'); // all, instock, soldout
  const [selectedCustom, setSelectedCustom] = useState('all'); // all, custom, ready
  const [sortBy, setSortBy] = useState('featured'); // featured, lowhigh, highlow, newest
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync params on load or change
  useEffect(() => {
    setSelectedCategory(catParam);
  }, [catParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // Handle category tab click
  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'all') {
      params.delete('category');
    } else {
      params.set('category', id);
    }
    router.push(`/shop?${params.toString()}`);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedStock('all');
    setSelectedCustom('all');
    setSortBy('featured');
    router.push('/shop');
  };

  // Filter and sort items
  const filteredProducts = products
    .filter((p) => p.status === 'active')
    .filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
        return false;
      }
      
      // Search query filter
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.short_description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Stock filter
      if (selectedStock === 'instock' && p.stock === 0) return false;
      if (selectedStock === 'soldout' && p.stock > 0) return false;

      // Customization filter
      if (selectedCustom === 'custom' && !p.customization_available) return false;
      if (selectedCustom === 'ready' && p.customization_available) return false;

      return true;
    })
    .sort((a, b) => {
      // Sort configurations
      if (sortBy === 'lowhigh') return a.price - b.price;
      if (sortBy === 'highlow') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      
      // Default / Featured
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Hero Banner Header */}
      <section className="bg-brand-beige/25 border-b border-brand-beige py-12 text-center relative overflow-hidden">
        <div className="absolute top-4 left-6 text-brand-rose/10 text-3xl font-serif select-none pointer-events-none">✿</div>
        <div className="absolute bottom-4 right-10 text-brand-rose/15 text-4xl font-serif select-none pointer-events-none">❀</div>
        
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-cocoa">
            Shop Handmade
          </h1>
          <p className="text-sm font-serif italic text-brand-rose">
            Find something little, lovely and made just for you.
          </p>
          <div className="w-16 h-[1.5px] bg-brand-rose mx-auto mt-2" />
        </div>
      </section>

      {/* Main Shop Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        
        {/* Search and Sorting Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Search bar input */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for something special..."
              className="w-full bg-brand-offwhite border border-brand-beige rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/45"
            />
            <Search className="absolute right-4 top-3 text-brand-cocoa/50" size={18} />
          </div>

          <div className="flex items-center space-x-3 justify-between md:justify-end">
            {/* Filter Toggle for Mobile */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex md:hidden items-center space-x-2 text-sm border border-brand-beige bg-brand-offwhite py-2.5 px-4 rounded text-brand-cocoa"
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>

            {/* Sorting selection */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-brand-cocoa/60 uppercase tracking-wider hidden sm:inline">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-brand-offwhite border border-brand-beige text-brand-cocoa text-sm rounded px-3 py-2 focus:outline-none focus:border-brand-rose"
              >
                <option value="featured">Featured Favorites</option>
                <option value="newest">Newest Drops</option>
                <option value="lowhigh">Price: Low to High</option>
                <option value="highlow">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="border-b border-brand-beige mb-10 overflow-x-auto">
          <div className="flex space-x-6 min-w-max pb-1">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`text-sm font-semibold tracking-wide pb-3 relative transition-colors ${
                selectedCategory === 'all' ? 'text-brand-rose' : 'text-brand-cocoa/75 hover:text-brand-rose'
              }`}
            >
              All Products
              {selectedCategory === 'all' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-rose rounded-full" />
              )}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`text-sm font-semibold tracking-wide pb-3 relative transition-colors ${
                  selectedCategory === cat.id ? 'text-brand-rose' : 'text-brand-cocoa/75 hover:text-brand-rose'
                }`}
              >
                {cat.name}
                {selectedCategory === cat.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-rose rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Filters + Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block space-y-8">
            
            {/* Filter Group: Stock Availability */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm font-bold text-brand-cocoa uppercase tracking-wider">
                Availability
              </h3>
              <div className="flex flex-col space-y-2 text-sm text-brand-cocoa/85">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedStock === 'all'}
                    onChange={() => setSelectedStock('all')}
                    className="accent-brand-rose cursor-pointer"
                  />
                  <span>All Items</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedStock === 'instock'}
                    onChange={() => setSelectedStock('instock')}
                    className="accent-brand-rose cursor-pointer"
                  />
                  <span>In Stock Only</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedStock === 'soldout'}
                    onChange={() => setSelectedStock('soldout')}
                    className="accent-brand-rose cursor-pointer"
                  />
                  <span>Sold Out Only</span>
                </label>
              </div>
            </div>

            {/* Filter Group: Customizability */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm font-bold text-brand-cocoa uppercase tracking-wider">
                Crafting Type
              </h3>
              <div className="flex flex-col space-y-2 text-sm text-brand-cocoa/85">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedCustom === 'all'}
                    onChange={() => setSelectedCustom('all')}
                    className="accent-brand-rose cursor-pointer"
                  />
                  <span>All Types</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedCustom === 'custom'}
                    onChange={() => setSelectedCustom('custom')}
                    className="accent-brand-rose cursor-pointer"
                  />
                  <span>Customizable / Made to Order</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedCustom === 'ready'}
                    onChange={() => setSelectedCustom('ready')}
                    className="accent-brand-rose cursor-pointer"
                  />
                  <span>Ready to Ship Only</span>
                </label>
              </div>
            </div>

            {/* Reset Button */}
            {(selectedStock !== 'all' || selectedCustom !== 'all' || searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={resetFilters}
                className="w-full border border-brand-beige bg-brand-offwhite text-brand-cocoa/80 hover:text-brand-rose hover:border-brand-rose transition-colors py-2.5 px-4 rounded text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </aside>

          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="fixed inset-0 bg-brand-cocoa/20 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
              <div className="relative flex flex-col w-4/5 max-w-xs bg-brand-cream h-full p-6 shadow-xl z-10 animate-slide-up">
                <div className="flex items-center justify-between border-b border-brand-beige pb-4 mb-6">
                  <span className="font-serif text-lg font-bold text-brand-cocoa">Filter Options</span>
                  <button onClick={() => setShowMobileFilters(false)} className="text-brand-cocoa">
                    Close
                  </button>
                </div>
                
                <div className="space-y-6 flex-grow overflow-y-auto">
                  <div className="space-y-3">
                    <h3 className="font-serif text-sm font-bold text-brand-cocoa">Availability</h3>
                    <div className="flex flex-col space-y-2 text-sm">
                      <label className="flex items-center space-x-2.5"><input type="radio" checked={selectedStock === 'all'} onChange={() => setSelectedStock('all')} /><span>All Items</span></label>
                      <label className="flex items-center space-x-2.5"><input type="radio" checked={selectedStock === 'instock'} onChange={() => setSelectedStock('instock')} /><span>In Stock</span></label>
                      <label className="flex items-center space-x-2.5"><input type="radio" checked={selectedStock === 'soldout'} onChange={() => setSelectedStock('soldout')} /><span>Sold Out</span></label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-serif text-sm font-bold text-brand-cocoa">Crafting Type</h3>
                    <div className="flex flex-col space-y-2 text-sm">
                      <label className="flex items-center space-x-2.5"><input type="radio" checked={selectedCustom === 'all'} onChange={() => setSelectedCustom('all')} /><span>All Types</span></label>
                      <label className="flex items-center space-x-2.5"><input type="radio" checked={selectedCustom === 'custom'} onChange={() => setSelectedCustom('custom')} /><span>Customizable</span></label>
                      <label className="flex items-center space-x-2.5"><input type="radio" checked={selectedCustom === 'ready'} onChange={() => setSelectedCustom('ready')} /><span>Ready to Ship</span></label>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-2 pt-6 border-t border-brand-beige">
                  <button onClick={() => setShowMobileFilters(false)} className="w-full bg-brand-rose text-brand-cream py-2.5 rounded text-sm font-bold">
                    Apply Filters
                  </button>
                  <button onClick={resetFilters} className="w-full bg-brand-offwhite border border-brand-beige text-brand-cocoa py-2.5 rounded text-sm">
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid Panel */}
          <div className="md:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <span className="text-4xl text-brand-rose/65">✿</span>
                <h3 className="font-serif text-xl font-bold text-brand-cocoa">
                  No matching creations found.
                </h3>
                <p className="text-sm text-brand-cocoa/75 max-w-sm">
                  Try adjusting your keywords, selecting a different category, or resetting your filter choices.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa font-semibold text-xs tracking-wide py-2.5 px-6 rounded transition-colors shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-brand-cocoa/60 font-semibold uppercase tracking-wider mb-6">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'creation' : 'creations'}
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="font-serif italic text-brand-rose text-lg">Loading Neeshiartique Shop... ♡</div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
