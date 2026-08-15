'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ShoppingBag, Truck, Calendar, MessageSquare } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders } = useStore();

  const orderId = searchParams.get('id');
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
          <span className="text-4xl text-brand-rose/60">✿</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
            No Order Details Found
          </h1>
          <p className="text-sm text-brand-cocoa/75 max-w-sm">
            We couldn't retrieve details for this order. It might still be processing.
          </p>
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
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Confirmation Panel */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16 flex-grow space-y-8">
        
        {/* Header Message */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-brand-rose/10 text-brand-rose animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cocoa">
            Your little package is on its way. ♡
          </h1>
          <p className="text-sm text-brand-rose font-semibold uppercase tracking-wider">
            Order Reference: {order.id}
          </p>
          <div className="w-16 h-[1.5px] bg-brand-rose mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          
          {/* Left Side: Order Items */}
          <div className="md:col-span-7 space-y-6">
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                Order Items
              </h2>
              
              <div className="divide-y divide-brand-beige/30">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-16 rounded border border-brand-beige/30 overflow-hidden bg-brand-cream flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-0.5 text-sm">
                        <h4 className="font-serif font-bold text-brand-cocoa">{item.name}</h4>
                        {item.customization && (
                          <span className="text-[10px] font-semibold text-brand-rose block">
                            ✿ {item.customization}
                          </span>
                        )}
                        <span className="text-xs text-brand-cocoa/60 font-medium">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-brand-cocoa">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Order total list summary */}
              <div className="border-t border-brand-beige/50 pt-4 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-brand-cocoa/75">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-brand-cocoa/75">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-brand-rose">
                    <span>Discount</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="border-t border-brand-beige/40 pt-2 flex justify-between text-sm font-bold text-brand-cocoa">
                  <span>Total Amount Paid</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>
            
            {/* Handmade crafting timeline note */}
            <div className="bg-brand-rose/5 border border-brand-rose/20 rounded-lg p-5 flex items-start space-x-3 text-xs leading-relaxed text-brand-cocoa/80">
              <Calendar className="text-brand-rose mt-0.5 flex-shrink-0" size={16} />
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-brand-cocoa">Estimated Preparation Time</h4>
                <p>
                  Because Neeshiartique creations are handcrafted with love, they may take 2-4 days to prepare before shipping. Once shipped, you'll receive tracking details immediately. Thank you for your patience! ♡
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Shipping & Shipping status */}
          <div className="md:col-span-5 space-y-6">
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center space-x-2">
                <Truck size={18} className="text-brand-rose" />
                <span>Shipping Details</span>
              </h2>
              
              <div className="text-sm space-y-2.5 text-brand-cocoa/85">
                <p>
                  <strong className="block font-bold text-brand-cocoa">Customer Name:</strong>
                  {order.shipping_address.fullName}
                </p>
                <p>
                  <strong className="block font-bold text-brand-cocoa">Delivery Address:</strong>
                  {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                </p>
                <p>
                  <strong className="block font-bold text-brand-cocoa">Contact details:</strong>
                  Phone: {order.shipping_address.phone}<br />
                  Email: {order.shipping_address.email}
                </p>
                {order.notes && (
                  <p className="bg-brand-cream/60 p-2.5 rounded border border-brand-beige text-xs italic">
                    <strong className="not-italic font-bold block text-brand-cocoa mb-0.5">Order Notes:</strong>
                    "{order.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons track orders */}
            <div className="space-y-3.5 pt-2">
              <Link
                href={`/track-order?id=${order.id}`}
                className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors font-bold text-sm py-3.5 px-6 rounded flex items-center justify-center space-x-2 shadow"
              >
                <span>Track Order Timeline</span>
              </Link>
              
              <Link
                href="/shop"
                className="w-full bg-brand-offwhite border border-brand-beige text-brand-cocoa hover:bg-brand-beige transition-colors font-bold text-sm py-3.5 px-6 rounded flex items-center justify-center"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="font-serif italic text-brand-rose text-lg">Loading Confirmation Details... ♡</div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
