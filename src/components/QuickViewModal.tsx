'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useStore } from '@/context/StoreContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, setShowAuthModal, setAuthRedirectAction } = useStore();
  const [selectedCustomization, setSelectedCustomization] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const isSaved = isInWishlist(product.id);
  const isSoldOut = product.stock === 0;

  // Set default option on render
  if (product.customization_available && product.personalization_options && !selectedCustomization) {
    setSelectedCustomization(product.personalization_options[0]);
  }

  const handleAddToCart = () => {
    if (isSoldOut) return;
    
    const action = () => {
      addToCart(
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          customization: selectedCustomization || undefined,
        },
        quantity
      );
      setAddedNotice(true);
      setTimeout(() => {
        setAddedNotice(false);
        onClose();
      }, 1500);
    };

    if (!user) {
      setAuthRedirectAction(() => action);
      setShowAuthModal(true);
      return;
    }

    action();
  };

  const handleWishlistToggle = () => {
    if (!user) {
      setAuthRedirectAction(() => {
        toggleWishlist(product.id);
      });
      setShowAuthModal(true);
      return;
    }
    toggleWishlist(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-brand-cocoa/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-brand-cream w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden border border-brand-beige z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-brand-cream/80 hover:bg-brand-cream text-brand-cocoa border border-brand-beige hover:text-brand-rose transition-colors z-20"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 relative aspect-square bg-brand-beige/10">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          {product.stock === 0 && (
            <span className="absolute top-4 left-4 bg-brand-cocoa text-brand-cream text-xs font-bold px-2 py-1 rounded shadow-sm">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-rose tracking-widest uppercase mb-1.5 block">
              {product.category_id.replace('-', ' ')}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa mb-2">
              {product.name}
            </h2>

            {/* Price tag */}
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-xl font-bold text-brand-cocoa">₹{product.price}</span>
              {product.compare_at_price && (
                <span className="text-sm text-brand-cocoa/50 line-through">₹{product.compare_at_price}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-brand-cocoa/80 leading-relaxed mb-6">
              {product.short_description}
            </p>

            {/* Customization Options */}
            {product.customization_available && product.personalization_options && (
              <div className="mb-6">
                <label className="block text-xs font-bold text-brand-cocoa tracking-wide mb-2 uppercase">
                  Select Custom Colors
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.personalization_options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedCustomization(option)}
                      className={`text-xs text-left p-2.5 rounded border transition-all duration-200 ${
                        selectedCustomization === option
                          ? 'border-brand-rose bg-brand-rose/10 font-medium text-brand-rose'
                          : 'border-brand-beige bg-brand-offwhite hover:border-brand-rose/50 text-brand-cocoa'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!isSoldOut && (
              <div className="mb-6 flex items-center space-x-4">
                <span className="text-xs font-bold text-brand-cocoa tracking-wide uppercase">
                  Quantity
                </span>
                <div className="flex items-center border border-brand-beige rounded bg-brand-offwhite">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-brand-cocoa hover:text-brand-rose transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-medium text-brand-cocoa">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-brand-cocoa hover:text-brand-rose transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-4">
            {isSoldOut ? (
              <button
                disabled
                className="flex-grow bg-brand-beige text-brand-cocoa/50 font-semibold text-sm py-3 px-6 rounded cursor-not-allowed text-center border border-brand-beige"
              >
                Sold Out
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={addedNotice}
                className="flex-grow bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-semibold text-sm py-3 px-6 rounded flex items-center justify-center space-x-2 shadow-sm"
              >
                {addedNotice ? (
                  <>
                    <Check size={16} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            )}

            {/* Wishlist Icon */}
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded border border-brand-beige bg-brand-offwhite hover:bg-brand-cream flex items-center justify-center transition-all ${
                isSaved ? 'text-brand-rose border-brand-rose/30 bg-brand-rose/5' : 'text-brand-cocoa'
              }`}
              aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
