'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingBag, Eye, Check } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Wishlist() {
  const { products } = useStore();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});

  const savedProducts = products.filter((p) => wishlist.includes(p.id) && p.status === 'active');

  const handleAddToCart = (productId: string, name: string, price: number, image: string, customization?: string) => {
    addToCart({
      productId,
      name,
      price,
      image,
      customization,
    });
    setAddedItems((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [productId]: false }));
    }, 2000);
  };

  // 44. Beautiful Empty State
  if (savedProducts.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
          <span className="text-4xl text-brand-rose/60">✿</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
            Nothing saved yet — find something you'll love.
          </h1>
          <p className="text-xs sm:text-sm text-brand-cocoa/75 max-w-xs leading-relaxed">
            Discover cute keychains, hand-painted artwork, bookmarks, and customizable bundles. Click the heart to save them!
          </p>
          <Link
            href="/shop"
            className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-bold text-xs uppercase tracking-wider py-4 px-8 rounded shadow"
          >
            Explore Creations
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Main Wishlist */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <h1 className="font-serif text-3xl font-bold text-brand-cocoa mb-8">
          Saved Favorites
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {savedProducts.map((product) => {
            const isUnavailable = product.availability_status === 'temporarily_unavailable';
            const isSoldOut = isUnavailable;
            const isAdded = !!addedItems[product.id];

            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-brand-offwhite rounded-lg border border-brand-beige overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Image Container */}
                <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden w-full bg-brand-beige/20">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full border border-brand-beige bg-brand-cream/80 hover:bg-brand-cream text-brand-rose transition-all duration-200"
                    title="Remove from favorites"
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Sold out Badge */}
                  {isUnavailable && (
                    <span className="absolute top-3 left-3 text-[9px] font-bold tracking-wider px-2 py-1 bg-brand-cocoa text-brand-cream/80 rounded-sm shadow-sm uppercase">
                      Unavailable
                    </span>
                  )}
                </Link>

                {/* Description details */}
                <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-brand-rose/90 tracking-widest uppercase mb-1 block">
                      {product.category_id.replace('-', ' ')}
                    </span>
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-serif text-base font-bold leading-tight text-brand-cocoa hover:text-brand-rose transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <span className="text-sm font-semibold text-brand-cocoa block mt-1.5">
                      ₹{product.price}
                    </span>
                  </div>

                  {/* Action add-to-cart buttons */}
                  <div className="flex space-x-2 pt-2 border-t border-brand-beige/40">
                    {isUnavailable ? (
                      <button
                        disabled
                        className="flex-grow bg-brand-beige text-brand-cocoa/40 font-bold text-xs py-2 rounded cursor-not-allowed border border-brand-beige text-center uppercase tracking-wider"
                      >
                        Unavailable
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(
                          product.id,
                          product.name,
                          product.price,
                          product.images[0],
                          product.customization_available && product.personalization_options
                            ? product.personalization_options[0]
                            : undefined
                        )}
                        className="flex-grow bg-brand-rose hover:bg-brand-cocoa text-brand-cream font-bold text-xs py-2 rounded transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        {isAdded ? (
                          <>
                            <Check size={12} />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={12} />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    <Link
                      href={`/product/${product.slug}`}
                      className="p-2 border border-brand-beige bg-brand-cream rounded text-brand-cocoa hover:bg-brand-rose hover:text-brand-cream transition-colors flex items-center justify-center"
                      title="View Details"
                    >
                      <Eye size={12} />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
