'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, MessageCircle, AlertTriangle, ArrowRight, Loader2, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { BRAND_CONFIG } from '@/config/brand';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Checkout() {
  const router = useRouter();
  const { cartItems, subtotal, shipping, couponCode, couponDiscount, total, clearCart } = useCart();
  const { products, placeOrder, user } = useStore();

  // Form input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country] = useState('India');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // A single key per checkout attempt. If the customer double-clicks or the
  // network retries, the server returns the order it already created instead
  // of making a second one.
  const idempotencyKey = useRef(
    `chk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
  const inFlight = useRef(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;

    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Your basket is empty. Please add something lovely before placing an order.');
      return;
    }

    const unavailable = cartItems.find((item) => {
      const product = products.find((p) => p.id === item.productId);
      return !product || product.availability_status !== 'available' || product.status !== 'active';
    });
    if (unavailable) {
      setErrorMessage(
        `${unavailable.name} is currently unavailable. Please return to your basket and remove it.`
      );
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in all required delivery fields.');
      return;
    }

    inFlight.current = true;
    setSubmitting(true);

    // Only ids, quantities and customizations are sent — the server looks up
    // every price itself.
    const result = await placeOrder({
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        customization: item.customization,
      })),
      shipping_address: {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country,
      },
      customer_notes: notes.trim() || undefined,
      coupon_code: couponCode || undefined,
      idempotency_key: idempotencyKey.current,
    });

    if (!result.success || !result.order) {
      inFlight.current = false;
      setSubmitting(false);
      setErrorMessage(result.message || 'We could not create your order. Please try again.');
      return;
    }

    clearCart();
    router.push(`/order-received?id=${encodeURIComponent(result.order.id)}`);
  };

  if (cartItems.length === 0 && !submitting) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
          <span className="text-4xl text-brand-rose/60">✿</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
            No items in your basket to checkout.
          </h1>
          <button
            onClick={() => router.push('/shop')}
            className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-bold text-xs uppercase tracking-wider py-3 px-8 rounded shadow"
          >
            Back to Shop
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <h1 className="font-serif text-3xl font-bold text-brand-cocoa mb-2">
          Review Your Order
        </h1>
        <p className="text-sm text-brand-cocoa/70 mb-8 max-w-2xl">
          Every piece is made to order. Place your order below and we&apos;ll continue on WhatsApp to
          share the payment details.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left: Input Forms */}
          <div className="lg:col-span-8">
            <form onSubmit={handlePlaceOrder} className="space-y-8">

              {/* Step 1: Customer Details */}
              <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-6 shadow-sm space-y-4">
                <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                  1. Contact Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your Phone Number"
                    className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                  />
                  <p className="text-[10px] text-brand-cocoa/55">
                    We&apos;ll use this number to reach you on WhatsApp about your order.
                  </p>
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-6 shadow-sm space-y-4">
                <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center space-x-2">
                  <Truck size={18} className="text-brand-rose" />
                  <span>2. Delivery Address</span>
                </h2>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Your delivery address"
                    className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2 sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">State *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Your state"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Pincode *</label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Your pincode"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    disabled
                    value={country}
                    className="w-full bg-brand-beige/50 border border-brand-beige rounded px-3 py-2 text-sm cursor-not-allowed text-brand-cocoa/50 font-semibold"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Order Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions?"
                    className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                  />
                </div>
              </div>

              {/* Step 3: How payment works */}
              <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-6 shadow-sm space-y-4">
                <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center space-x-2">
                  <MessageCircle size={18} className="text-brand-rose" />
                  <span>3. How Payment Works</span>
                </h2>

                <div className="bg-brand-rose/5 border border-brand-rose/20 rounded p-4 space-y-3 text-xs leading-relaxed text-brand-cocoa/85">
                  <p className="font-semibold text-brand-cocoa">
                    Neeshiartique collects payment personally over WhatsApp — no card details are
                    ever entered on this website.
                  </p>
                  <ol className="space-y-1.5 list-decimal list-inside">
                    <li>You place your order here and we create it right away.</li>
                    <li>WhatsApp opens with your order details ready to send to {BRAND_CONFIG.phoneFormatted}.</li>
                    <li>Neeshiartique shares a UPI/QR for the exact amount.</li>
                    <li>Once your payment is received and verified, your order is confirmed.</li>
                  </ol>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-brand-rose/5 border border-brand-rose/25 rounded flex items-start space-x-2 text-xs text-brand-rose font-semibold">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Place Order CTA */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-rose hover:bg-brand-cocoa disabled:opacity-70 disabled:cursor-not-allowed text-brand-cream transition-colors font-bold text-sm py-4 px-6 rounded flex items-center justify-center space-x-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Creating Your Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order &amp; Continue</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-brand-cocoa/55">
                  Placing an order does not charge you. Your order is confirmed only after
                  Neeshiartique receives and verifies your payment.
                </p>
              </div>

            </form>
          </div>

          {/* Right: Order summary card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-6">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                In Your Basket
              </h2>

              <div className="divide-y divide-brand-beige/20 text-xs">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-3">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-brand-cocoa">{item.name}</h4>
                      {item.customization && (
                        <span className="text-[9px] font-semibold text-brand-rose block">
                          ✿ {item.customization}
                        </span>
                      )}
                      <span className="text-brand-cocoa/60 font-medium">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-brand-cocoa self-start">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-beige/50 pt-4 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-brand-cocoa/85">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-brand-cocoa/85">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-brand-rose">
                    <span>Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="border-t border-brand-beige/40 pt-2 flex justify-between text-sm font-bold text-brand-cocoa">
                  <span>Amount Payable</span>
                  <span>₹{total}</span>
                </div>
                <p className="text-[10px] font-medium text-brand-cocoa/55 pt-1">
                  Final amount is confirmed by Neeshiartique on WhatsApp before you pay.
                </p>
              </div>
            </div>

            <div className="border border-brand-beige rounded-lg p-4 bg-brand-sage/5 flex items-start space-x-2.5 text-[11px] font-medium text-brand-cocoa/80 leading-relaxed">
              <Heart size={16} className="text-brand-rose flex-shrink-0 mt-0.5" />
              <span>
                Every Neeshiartique piece is <strong className="font-bold">made to order</strong>,
                stitched by hand once your payment is verified.
              </span>
            </div>

            {user && (
              <p className="text-[10px] text-center text-brand-cocoa/50">
                Placing this order as {user.email}
              </p>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
