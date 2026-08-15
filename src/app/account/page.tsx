'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ShoppingBag, MessageSquare, MapPin, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { orderStatusLabel, paymentStatusLabel } from '@/lib/orderStatus';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Account() {
  const router = useRouter();
  const { orders, loadingOrders, customOrders, user, loadingAuth, logout } = useStore();

  // Middleware already blocks signed-out visitors; this only covers a session
  // that expires while the page is open.
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login?redirect=/account');
    }
  }, [loadingAuth, user, router]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream text-brand-rose space-y-3 font-serif italic">
        <Loader2 className="animate-spin" size={26} />
        <span>Loading account details... ♡</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-rose font-serif italic">
        Redirecting to sign in... ♡
      </div>
    );
  }

  const firstName = user.name.split(' ')[0];

  // The most recent order's address doubles as the customer's saved address —
  // there is no separate address book, so nothing is ever invented here.
  const lastAddress = orders[0]?.shipping_address;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'pending_payment':
        return 'bg-amber-100 text-amber-800';
      case 'contacted':
      case 'in_discussion':
        return 'bg-purple-100 text-purple-800';
      case 'payment_received':
      case 'approved':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'being_crafted':
      case 'quality_check':
        return 'bg-brand-sage/10 text-brand-sage border border-brand-sage/20';
      case 'packed':
      case 'shipped':
        return 'bg-emerald-50 text-emerald-700';
      case 'completed':
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      {/* Header Banner */}
      <section className="bg-brand-beige/25 border-b border-brand-beige py-12 text-center relative overflow-hidden">
        <div className="absolute top-4 left-6 text-brand-rose/10 text-3xl font-serif select-none pointer-events-none">✿</div>
        <div className="absolute bottom-4 right-10 text-brand-rose/15 text-4xl font-serif select-none pointer-events-none">❀</div>

        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-rose uppercase">
            My Account
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-cocoa flex flex-col sm:flex-row items-center justify-center gap-3">
            <span>Welcome Back, {firstName}</span>
            <button
              onClick={logout}
              className="text-[10px] border border-brand-beige bg-brand-cream hover:bg-brand-rose hover:text-brand-cream transition-colors text-brand-cocoa py-1 px-3.5 rounded font-bold uppercase tracking-wider flex items-center space-x-1 shadow-sm"
            >
              <LogOut size={12} />
              <span>Log Out</span>
            </button>
          </h1>
          <p className="text-sm font-serif italic text-brand-rose">
            Manage your orders, customized requests, and details.
          </p>
          <div className="w-16 h-[1.5px] bg-brand-rose mx-auto mt-2" />
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-10 w-full">

        {/* Left: Profile summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center space-x-2">
              <User size={18} className="text-brand-rose" />
              <span>Personal Details</span>
            </h2>
            <div className="text-sm space-y-2 text-brand-cocoa/85">
              <p>
                <strong className="block font-bold text-brand-cocoa">Name:</strong>
                {user.name}
              </p>
              <p>
                <strong className="block font-bold text-brand-cocoa">Email:</strong>
                {user.email}
              </p>
              {user.phone && (
                <p>
                  <strong className="block font-bold text-brand-cocoa">Phone:</strong>
                  {user.phone}
                </p>
              )}
            </div>
          </div>

          <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center space-x-2">
              <MapPin size={18} className="text-brand-rose" />
              <span>Recent Delivery Address</span>
            </h2>
            {lastAddress ? (
              <div className="text-sm text-brand-cocoa/85 space-y-1">
                <p className="font-semibold text-brand-cocoa">{lastAddress.fullName}</p>
                <p>{lastAddress.address}</p>
                <p>{lastAddress.city}, {lastAddress.state}</p>
                <p>{lastAddress.country} - {lastAddress.pincode}</p>
              </div>
            ) : (
              <p className="text-xs italic text-brand-cocoa/60">
                You&apos;ll enter your delivery address at checkout, and it will appear here.
              </p>
            )}
          </div>
        </div>

        {/* Right: Orders and custom requests */}
        <div className="lg:col-span-8 space-y-10">

          <div className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa border-b border-brand-beige pb-3 flex items-center space-x-2.5">
              <ShoppingBag size={20} className="text-brand-rose" />
              <span>My Orders</span>
            </h2>

            {loadingOrders ? (
              <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-8 text-center text-sm italic text-brand-cocoa/60 flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={16} /> Loading your orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-8 text-center text-sm italic text-brand-cocoa/60">
                You haven&apos;t placed any orders yet. Visit our shop to find something beautiful! ♡
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-brand-beige rounded-lg bg-brand-offwhite p-4 sm:p-5 shadow-sm hover:shadow transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 text-xs text-brand-cocoa/80">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-sm font-bold text-brand-cocoa">{order.id}</span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${getStatusColor(order.order_status)}`}>
                          {orderStatusLabel(order.order_status)}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-brand-beige/60 text-brand-cocoa/80">
                          {paymentStatusLabel(order.payment_status)}
                        </span>
                      </div>
                      <p className="font-medium text-brand-rose">
                        {order.items.length} item(s) • Total: <strong>₹{order.total}</strong>
                      </p>
                      <p className="text-[10px] text-brand-cocoa/50">
                        Placed: {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      {order.tracking_number && (
                        <p className="text-[10px] font-semibold text-brand-cocoa/70">
                          {order.carrier} • Tracking: <span className="font-mono">{order.tracking_number}</span>
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/account/orders/${encodeURIComponent(order.id)}`}
                      className="text-xs font-bold text-brand-rose hover:text-brand-cocoa transition-colors flex items-center space-x-1 sm:self-center border border-brand-beige bg-brand-cream/80 hover:bg-brand-cream py-2 px-4 rounded shadow-sm whitespace-nowrap"
                    >
                      <span>View Order</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Requests */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa border-b border-brand-beige pb-3 flex items-center space-x-2.5">
              <MessageSquare size={20} className="text-brand-rose" />
              <span>Custom Order Requests</span>
            </h2>

            {customOrders.length === 0 ? (
              <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-8 text-center text-sm italic text-brand-cocoa/60">
                You haven&apos;t submitted any custom requests yet. Have an idea? Tell us about it! ♡
              </div>
            ) : (
              <div className="space-y-4">
                {customOrders.map((req) => (
                  <div
                    key={req.id}
                    className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-brand-beige/30 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-sm font-bold text-brand-cocoa">{req.id}</span>
                        <span className="text-xs text-brand-cocoa/60 font-medium">({req.productType})</span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded ${getStatusColor(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="block font-bold text-brand-cocoa/50 uppercase tracking-wider mb-0.5">Occasion</span>
                        <span className="font-semibold text-brand-cocoa/90">{req.occasion}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-brand-cocoa/50 uppercase tracking-wider mb-0.5">Budget</span>
                        <span className="font-semibold text-brand-cocoa/90">{req.budgetRange}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-brand-cocoa/50 uppercase tracking-wider mb-0.5">Required Date</span>
                        <span className="font-semibold text-brand-cocoa/90">{req.requiredDate}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-brand-cocoa/50 uppercase tracking-wider mb-0.5">Colors</span>
                        <span className="font-semibold text-brand-cocoa/90 truncate block">{req.preferredColor}</span>
                      </div>
                    </div>

                    <div className="text-xs text-brand-cocoa/80 bg-brand-cream/40 border border-brand-beige/50 p-3 rounded">
                      <strong className="block font-bold text-brand-cocoa mb-1">Details:</strong>
                      &ldquo;{req.customizationDetails}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
