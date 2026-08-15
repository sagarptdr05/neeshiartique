'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Clock, Calendar, Check, Gift, Package, Truck, Smile } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Order } from '@/data/mockData';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { orders } = useStore();
  
  const [orderId, setOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-search if query param present
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setOrderId(id);
      handleSearch(id);
    }
  }, [searchParams, orders]);

  const handleSearch = (id: string) => {
    setErrorMsg('');
    const matched = orders.find((o) => o.id.toUpperCase() === id.trim().toUpperCase());
    if (matched) {
      setTrackedOrder(matched);
    } else {
      setTrackedOrder(null);
      setErrorMsg('We couldn\'t find an order with that ID. Please check the ID and try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      handleSearch(orderId.trim());
    }
  };

  // Define tracking status mapping
  const statuses: { key: Order['order_status']; label: string; desc: string; icon: any }[] = [
    {
      key: 'pending',
      label: 'Order Placed',
      desc: 'Your order has been recorded in our system.',
      icon: Calendar,
    },
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      desc: 'Payment cleared. Crafting materials prepared.',
      icon: Check,
    },
    {
      key: 'being_crafted',
      label: 'Being Crafted',
      desc: 'Neeshita is stitching/painting your custom piece.',
      icon: Gift,
    },
    {
      key: 'packed',
      label: 'Packed & Sealed',
      desc: 'Wrapped in kraft box with ribbon and dried sprig.',
      icon: Package,
    },
    {
      key: 'shipped',
      label: 'Package Shipped',
      desc: 'Dispatched via local post/courier. Tracking emailed.',
      icon: Truck,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      desc: 'Your little parcel has arrived! ♡',
      icon: Smile,
    },
  ];

  // Helper to determine status index
  const getStatusIndex = (currentStatus: Order['order_status']) => {
    if (currentStatus === 'cancelled') return -1;
    return statuses.findIndex((s) => s.key === currentStatus);
  };

  const currentIdx = trackedOrder ? getStatusIndex(trackedOrder.order_status) : -1;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Track Layout */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-grow space-y-10">
        
        {/* Search Header card */}
        <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 sm:p-8 shadow-sm space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
              Track Your Package
            </h1>
            <p className="text-xs sm:text-sm text-brand-cocoa/75 leading-relaxed">
              Enter your Order Reference ID (e.g. ORD-9872) from your confirmation receipt or email to see the custom crafting updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-9872"
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

          {errorMsg && (
            <p className="text-xs text-brand-rose font-semibold text-center mt-2">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Track Results Timeline */}
        {trackedOrder && (
          <div className="space-y-10 animate-fade-in">
            {/* Status Summary bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-brand-beige/25 border border-brand-beige/40 rounded-lg p-4 sm:px-6">
              <div>
                <span className="text-[10px] font-bold text-brand-rose uppercase tracking-wider block">Currently status</span>
                <span className="font-serif text-lg font-bold text-brand-cocoa uppercase">
                  {trackedOrder.order_status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-brand-cocoa/50 uppercase tracking-wider block">Created at</span>
                <span className="text-xs font-semibold text-brand-cocoa/85">
                  {new Date(trackedOrder.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Vertical timeline timeline stepper */}
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-3 mb-8">
                Crafting & Delivery Timeline
              </h2>

              {trackedOrder.order_status === 'cancelled' ? (
                <div className="text-center py-6 space-y-2 text-brand-rose font-semibold">
                  <p>This order has been cancelled.</p>
                  <p className="text-xs text-brand-cocoa/70 font-medium">Please contact Neeshiartique support for details.</p>
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-brand-beige">
                  {statuses.map((step, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isActive = idx === currentIdx;
                    const IconComponent = step.icon;

                    // Highlight "Being Crafted" as a special crafting indicator
                    const isCrafting = step.key === 'being_crafted';

                    return (
                      <div key={step.key} className="relative flex items-start space-x-4">
                        {/* Bullet point node */}
                        <div
                          className={`absolute -left-[20px] sm:-left-[24px] top-1 p-1 rounded-full border transition-all duration-300 ${
                            isCompleted
                              ? 'bg-brand-rose border-brand-rose text-brand-cream shadow-sm'
                              : isActive
                              ? 'bg-brand-cocoa border-brand-cocoa text-brand-cream animate-pulse shadow-md'
                              : isCrafting
                              ? 'bg-brand-sage/20 border-brand-sage text-brand-sage'
                              : 'bg-brand-cream border-brand-beige text-brand-cocoa/40'
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            {isCompleted ? <Check size={10} strokeWidth={3} /> : <IconComponent size={10} />}
                          </div>
                        </div>

                        {/* Text description */}
                        <div className="space-y-1">
                          <h3
                            className={`font-serif text-base font-bold leading-none ${
                              isActive
                                ? 'text-brand-rose font-extrabold'
                                : isCompleted
                                ? 'text-brand-cocoa font-semibold'
                                : 'text-brand-cocoa/50 font-normal'
                            } ${isCrafting && isActive ? 'text-brand-sage' : ''}`}
                          >
                            {step.label}
                            {isCrafting && (
                              <span className="text-[10px] font-bold bg-brand-sage/10 text-brand-sage tracking-wider px-2 py-0.5 rounded-full ml-2 uppercase">
                                Crafting Stage
                              </span>
                            )}
                          </h3>
                          <p
                            className={`text-xs ${
                              isActive
                                ? 'text-brand-cocoa font-medium'
                                : isCompleted
                                ? 'text-brand-cocoa/85'
                                : 'text-brand-cocoa/40'
                            }`}
                          >
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sub-order Summary verify items */}
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                Order Verification Summary
              </h3>
              
              <div className="divide-y divide-brand-beige/20 text-xs">
                {trackedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2.5">
                    <span className="text-brand-cocoa/80 font-medium">
                      {item.name} {item.customization ? `(✿ ${item.customization})` : ''} x {item.quantity}
                    </span>
                    <span className="font-semibold text-brand-cocoa">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                
                <div className="border-t border-brand-beige/40 pt-3 flex justify-between text-sm font-bold text-brand-cocoa">
                  <span>Grand Total Paid</span>
                  <span>₹{trackedOrder.total}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function TrackOrder() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="font-serif italic text-brand-rose text-lg">Loading Tracking Portal... ♡</div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
