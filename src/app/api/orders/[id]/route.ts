import { NextResponse } from 'next/server';
import { Order, OrderItem, INITIAL_PRODUCTS } from '@/data/mockData';
import { getSessionUser, customerIdFor, isAdmin } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { readOrders, writeOrders, findOrder } from '@/lib/orderStore';
import fs from 'fs';
import path from 'path';

const TRACKING_NUMBER_PATTERN = /^[A-Za-z0-9-]{4,40}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type RawRecord = Record<string, unknown>;

const asRecord = (value: unknown): RawRecord =>
  value && typeof value === 'object' ? (value as RawRecord) : {};

const asTrimmed = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function trackingFromPayload(input: unknown): any {
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
    tracking_url: trackingUrl || null,
  };
}

// Helper to format Supabase order row back to frontend Order shape
async function formatDbOrder(o: any, sessionUser: any): Promise<Order> {
  return {
    id: o.order_number,
    customer_id: o.customer_id,
    subtotal: o.subtotal,
    shipping: o.shipping_amount,
    discount: o.discount_amount,
    total: o.total,
    payment_status: o.payment_status,
    order_status: o.order_status,
    customer_notes: o.customer_notes || undefined,
    created_at: o.created_at,
    updated_at: o.updated_at,
    carrier: o.carrier || undefined,
    tracking_number: o.tracking_number || undefined,
    shipping_date: o.shipping_date || undefined,
    tracking_url: o.tracking_url || undefined,
    shipping_address: {
      fullName: o.shipping_address.split('\n')[0] || '',
      email: sessionUser.email,
      phone: '',
      address: o.shipping_address,
      city: o.shipping_city,
      state: o.shipping_state,
      pincode: o.shipping_pincode,
      country: 'India',
    },
    items: (o.order_items || []).map((item: any) => ({
      productId: item.product_id,
      name: item.product_name,
      quantity: item.quantity,
      price: item.unit_price,
      image: '',
    })),
  };
}

