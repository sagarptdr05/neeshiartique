'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { Product } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useStore } from '@/context/StoreContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, setShowAuthModal, setAuthRedirectAction } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const isSaved = isInWishlist(product.id);
  const isUnavailable = product.availability_status === 'temporarily_unavailable';
  const isSoldOut = isUnavailable; // Alias for cart handler consistency

  // Determine badge to display
  let badgeText = '';
  let badgeColorClass = '';

  if (isUnavailable) {
    badgeText = 'CURRENTLY UNAVAILABLE';
    badgeColorClass = 'bg-brand-cocoa text-brand-cream/85';
  } else if (product.new_product) {
    badgeText = 'NEW';
    badgeColorClass = 'bg-brand-blush text-brand-cocoa';
  } else if (product.bestseller) {
    badgeText = 'BESTSELLER';
    badgeColorClass = 'bg-brand-rose text-brand-cream';
  } else if (product.customization_available) {
    badgeText = 'CUSTOM';
    badgeColorClass = 'bg-brand-sage text-brand-cream';
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSoldOut) return;
    
    const action = () => {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        customization: product.customization_available && product.personalization_options 
          ? product.personalization_options[0] 
          : undefined,
      });
    };

    if (!user) {
      setAuthRedirectAction(() => action);
      setShowAuthModal(true);
      return;
    }

    action();
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthRedirectAction(() => {
        toggleWishlist(product.id);
      });
      setShowAuthModal(true);
      return;
    }
    toggleWishlist(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div
      className="group relative flex flex-col bg-brand-offwhite rounded-md border border-brand-beige/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Gallery Wrapper */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden w-full bg-brand-beige/20">
        <Image
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badge Overlay */}
        {badgeText && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold tracking-wider px-2 py-1 rounded-sm shadow-sm ${badgeColorClass}`}>
            {badgeText}
          </span>
        )}

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-1.5 rounded-full border border-brand-beige bg-brand-cream/80 hover:bg-brand-cream text-brand-cocoa transition-all duration-300 ${
            isSaved ? 'text-brand-rose scale-110' : 'hover:scale-105'
          }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} className="transition-colors" />
        </button>

        {/* Hover Action Menu Panel */}
        <div className="absolute inset-0 bg-brand-cocoa/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
          <div className="flex items-center space-x-2 w-full max-w-[200px] animate-slide-up">
            
            {/* Quick View Button */}
            {onQuickView && (
              <button
                onClick={handleQuickViewClick}
                className="flex-1 bg-brand-cream text-brand-cocoa hover:bg-brand-rose hover:text-brand-cream transition-colors text-xs py-2 px-3 rounded border border-brand-beige flex items-center justify-center space-x-1.5 shadow-sm"
                title="Quick View"
              >
                <Eye size={13} />
                <span className="font-medium">Quick View</span>
              </button>
            )}

            {/* Quick Add Button */}
            {!isSoldOut && (
              <button
                onClick={handleAddToCart}
                className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors p-2 rounded flex items-center justify-center shadow-sm"
                title="Add to Cart"
              >
                <ShoppingCart size={13} />
              </button>
            )}
          </div>
        </div>
      </Link>

      {/* Info Details Section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category Label */}
        <span className="text-[11px] font-semibold text-brand-rose/90 tracking-widest uppercase mb-1">
          {product.category_id.replace('-', ' ')}
        </span>

        {/* Product Title */}
        <Link href={`/product/${product.slug}`} className="mb-2">
          <h3 className="font-serif text-base font-semibold leading-tight text-brand-cocoa hover:text-brand-rose transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price tag & Availability */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-sm font-semibold text-brand-cocoa">
              ₹{product.price}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-brand-cocoa/50 line-through">
                ₹{product.compare_at_price}
              </span>
            )}
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${
            isUnavailable ? 'text-brand-rose' : 'text-brand-sage'
          }`}>
            {isUnavailable ? 'Currently Unavailable' : 'Made to Order'}
          </span>
        </div>
      </div>
    </div>
  );
}
