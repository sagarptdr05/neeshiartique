'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useStore } from '@/context/StoreContext';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, setShowAuthModal, setAuthRedirectAction } = useStore();
  
  const [isScrolled, setIsScrolled] = useState(false);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    const gatedPages = ['/wishlist', '/account', '/custom-orders'];
    if (gatedPages.includes(href) && !user) {
      e.preventDefault();
      setAuthRedirectAction(() => {
        router.push(href);
      });
      setShowAuthModal(true);
    }
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle sticky transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Custom Crochet', href: '/custom-orders' },
    { label: 'About Us', href: '/about' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' },
  ];

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-brand-cream/95 backdrop-blur-md border-b border-brand-beige py-3 shadow-sm'
            : 'bg-brand-cream/80 border-b border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Mobile Hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 text-brand-cocoa hover:text-brand-rose transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 group">
            <span className="font-serif text-xl sm:text-2xl font-semibold tracking-wider text-brand-cocoa transition-colors group-hover:text-brand-rose">
              neeshiartique
            </span>
            <span className="text-brand-rose text-xs mt-1">♡</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-sm font-medium tracking-wide transition-colors relative py-1 ${
                    isActive
                      ? 'text-brand-rose font-semibold'
                      : 'text-brand-cocoa/80 hover:text-brand-rose'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-brand-rose rounded-full animate-fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 text-brand-cocoa hover:text-brand-rose transition-colors"
              aria-label="Search products"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              onClick={(e) => handleNavClick(e, '/wishlist')}
              className="p-1.5 text-brand-cocoa hover:text-brand-rose transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-rose text-brand-cream text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold border border-brand-cream">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Account Link */}
            <Link
              href="/account"
              onClick={(e) => handleNavClick(e, '/account')}
              className="p-1.5 text-brand-cocoa hover:text-brand-rose transition-colors"
              aria-label="My Account"
            >
              <User size={20} />
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="p-1.5 text-brand-cocoa hover:text-brand-rose transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-cocoa text-brand-cream text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold border border-brand-cream">
                  {totalCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Overlay Dropdown */}
        {searchOpen && (
          <div className="absolute top-full left-0 w-full bg-brand-cream border-b border-brand-beige shadow-md p-4 animate-fade-in z-50">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for keychains, bookmarks, custom orders..."
                className="w-full bg-brand-offwhite border border-brand-beige rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose text-brand-cocoa placeholder-brand-cocoa/50"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-4 p-1.5 text-brand-cocoa hover:text-brand-rose transition-colors"
              >
                <Search size={18} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-brand-cocoa/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex flex-col w-4/5 max-w-sm bg-brand-cream h-full p-6 shadow-2xl z-10 border-r border-brand-beige animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <span className="font-serif text-lg font-bold text-brand-cocoa">neeshiartique ♡</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-brand-cocoa hover:text-brand-rose transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col space-y-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`text-base font-medium tracking-wide border-b border-brand-beige/50 pb-2 transition-colors ${
                      isActive ? 'text-brand-rose font-bold' : 'text-brand-cocoa hover:text-brand-rose'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-brand-beige pt-6 text-center text-xs text-brand-cocoa/60 font-medium">
              <p>Handmade in India • Crafted with Love</p>
              <p className="mt-1">Follow along @neeshiartique</p>
            </div>
          </div>
        </div>
      )}
      <AuthModal />
    </>
  );
}
