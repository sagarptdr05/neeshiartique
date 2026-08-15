'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Truck, Loader2, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Order } from '@/data/mockData';
import { orderStatusLabel, paymentStatusLabel, hasTrackingInfo } from '@/lib/orderStatus';
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

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { orders, loadingOrders } = useStore();

  const [orderId, setOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Orders arrive from the server, so the lookup waits for them to load.
  useEffect(() => {
    const id = searchParams.get('id');
    if (!id || loadingOrders) return;

    setOrderId(id);
    const matched = orders.find((o) => o.id.toUpperCase() === id.trim().toUpperCase());
    setTrackedOrder(matched ?? null);
    setErrorMsg(matched ? '' : "We couldn't find an order with that ID under your account.");
  }, [searchParams, orders, loadingOrders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) return;

    setErrorMsg('');
    const matched = orders.find((o) => o.id.toUpperCase() === id.toUpperCase());
    if (matched) {
      setTrackedOrder(matched);
    } else {
      setTrackedOrder(null);
      setErrorMsg("We couldn't find an order with that ID under your account. Please check the ID and try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 flex-grow space-y-10 w-full">

        {/* Search */}
        <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 sm:p-8 shadow-sm space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
              Track Your Package
            </h1>
            <p className="text-xs sm:text-sm text-brand-cocoa/75 leading-relaxed">
              Enter your Order ID (e.g. NA-2026-00001) from your order confirmation to follow the
              crafting and delivery updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="NA-2026-00001"
              className="flex-grow bg-brand-cream border border-brand-beige text-brand-cocoa text-sm rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-rose placeholder-brand-cocoa/40 uppercase font-semibold"
            />
            <button
              type="submit"
              className="bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded flex items-center space-x-1.5 shadow-sm"
            >
              <Search size={14} />
              <span>Track</span>
            </button>
          </form>

          {loadingOrders && (
            <p className="text-xs text-brand-cocoa/60 font-medium text-center flex items-center justify-center gap-1.5">
              <Loader2 className="animate-spin" size={12} /> Loading your orders...
            </p>
          )}

          {errorMsg && !loadingOrders && (
            <p className="text-xs text-brand-rose font-semibold text-center mt-2">{errorMsg}</p>
          )}
        </div>

        {/* Results */}
        {trackedOrder && (
          <div className="space-y-8 animate-fade-in">

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-brand-beige/25 border border-brand-beige/40 rounded-lg p-4 sm:px-6">
              <div>
                <span className="text-[10px] font-bold text-brand-rose uppercase tracking-wider block">Current status</span>
                <span className="font-serif text-lg font-bold text-brand-cocoa">
                  {orderStatusLabel(trackedOrder.order_status)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cocoa/60 block">
                  Payment: {paymentStatusLabel(trackedOrder.payment_status)}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Placed on</span>
                <span className="text-xs font-semibold text-brand-cocoa/85">
                  {formatDate(trackedOrder.created_at)}
                </span>
              </div>
            </div>

            {/* Tracking details */}
            {hasTrackingInfo(trackedOrder) && (
              <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-3">
                <h2 className="font-serif text-base font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center gap-2">
                  <Truck size={17} className="text-brand-rose" />
                  <span>Tracking Information</span>
                </h2>
                <dl className="text-sm space-y-2 text-brand-cocoa/85">
                  <div className="flex justify-between gap-4">
                    <dt className="font-bold text-brand-cocoa">Carrier</dt>
                    <dd>{trackedOrder.carrier}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-bold text-brand-cocoa">Tracking Number</dt>
                    <dd className="font-mono text-right break-all">{trackedOrder.tracking_number}</dd>
                  </div>
                  {trackedOrder.shipping_date && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-bold text-brand-cocoa">Shipped On</dt>
                      <dd>{formatDate(trackedOrder.shipping_date)}</dd>
                    </div>
                  )}
                </dl>
                {trackedOrder.tracking_url && (
                  <a
                    href={trackedOrder.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center bg-brand-cocoa hover:bg-brand-rose text-brand-cream transition-colors font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded"
                  >
                    Track Shipment
                  </a>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-3 mb-8">
                Crafting &amp; Delivery Timeline
              </h2>
              <OrderTimeline order={trackedOrder} />
            </div>

            {/* Summary */}
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                Order Summary
              </h3>

              <div className="divide-y divide-brand-beige/20 text-xs">
                {trackedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2.5">
                    <span className="text-brand-cocoa/80 font-medium">
                      {item.name} {item.customization ? `(✿ ${item.customization})` : ''} × {item.quantity}
                    </span>
                    <span className="font-semibold text-brand-cocoa">₹{item.price * item.quantity}</span>
                  </div>
                ))}

                <div className="border-t border-brand-beige/40 pt-3 flex justify-between text-sm font-bold text-brand-cocoa">
                  <span>Order Total</span>
                  <span>₹{trackedOrder.total}</span>
                </div>
              </div>

              <Link
                href={`/account/orders/${encodeURIComponent(trackedOrder.id)}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-rose hover:text-brand-cocoa transition-colors"
              >
                <span>View full order details</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrder() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-cream">
          <div className="font-serif italic text-brand-rose text-lg">Loading Tracking Portal... ♡</div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
