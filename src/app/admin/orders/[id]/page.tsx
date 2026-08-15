'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ChevronLeft,
  MapPin,
  Truck,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Save,
  User,
} from 'lucide-react';
import { Order } from '@/data/mockData';
import {
  ADMIN_ACTION_LABELS,
  AdminOrderAction,
  CARRIER_OPTIONS,
  DEFAULT_CARRIER,
  hasTrackingInfo,
  nextWorkflowAction,
  orderStatusLabel,
  paymentStatusLabel,
  ORDER_STAGES,
} from '@/lib/orderStatus';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function formatDateTime(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Shipping form
  const [carrierChoice, setCarrierChoice] = useState(DEFAULT_CARRIER);
  const [customCarrier, setCustomCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingDate, setShippingDate] = useState(todayIso());
  const [trackingUrl, setTrackingUrl] = useState('');

  const applyOrderToForm = (loaded: Order) => {
    if (loaded.carrier) {
      const known = CARRIER_OPTIONS.includes(loaded.carrier) && loaded.carrier !== 'Other';
      setCarrierChoice(known ? loaded.carrier : 'Other');
      setCustomCarrier(known ? '' : loaded.carrier);
    }
    if (loaded.tracking_number) setTrackingNumber(loaded.tracking_number);
    if (loaded.shipping_date) setShippingDate(loaded.shipping_date);
    setTrackingUrl(loaded.tracking_url ?? '');
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
        const data = await res.json();
        if (cancelled) return;

        if (res.status === 401 || res.status === 403) {
          router.push('/login?redirect=/admin');
          return;
        }
        if (res.ok && data.success) {
          setOrder(data.order);
          applyOrderToForm(data.order);
        } else {
          setOrder(null);
        }
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
  }, [id, router]);

  const runAction = async (action: AdminOrderAction, payload: Record<string, unknown> = {}) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'That update could not be saved.');
        return;
      }

      setOrder(data.order);
      applyOrderToForm(data.order);
      setNotice(`${ADMIN_ACTION_LABELS[action]} — saved.`);
    } catch (err) {
      console.error('Order action failed:', err);
      setError('We could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const resolvedCarrier = carrierChoice === 'Other' ? customCarrier.trim() : carrierChoice;

  const trackingPayload = () => ({
    carrier: resolvedCarrier,
    tracking_number: trackingNumber.trim(),
    shipping_date: shippingDate,
    tracking_url: trackingUrl.trim(),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream text-brand-cocoa space-y-3 font-serif italic">
        <Loader2 className="animate-spin text-brand-rose" size={28} />
        <span>Loading order... ♡</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
          <h1 className="font-serif text-2xl font-bold text-brand-cocoa">Order not found</h1>
          <Link
            href="/admin"
            className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-bold text-xs uppercase tracking-wider py-3 px-8 rounded shadow"
          >
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const workflowAction = nextWorkflowAction(order);
  const stageIndex = ORDER_STAGES.indexOf(order.order_status);

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream/20">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-6">

        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-rose hover:text-brand-cocoa transition-colors"
        >
          <ChevronLeft size={14} /> Back to Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-brand-beige pb-5">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">{order.id}</h1>
            <p className="text-xs text-brand-cocoa/60 font-medium">
              Placed {formatDateTime(order.created_at)} • Last updated {formatDateTime(order.updated_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-beige/60 text-brand-cocoa px-3 py-1.5 rounded">
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

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded flex items-start gap-2 text-xs text-rose-800 font-semibold">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded flex items-start gap-2 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left column */}
          <div className="lg:col-span-7 space-y-6">

            {/* Products */}
            <section className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                Products
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-brand-cocoa/50 border-b border-brand-beige/40 uppercase font-bold">
                      <th className="pb-2">Product</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-beige/25">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 pr-3">
                          <span className="font-semibold text-brand-cocoa block">{item.name}</span>
                          {item.customization && (
                            <span className="text-[10px] text-brand-rose font-semibold">✿ {item.customization}</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center font-semibold">{item.quantity}</td>
                        <td className="py-2.5 text-right">₹{item.price}</td>
                        <td className="py-2.5 text-right font-bold text-brand-cocoa">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-brand-beige/50 pt-3 space-y-1.5 text-xs font-semibold max-w-xs ml-auto">
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
                <div className="flex justify-between text-sm font-bold text-brand-cocoa border-t border-brand-beige/40 pt-1.5">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </section>

            {/* Order status track */}
            <section className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                Order Status
              </h2>
              <ol className="space-y-2 text-xs">
                {ORDER_STAGES.map((stage, index) => {
                  const done = stageIndex >= 0 && index < stageIndex;
                  const current = index === stageIndex;
                  return (
                    <li
                      key={stage}
                      className={`flex items-center justify-between rounded px-3 py-2 border ${
                        current
                          ? 'bg-brand-rose/5 border-brand-rose/30 text-brand-cocoa font-bold'
                          : done
                          ? 'bg-brand-sage/5 border-brand-sage/20 text-brand-cocoa/80 font-semibold'
                          : 'bg-brand-cream/40 border-brand-beige/40 text-brand-cocoa/40'
                      }`}
                    >
                      <span>{orderStatusLabel(stage)}</span>
                      {(done || current) && (
                        <span className="text-[10px] font-medium text-brand-cocoa/55">
                          {formatDateTime(
                            {
                              pending_payment: order.created_at,
                              payment_received: order.payment_received_at,
                              confirmed: order.confirmed_at,
                              being_crafted: order.crafted_at,
                              quality_check: order.quality_checked_at,
                              packed: order.packed_at,
                              shipped: order.shipped_at,
                              delivered: order.delivered_at,
                              cancelled: order.cancelled_at,
                            }[stage]
                          )}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
              {order.order_status === 'cancelled' && (
                <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded p-3">
                  This order was cancelled on {formatDateTime(order.cancelled_at)}.
                </p>
              )}
            </section>

            {/* Shipping information */}
            <section className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center gap-2">
                <Truck size={18} className="text-brand-rose" />
                <span>Shipping Information</span>
              </h2>

              {hasTrackingInfo(order) ? (
                <p className="text-xs bg-brand-sage/5 border border-brand-sage/25 rounded p-3 text-brand-cocoa/85">
                  Tracking is live for this order: <strong>{order.carrier}</strong> •{' '}
                  <span className="font-mono">{order.tracking_number}</span>
                  {order.shipping_date && <> • shipped {order.shipping_date}</>}
                </p>
              ) : (
                <p className="text-xs italic text-brand-cocoa/60">
                  No tracking added yet. Enter the details below once the parcel has been handed over.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-brand-cocoa uppercase tracking-wider">Carrier</label>
                  <select
                    value={carrierChoice}
                    onChange={(e) => setCarrierChoice(e.target.value)}
                    className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-xs font-semibold text-brand-cocoa focus:outline-none focus:border-brand-rose"
                  >
                    {CARRIER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {carrierChoice === 'Other' && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-brand-cocoa uppercase tracking-wider">Custom Carrier</label>
                    <input
                      type="text"
                      value={customCarrier}
                      onChange={(e) => setCustomCarrier(e.target.value)}
                      placeholder="Carrier name"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-xs text-brand-cocoa focus:outline-none focus:border-brand-rose"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-brand-cocoa uppercase tracking-wider">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. EX123456789IN"
                    className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-xs font-mono text-brand-cocoa focus:outline-none focus:border-brand-rose"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-brand-cocoa uppercase tracking-wider">Shipping Date</label>
                  <input
                    type="date"
                    value={shippingDate}
                    onChange={(e) => setShippingDate(e.target.value)}
                    className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-xs text-brand-cocoa focus:outline-none focus:border-brand-rose"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-brand-cocoa uppercase tracking-wider">
                    Tracking Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-xs text-brand-cocoa focus:outline-none focus:border-brand-rose"
                  />
                  <p className="text-[10px] text-brand-cocoa/55">
                    Leave blank to show the customer the tracking number only. Add a link here and a
                    &ldquo;Track Shipment&rdquo; button appears on their order.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => runAction('save_tracking', trackingPayload())}
                  disabled={busy}
                  className="bg-brand-cocoa hover:bg-brand-rose disabled:opacity-60 text-brand-cream transition-colors font-bold text-[11px] uppercase tracking-wider py-2.5 px-5 rounded flex items-center gap-1.5"
                >
                  <Save size={13} />
                  {hasTrackingInfo(order) ? 'Update Tracking Information' : 'Add Tracking Information'}
                </button>
                {hasTrackingInfo(order) && (
                  <button
                    onClick={() => runAction('remove_tracking')}
                    disabled={busy}
                    className="border border-rose-200 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-700 transition-colors font-bold text-[11px] uppercase tracking-wider py-2.5 px-5 rounded flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    Remove Tracking
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-6">

            {/* Payment */}
            <section className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center gap-2">
                <IndianRupee size={17} className="text-brand-rose" />
                <span>Payment</span>
              </h2>

              <div className="text-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cocoa/50 block">Status</span>
                <span className="font-serif text-lg font-bold text-brand-cocoa">
                  {paymentStatusLabel(order.payment_status)}
                </span>
              </div>

              <dl className="text-xs space-y-1.5 text-brand-cocoa/75 border-t border-brand-beige/40 pt-3">
                <div className="flex justify-between gap-3">
                  <dt className="font-bold text-brand-cocoa">Amount</dt>
                  <dd className="font-bold">₹{order.total}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-bold text-brand-cocoa">Payment received</dt>
                  <dd>{formatDateTime(order.payment_received_at)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-bold text-brand-cocoa">Verified &amp; confirmed</dt>
                  <dd>{formatDateTime(order.confirmed_at)}</dd>
                </div>
              </dl>

              <p className="text-[10px] text-brand-cocoa/55 leading-relaxed border-t border-brand-beige/40 pt-3">
                Payment is collected manually over UPI/WhatsApp. Only mark it received once the money
                is actually in your account.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runAction('flag_payment_issue')}
                  disabled={busy || order.payment_status === 'payment_issue'}
                  className="border border-amber-200 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-800 transition-colors font-bold text-[10px] uppercase tracking-wider py-2 px-3.5 rounded"
                >
                  Flag Payment Issue
                </button>
                <button
                  onClick={() => runAction('mark_refunded')}
                  disabled={busy || order.payment_status === 'refunded'}
                  className="border border-brand-beige bg-brand-cream hover:bg-brand-beige/50 disabled:opacity-50 text-brand-cocoa transition-colors font-bold text-[10px] uppercase tracking-wider py-2 px-3.5 rounded"
                >
                  Mark Refunded
                </button>
              </div>
            </section>

            {/* Admin actions */}
            <section className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                Admin Actions
              </h2>

              {workflowAction ? (
                <>
                  <button
                    onClick={() =>
                      runAction(
                        workflowAction,
                        // Shipping can carry the tracking details in one step.
                        workflowAction === 'mark_shipped' && trackingNumber.trim()
                          ? trackingPayload()
                          : {}
                      )
                    }
                    disabled={busy}
                    className="w-full bg-brand-rose hover:bg-brand-cocoa disabled:opacity-60 text-brand-cream transition-colors font-bold text-sm py-3.5 px-5 rounded flex items-center justify-center gap-2 shadow-sm"
                  >
                    {busy ? <Loader2 className="animate-spin" size={15} /> : null}
                    <span>{ADMIN_ACTION_LABELS[workflowAction]}</span>
                  </button>
                  {workflowAction === 'mark_shipped' && (
                    <p className="text-[10px] text-brand-cocoa/60 leading-relaxed">
                      Tracking details filled in on the left are saved along with this step. You can
                      also add or edit them afterwards.
                    </p>
                  )}
                  {workflowAction === 'confirm_order' && (
                    <p className="text-[10px] text-brand-cocoa/60 leading-relaxed">
                      Confirming marks the payment verified and tells the customer their order is
                      confirmed.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs italic text-brand-cocoa/60">
                  {order.order_status === 'delivered'
                    ? 'This order is complete. ♡'
                    : 'No further workflow steps available for this order.'}
                </p>
              )}

              {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
                <button
                  onClick={() => runAction('cancel_order')}
                  disabled={busy}
                  className="w-full border border-rose-200 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-700 transition-colors font-bold text-[11px] uppercase tracking-wider py-2.5 px-5 rounded"
                >
                  Cancel Order
                </button>
              )}
            </section>

            {/* Customer */}
            <section className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-3">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center gap-2">
                <User size={17} className="text-brand-rose" />
                <span>Customer</span>
              </h2>
              <div className="text-sm text-brand-cocoa/85 space-y-1">
                <p className="font-semibold text-brand-cocoa">{order.shipping_address.fullName}</p>
                <p className="text-xs">{order.shipping_address.email}</p>
                <p className="text-xs">{order.shipping_address.phone}</p>
                <p className="text-[10px] text-brand-cocoa/50 pt-1">Account: {order.customer_id}</p>
              </div>
            </section>

            {/* Address */}
            <section className="bg-brand-offwhite border border-brand-beige rounded-lg p-5 shadow-sm space-y-3">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center gap-2">
                <MapPin size={17} className="text-brand-rose" />
                <span>Delivery Address</span>
              </h2>
              <div className="text-sm text-brand-cocoa/85 space-y-1">
                <p>{order.shipping_address.address}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}
                </p>
                <p>
                  {order.shipping_address.country} - {order.shipping_address.pincode}
                </p>
              </div>
              {order.customer_notes && (
                <p className="bg-brand-cream/60 p-3 rounded border border-brand-beige text-xs italic text-brand-cocoa/85">
                  <strong className="not-italic font-bold block text-brand-cocoa mb-0.5">Order Notes:</strong>
                  &ldquo;{order.customer_notes}&rdquo;
                </p>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
