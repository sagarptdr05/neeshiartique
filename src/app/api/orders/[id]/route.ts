import { NextResponse } from 'next/server';
import { Order } from '@/data/mockData';
import { getSessionUser, customerIdFor } from '@/lib/session';
import { readOrders, writeOrders, findOrder } from '@/lib/orderStore';

/**
 * Single-order read plus the admin-only state machine. Every transition that
 * marks payment or confirms an order lives here and is gated on the admin
 * role — an order can never confirm itself as a side effect of checkout.
 */

const TRACKING_NUMBER_PATTERN = /^[A-Za-z0-9-]{4,40}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type RawRecord = Record<string, unknown>;

const asRecord = (value: unknown): RawRecord =>
  value && typeof value === 'object' ? (value as RawRecord) : {};

const asTrimmed = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function trackingFromPayload(input: unknown): Partial<Order> | { error: string } {
  const payload = asRecord(input);
  const carrier = asTrimmed(payload.carrier);
  const trackingNumber = asTrimmed(payload.tracking_number);
  const shippingDate = asTrimmed(payload.shipping_date);
  const trackingUrl = asTrimmed(payload.tracking_url);

  if (!carrier) return { error: 'Please choose or enter a carrier.' };
  if (carrier.length > 60) return { error: 'Carrier name is too long.' };
  if (!TRACKING_NUMBER_PATTERN.test(trackingNumber)) {
    return { error: 'Please enter a valid tracking number (letters, numbers and dashes).' };
  }
  if (!DATE_PATTERN.test(shippingDate) || Number.isNaN(new Date(shippingDate).getTime())) {
    return { error: 'Please enter a valid shipping date.' };
  }
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    return { error: 'A tracking link must start with http:// or https://.' };
  }

  return {
    carrier,
    tracking_number: trackingNumber,
    shipping_date: shippingDate,
    tracking_url: trackingUrl || undefined,
  };
}

// GET: The order's owner, or any admin
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const order = findOrder(readOrders(), id);
  if (!order) {
    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  }

  if (user.role !== 'admin' && order.customer_id !== customerIdFor(user)) {
    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}

// PATCH: Advance the workflow or edit shipping details (Admin only)
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = body?.action;

    const orders = readOrders();
    const index = orders.findIndex((o) => o.id.toUpperCase() === id.trim().toUpperCase());
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const order = orders[index];
    const now = new Date().toISOString();
    let changes: Partial<Order> = {};

    const reject = (message: string) =>
      NextResponse.json({ success: false, message }, { status: 409 });

    switch (action) {
      case 'mark_payment_received': {
        if (order.payment_status !== 'awaiting_payment' && order.payment_status !== 'payment_issue') {
          return reject('This order is not awaiting payment.');
        }
        changes = {
          payment_status: 'payment_received',
          payment_received_at: now,
          // Only nudge the fulfilment status if it is still at the first stage.
          order_status: order.order_status === 'pending_payment' ? 'payment_received' : order.order_status,
        };
        break;
      }

      case 'confirm_order': {
        if (order.payment_status !== 'payment_received' && order.payment_status !== 'payment_verified') {
          return reject('Mark the payment as received before confirming this order.');
        }
        if (order.order_status === 'cancelled') {
          return reject('This order has been cancelled.');
        }
        changes = {
          payment_status: 'payment_verified',
          order_status: 'confirmed',
          confirmed_at: now,
        };
        break;
      }

      case 'start_crafting': {
        if (order.order_status !== 'confirmed') {
          return reject('Confirm the order before starting to craft it.');
        }
        changes = { order_status: 'being_crafted', crafted_at: now };
        break;
      }

      case 'mark_quality_checked': {
        if (order.order_status !== 'being_crafted') {
          return reject('This order is not currently being crafted.');
        }
        changes = { order_status: 'quality_check', quality_checked_at: now };
        break;
      }

      case 'mark_packed': {
        if (order.order_status !== 'quality_check') {
          return reject('Complete the quality check before packing this order.');
        }
        changes = { order_status: 'packed', packed_at: now };
        break;
      }

      case 'mark_shipped': {
        if (order.order_status !== 'packed') {
          return reject('Pack the order before marking it shipped.');
        }
        changes = { order_status: 'shipped', shipped_at: now };

        // Tracking details are optional at ship time and can be added later.
        const hasTrackingPayload =
          body?.carrier || body?.tracking_number || body?.shipping_date || body?.tracking_url;
        if (hasTrackingPayload) {
          const tracking = trackingFromPayload(body);
          if ('error' in tracking) {
            return NextResponse.json({ success: false, message: tracking.error }, { status: 400 });
          }
          changes = { ...changes, ...tracking };
        }
        break;
      }

      case 'mark_delivered': {
        if (order.order_status !== 'shipped') {
          return reject('Only a shipped order can be marked delivered.');
        }
        changes = { order_status: 'delivered', delivered_at: now };
        break;
      }

      case 'cancel_order': {
        if (order.order_status === 'delivered') {
          return reject('A delivered order cannot be cancelled.');
        }
        changes = { order_status: 'cancelled', cancelled_at: now };
        break;
      }

      case 'flag_payment_issue': {
        changes = { payment_status: 'payment_issue' };
        break;
      }

      case 'mark_refunded': {
        changes = { payment_status: 'refunded' };
        break;
      }

      case 'save_tracking': {
        const tracking = trackingFromPayload(body);
        if ('error' in tracking) {
          return NextResponse.json({ success: false, message: tracking.error }, { status: 400 });
        }
        changes = tracking;
        break;
      }

      case 'remove_tracking': {
        changes = {
          carrier: undefined,
          tracking_number: undefined,
          shipping_date: undefined,
          tracking_url: undefined,
        };
        break;
      }

      default:
        return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
    }

    const updated: Order = { ...order, ...changes, updated_at: now };

    // `remove_tracking` relies on the keys actually disappearing from storage.
    if (action === 'remove_tracking') {
      delete updated.carrier;
      delete updated.tracking_number;
      delete updated.shipping_date;
      delete updated.tracking_url;
    }

    orders[index] = updated;
    writeOrders(orders);

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Update order API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
