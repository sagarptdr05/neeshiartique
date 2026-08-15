'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle,
  Loader2,
  ChevronLeft,
  MapPin,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Order } from '@/data/mockData';
import { paymentStatusLabel, orderStatusLabel, hasTrackingInfo } from '@/lib/orderStatus';
import { buildOrderWhatsAppUrl } from '@/lib/whatsapp';
import OrderTimeline from '@/components/OrderTimeline';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** The headline the customer sees, driven entirely by the admin's decisions. */
function StatusBanner({ order }: { order: Order }) {
  if (order.order_status === 'cancelled') {
    return (
      <div className="rounded-lg border border-brand-rose/30 bg-brand-rose/5 p-5 sm:p-6 space-y-2">
        <h2 className="font-serif text-xl font-bold text-brand-rose flex items-center gap-2">
          <AlertTriangle size={20} /> Order Cancelled
        </h2>
        <p className="text-sm text-brand-cocoa/80">
          This order has been cancelled. Please contact Neeshiartique if you have any questions.
        </p>
      </div>
    );
  }

  // Confirmed only ever means the admin verified the payment by hand.
  if (order.confirmed_at) {
    return (
      <div className="rounded-lg border border-brand-sage/35 bg-brand-sage/5 p-5 sm:p-6 space-y-2">
        <h2 className="font-serif text-xl font-bold text-brand-cocoa flex items-center gap-2">
          <CheckCircle2 size={20} className="text-brand-sage" /> Order Confirmed ♡
        </h2>
        <p className="text-sm text-brand-cocoa/85">
          Your payment has been verified and your order is confirmed.
        </p>
        <p className="text-sm font-serif italic text-brand-rose">
          We&apos;re now preparing your handmade crochet creation.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-5 sm:p-6 space-y-2">
      <h2 className="font-serif text-xl font-bold text-brand-cocoa flex items-center gap-2">
        <Clock size={20} className="text-amber-600" /> Awaiting Confirmation
      </h2>
      <p className="text-sm text-brand-cocoa/85">
        We&apos;ve received your order. Your order will be confirmed once your payment has been
        received and verified.
      </p>
    </div>
  );
}

export default function CustomerOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
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
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center space-y-3 py-24 text-brand-rose">
          <Loader2 className="animate-spin" size={28} />
          <span className="font-serif italic">Loading your order... ♡</span>
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
        <main className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
          <span className="text-4xl text-brand-rose/60">✿</span>
          <h1 className="font-serif text-2xl font-bold text-brand-cocoa">Order not found</h1>
          <p className="text-sm text-brand-cocoa/75 max-w-sm">
            We couldn&apos;t find that order under your account.
          </p>
          <Link
            href="/account"
            className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-bold text-xs uppercase tracking-wider py-3 px-8 rounded shadow"
          >
            Back to My Account
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const awaitingPayment = order.payment_status === 'awaiting_payment';

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-8 w-full">

        <Link
          href="/account"
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-rose hover:text-brand-cocoa transition-colors"
        >
          <ChevronLeft size={14} /> My Orders
        </Link>

        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-brand-beige pb-5">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
              Order {order.id}
            </h1>
            <p className="text-xs text-brand-cocoa/60 font-medium">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-beige/50 text-brand-cocoa px-3 py-1.5 rounded">
              {orderStatusLabel(order.order_status)}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded ${
                order.payment_status === 'payment_verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.payment_status === 'payment_issue'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {paymentStatusLabel(order.payment_status)}
            </span>
          </div>
        </div>

        <StatusBanner order={order} />

        {/* Payment prompt while nothing has been received yet */}
        {awaitingPayment && order.order_status !== 'cancelled' && (
          <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="space-y-1 text-sm text-brand-cocoa/85">
              <h3 className="font-serif font-bold text-brand-cocoa">Payment Pending</h3>
              <p className="text-xs leading-relaxed max-w-lg">
                Send your order details on WhatsApp to receive the UPI/QR payment details for
                ₹{order.total}.
              </p>
            </div>
            <a
              href={buildOrderWhatsAppUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors font-bold text-xs uppercase tracking-wider py-3 px-6 rounded flex items-center justify-center gap-2 shadow-sm flex-shrink-0"
            >
              <MessageCircle size={15} />
              <span>Continue on WhatsApp</span>
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: timeline */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-7 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-3 mb-7">
                Order Timeline
              </h2>
              <OrderTimeline order={order} />
            </div>

            {/* Tracking */}
            {hasTrackingInfo(order) && (
              <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-3">
                <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center gap-2">
                  <Truck size={18} className="text-brand-rose" />
                  <span>Tracking Information</span>
                </h2>
                <dl className="text-sm space-y-2 text-brand-cocoa/85">
                  <div className="flex justify-between gap-4">
                    <dt className="font-bold text-brand-cocoa">Carrier</dt>
                    <dd>{order.carrier}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-bold text-brand-cocoa">Tracking Number</dt>
                    <dd className="font-mono text-right break-all">{order.tracking_number}</dd>
                  </div>
                  {order.shipping_date && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-bold text-brand-cocoa">Shipped On</dt>
                      <dd>{formatDate(order.shipping_date)}</dd>
                    </div>
                  )}
                </dl>
                {/* Only rendered when the owner has configured a real carrier link. */}
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center bg-brand-cocoa hover:bg-brand-rose text-brand-cream transition-colors font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded"
                  >
                    Track Shipment
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: items, totals, address */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                Order Details
              </h2>

              <div className="divide-y divide-brand-beige/30">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-11 h-13 min-h-[3.25rem] rounded border border-brand-beige/30 overflow-hidden bg-brand-cream flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="space-y-0.5 text-sm">
                        <h4 className="font-serif font-bold text-brand-cocoa leading-tight">{item.name}</h4>
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
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>

            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-3">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center gap-2">
                <MapPin size={18} className="text-brand-rose" />
                <span>Delivery Address</span>
              </h2>
              <div className="text-sm text-brand-cocoa/85 space-y-1">
                <p className="font-semibold text-brand-cocoa">{order.shipping_address.fullName}</p>
                <p>{order.shipping_address.address}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}
                </p>
                <p>
                  {order.shipping_address.country} - {order.shipping_address.pincode}
                </p>
                <p className="pt-1 text-xs">Phone: {order.shipping_address.phone}</p>
                <p className="text-xs">Email: {order.shipping_address.email}</p>
              </div>

              {order.customer_notes && (
                <p className="bg-brand-cream/60 p-3 rounded border border-brand-beige text-xs italic text-brand-cocoa/85">
                  <strong className="not-italic font-bold block text-brand-cocoa mb-0.5">
                    Order Notes:
                  </strong>
                  &ldquo;{order.customer_notes}&rdquo;
                </p>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
