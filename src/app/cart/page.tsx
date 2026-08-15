'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Heart, ArrowRight, ShoppingBag, Tag, Check, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    subtotal,
    shipping,
    total,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!inputCoupon.trim()) return;

    const res = applyCoupon(inputCoupon.trim());
    if (res.success) {
      setCouponSuccess(res.message);
      setInputCoupon('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess('');
    setCouponError('');
  };

  // 44. Beautiful Empty State
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
          <span className="text-5xl text-brand-rose/50">♡</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
            Your little basket is waiting for something lovely.
          </h1>
          <p className="text-sm text-brand-cocoa/75 max-w-xs leading-relaxed">
            Find unique hand-painted art, cute crochet keychains, or customize a warm gift for your loved ones.
          </p>
          <Link
            href="/shop"
            className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-bold text-xs uppercase tracking-wider py-4 px-8 rounded shadow"
          >
            Explore Handmade Creations
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

      {/* Cart Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <h1 className="font-serif text-3xl font-bold text-brand-cocoa mb-8">
          Your Little Basket
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Cart Items list */}
          <div className="lg:col-span-8 space-y-6">
            <div className="border border-brand-beige rounded-lg overflow-hidden bg-brand-offwhite shadow-sm">
              <div className="p-4 sm:p-6 border-b border-brand-beige/50 font-semibold text-sm uppercase tracking-wider text-brand-cocoa/60 grid grid-cols-12 gap-4 hidden sm:grid">
                <span className="col-span-6">Product</span>
                <span className="col-span-2 text-center">Quantity</span>
                <span className="col-span-2 text-right">Price</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              <div className="divide-y divide-brand-beige/40">
                {cartItems.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    
                    {/* Item product info */}
                    <div className="col-span-12 sm:col-span-6 flex items-center space-x-4">
                      <div className="relative w-16 h-20 rounded border border-brand-beige/50 overflow-hidden flex-shrink-0 bg-brand-cream">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-serif text-base font-bold text-brand-cocoa hover:text-brand-rose transition-colors">
                          <Link href={`/shop`}>{item.name}</Link>
                        </h3>
                        {item.customization && (
                          <span className="text-[11px] font-semibold text-brand-rose/90 block">
                            ✿ {item.customization}
                          </span>
                        )}
                        <button
                          onClick={() => removeFromCart(item.productId, item.customization)}
                          className="text-xs text-brand-cocoa/50 hover:text-brand-rose flex items-center space-x-1.5 pt-1.5 transition-colors"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Quantity selectors */}
                    <div className="col-span-12 sm:col-span-2 flex justify-center">
                      <div className="flex items-center border border-brand-beige rounded bg-brand-cream">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.customization)}
                          className="px-2.5 py-1 text-brand-cocoa hover:text-brand-rose transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3.5 py-1 text-sm font-semibold text-brand-cocoa">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.customization)}
                          className="px-2.5 py-1 text-brand-cocoa hover:text-brand-rose transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price tag */}
                    <div className="col-span-6 sm:col-span-2 text-left sm:text-right text-sm">
                      <span className="sm:hidden text-xs text-brand-cocoa/50 block font-medium uppercase tracking-wider mb-0.5">Price</span>
                      <span className="text-brand-cocoa/90 font-medium">₹{item.price}</span>
                    </div>

                    {/* Total column */}
                    <div className="col-span-6 sm:col-span-2 text-right text-sm">
                      <span className="sm:hidden text-xs text-brand-cocoa/50 block font-medium uppercase tracking-wider mb-0.5">Total</span>
                      <span className="font-bold text-brand-cocoa">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/shop"
                className="text-sm font-bold text-brand-cocoa hover:text-brand-rose transition-colors flex items-center space-x-1.5 border-b border-brand-cocoa hover:border-brand-rose pb-0.5"
              >
                <span>← Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Right: Order Summary Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-6 shadow-sm space-y-6">
              <h2 className="font-serif text-xl font-bold text-brand-cocoa border-b border-brand-beige/50 pb-3">
                Order Summary
              </h2>

              {/* Subtotal, shipping, discount totals */}
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-brand-cocoa/85">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between text-brand-cocoa/85">
                  <span>Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? 'Free Shipping' : `₹${shipping}`}</span>
                </div>
                
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-brand-rose font-medium">
                    <span className="flex items-center space-x-1">
                      <Tag size={12} />
                      <span>Discount ({couponCode})</span>
                    </span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="border-t border-brand-beige/50 pt-3.5 flex justify-between text-base font-bold text-brand-cocoa">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Coupon code input field */}
              <div className="pt-2 border-t border-brand-beige/40">
                {couponCode ? (
                  <div className="bg-brand-rose/5 border border-brand-rose/25 rounded p-3 flex items-center justify-between">
                    <div className="text-xs text-brand-rose font-semibold flex items-center space-x-1.5">
                      <Check size={14} />
                      <span>Coupon Applied: <strong>{couponCode}</strong></span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-1 text-brand-rose hover:text-brand-cocoa transition-colors"
                      title="Remove Coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="flex-grow bg-brand-cream border border-brand-beige text-brand-cocoa text-xs rounded px-3 py-2.5 focus:outline-none focus:border-brand-rose placeholder-brand-cocoa/45 uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-brand-cocoa hover:bg-brand-rose text-brand-cream transition-colors text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 rounded"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && <p className="text-[11px] text-brand-rose font-semibold mt-2">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-brand-sage font-semibold mt-2">{couponSuccess}</p>}
              </div>

              {/* CTA Actions */}
              <div className="pt-4 border-t border-brand-beige/40">
                <Link
                  href="/checkout"
                  className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors font-bold text-sm py-4 px-6 rounded flex items-center justify-center space-x-2 shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="bg-brand-beige/25 border border-brand-beige rounded-lg p-4 text-[11px] leading-relaxed text-brand-cocoa/75 flex items-start space-x-2">
              <span className="text-brand-rose">✿</span>
              <p>
                Get <strong>Free Shipping</strong> on orders above ₹500! Standard crafted items take 2-3 days to prepare. Custom orders take 4-6 days.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