// GET: The order's owner, or any admin
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Fetch order from Supabase
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      const { data: dbOrder, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .or(`order_number.eq.${id},id.eq.${id}`)
        .maybeSingle();

      if (error || !dbOrder) {
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      }

      // Authorization check
      if (user.role !== 'admin') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (!profile || dbOrder.customer_id !== profile.id) {
          return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }
      }

      const order = await formatDbOrder(dbOrder, user);
      return NextResponse.json({ success: true, order });
    }

    // 2. Fallback Mode: Fetch from local JSON simulated database
    const order = findOrder(readOrders(), id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && order.customer_id !== customerIdFor(user)) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Fetch order detail error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const now = new Date().toISOString();

    const reject = (message: string) =>
      NextResponse.json({ success: false, message }, { status: 409 });

    // 1. Dynamic Mode: Update order state in Supabase
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      const { data: dbOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .or(`order_number.eq.${id},id.eq.${id}`)
        .maybeSingle();

      if (fetchError || !dbOrder) {
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      }

      let changes: any = {};

      switch (action) {
        case 'mark_payment_received':
          if (dbOrder.payment_status !== 'awaiting_payment' && dbOrder.payment_status !== 'payment_issue') {
            return reject('This order is not awaiting payment.');
          }
          changes = {
            payment_status: 'payment_received',
            payment_received_at: now,
            order_status: dbOrder.order_status === 'pending_payment' ? 'payment_received' : dbOrder.order_status,
          };
          break;

        case 'confirm_order':
          if (dbOrder.payment_status !== 'payment_received' && dbOrder.payment_status !== 'payment_verified') {
            return reject('Mark the payment as received before confirming this order.');
          }
          if (dbOrder.order_status === 'cancelled') {
            return reject('This order has been cancelled.');
          }
          changes = {
            payment_status: 'payment_verified',
            order_status: 'confirmed',
            confirmed_at: now,
          };
          break;

        case 'start_crafting':
          if (dbOrder.order_status !== 'confirmed') {
            return reject('Confirm the order before starting to craft it.');
          }
          changes = { order_status: 'being_crafted', crafting_started_at: now };
          break;

        case 'mark_quality_checked':
          if (dbOrder.order_status !== 'being_crafted') {
            return reject('This order is not currently being crafted.');
          }
          changes = { order_status: 'quality_check', quality_checked_at: now };
          break;

        case 'mark_packed':
          if (dbOrder.order_status !== 'quality_check') {
            return reject('Complete the quality check before packing this order.');
          }
          changes = { order_status: 'packed', packed_at: now };
          break;

        case 'mark_shipped':
          if (dbOrder.order_status !== 'packed') {
            return reject('Pack the order before marking it shipped.');
          }
          changes = { order_status: 'shipped', shipped_at: now };

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

        case 'mark_delivered':
          if (dbOrder.order_status !== 'shipped') {
            return reject('Only a shipped order can be marked delivered.');
          }
          changes = { order_status: 'delivered', delivered_at: now };
          break;

        case 'cancel_order':
          if (dbOrder.order_status === 'delivered') {
            return reject('A delivered order cannot be cancelled.');
          }
          changes = { order_status: 'cancelled', cancelled_at: now };
          break;

        case 'flag_payment_issue':
          changes = { payment_status: 'payment_issue' };
          break;

        case 'mark_refunded':
          changes = { payment_status: 'refunded' };
          break;

        case 'save_tracking':
          const tracking = trackingFromPayload(body);
          if ('error' in tracking) {
            return NextResponse.json({ success: false, message: tracking.error }, { status: 400 });
          }
          changes = tracking;
          break;

        case 'remove_tracking':
          changes = {
            carrier: null,
            tracking_number: null,
            shipping_date: null,
            tracking_url: null,
          };
          break;

        default:
          return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
      }

      const { data: updatedDbOrder, error: updateError } = await supabase
        .from('orders')
        .update({ ...changes, updated_at: now })
        .eq('id', dbOrder.id)
        .select('*, order_items(*)')
        .single();

      if (updateError || !updatedDbOrder) {
        return NextResponse.json({ success: false, message: updateError?.message || 'Failed to update order' }, { status: 500 });
      }

      const order = await formatDbOrder(updatedDbOrder, user);
      return NextResponse.json({ success: true, order });
    }

    // 2. Fallback Mode: Update order in local JSON database
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id.toUpperCase() === id.trim().toUpperCase());
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const order = orders[index];
    let changes: Partial<Order> = {};

    switch (action) {
      case 'mark_payment_received':
        if (order.payment_status !== 'awaiting_payment' && order.payment_status !== 'payment_issue') {
          return reject('This order is not awaiting payment.');
        }
        changes = {
          payment_status: 'payment_received',
          payment_received_at: now,
          order_status: order.order_status === 'pending_payment' ? 'payment_received' : order.order_status,
        };
        break;

      case 'confirm_order':
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

      case 'start_crafting':
        if (order.order_status !== 'confirmed') {
          return reject('Confirm the order before starting to craft it.');
        }
        changes = { order_status: 'being_crafted', crafted_at: now };
        break;

      case 'mark_quality_checked':
        if (order.order_status !== 'being_crafted') {
          return reject('This order is not currently being crafted.');
        }
        changes = { order_status: 'quality_check', quality_checked_at: now };
        break;

      case 'mark_packed':
        if (order.order_status !== 'quality_check') {
          return reject('Complete the quality check before packing this order.');
        }
        changes = { order_status: 'packed', packed_at: now };
        break;

      case 'mark_shipped':
        if (order.order_status !== 'packed') {
          return reject('Pack the order before marking it shipped.');
        }
        changes = { order_status: 'shipped', shipped_at: now };

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

      case 'mark_delivered':
        if (order.order_status !== 'shipped') {
          return reject('Only a shipped order can be marked delivered.');
        }
        changes = { order_status: 'delivered', delivered_at: now };
        break;

      case 'cancel_order':
        if (order.order_status === 'delivered') {
          return reject('A delivered order cannot be cancelled.');
        }
        changes = { order_status: 'cancelled', cancelled_at: now };
        break;

      case 'flag_payment_issue':
        changes = { payment_status: 'payment_issue' };
        break;

      case 'mark_refunded':
        changes = { payment_status: 'refunded' };
        break;

      case 'save_tracking':
        const tracking = trackingFromPayload(body);
        if ('error' in tracking) {
          return NextResponse.json({ success: false, message: tracking.error }, { status: 400 });
        }
        changes = tracking;
        break;

      case 'remove_tracking':
        changes = {
          carrier: undefined,
          tracking_number: undefined,
          shipping_date: undefined,
          tracking_url: undefined,
        };
        break;

      default:
        return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
    }

    const updated: Order = { ...order, ...changes, updated_at: now };

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
