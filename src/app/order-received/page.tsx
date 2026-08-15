'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { MessageCircle, Clock, Loader2, ChevronRight } from 'lucide-react';
import { Order } from '@/data/mockData';
import { buildOrderWhatsAppUrl } from '@/lib/whatsapp';
import { BRAND_CONFIG } from '@/config/brand';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function OrderReceivedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<Order | null>(null);
  // Nothing to fetch without a reference, so start settled in that case.
  const [loading, setLoading] = useState(Boolean(orderId));
  const autoOpened = useRef(false);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (!cancelled) setOrder(res.ok && data.success ? data.order : null);
      } catch (err) {
        console.error('Failed to load order:', err);
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Best-effort: try to hand the customer straight to WhatsApp once. Browsers
  // often block a popup that isn't opened from a click, which is exactly why
  // the "Continue on WhatsApp" button below is always available.
  useEffect(() => {
    if (!order || autoOpened.current) return;
    autoOpened.current = true;
    window.open(buildOrderWhatsAppUrl(order), '_blank', 'noopener,noreferrer');
  }, [order]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center space-y-3 py-24 text-brand-rose">
          <Loader2 className="animate-spin" size={28} />
          <span className="font-serif italic">Fetching your order details... ♡</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
          <span className="text-4xl text-brand-rose/60">✿</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
            We couldn&apos;t find that order
          </h1>
          <p className="text-sm text-brand-cocoa/75 max-w-sm">
            This order reference doesn&apos;t belong to your account. Please check your orders, or
            reach out to us on WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => router.push('/account')}
              className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-bold text-xs uppercase tracking-wider py-3 px-8 rounded shadow"
            >
              My Orders
            </button>
            <button
              onClick={() => router.push('/shop')}
              className="border border-brand-beige bg-brand-offwhite text-brand-cocoa hover:bg-brand-beige transition-colors font-bold text-xs uppercase tracking-wider py-3 px-8 rounded"
            >
              Back to Shop
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const whatsappUrl = buildOrderWhatsAppUrl(order);

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16 flex-grow space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-brand-rose/10 text-brand-rose">
            <Clock size={44} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cocoa">
            Order Received ♡
          </h1>
          <p className="text-sm text-brand-cocoa/80">
            Your order has been created successfully.
          </p>
          <p className="text-sm font-bold uppercase tracking-wider text-brand-rose">
            Order ID: {order.id}
          </p>
          <div className="w-16 h-[1.5px] bg-brand-rose mx-auto mt-2" />
        </div>

        {/* What happens next */}
        <div className="bg-brand-rose/5 border border-brand-rose/20 rounded-lg p-5 sm:p-6 space-y-3 text-sm leading-relaxed text-brand-cocoa/85">
          <h2 className="font-serif text-base font-bold text-brand-cocoa">What happens next</h2>
          <p>
            Please send the order details through WhatsApp and complete the payment using the
            QR/payment details provided by Neeshiartique. Your order will be confirmed once the
            payment is received and verified.
          </p>
          <p className="text-xs text-brand-cocoa/65">
            Tapping the button below opens WhatsApp with your order message ready to send to{' '}
            {BRAND_CONFIG.phoneFormatted}. You still need to press send inside WhatsApp yourself.
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors font-bold text-sm py-3.5 px-6 rounded flex items-center justify-center space-x-2 shadow"
          >
            <MessageCircle size={16} />
            <span>Continue on WhatsApp</span>
          </a>
          <Link
            href={`/account/orders/${encodeURIComponent(order.id)}`}
            className="bg-brand-offwhite border border-brand-beige text-brand-cocoa hover:bg-brand-beige transition-colors font-bold text-sm py-3.5 px-6 rounded flex items-center justify-center space-x-1.5"
          >
            <span>View My Order</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Order summary */}
        <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-brand-beige/50 pb-2">
            <h2 className="font-serif text-lg font-bold text-brand-cocoa">Order Summary</h2>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded">
              Awaiting Payment
            </span>
          </div>

          <div className="divide-y divide-brand-beige/30">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-14 rounded border border-brand-beige/30 overflow-hidden bg-brand-cream flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
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
              <span>Amount Payable</span>
              <span>₹{order.total}</span>
            </div>
          </div>

          <div className="text-xs text-brand-cocoa/80 border-t border-brand-beige/40 pt-4 space-y-1">
            <strong className="block font-bold text-brand-cocoa">Delivering to</strong>
            <p>{order.shipping_address.fullName}</p>
            <p>
              {order.shipping_address.address}, {order.shipping_address.city},{' '}
              {order.shipping_address.state} - {order.shipping_address.pincode}
            </p>
            <p>Phone: {order.shipping_address.phone}</p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function OrderReceived() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-cream">
          <div className="font-serif italic text-brand-rose text-lg">Loading your order... ♡</div>
        </div>
      }
    >
      <OrderReceivedContent />
    </Suspense>
  );
}
