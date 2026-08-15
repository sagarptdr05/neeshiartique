import { NextResponse } from 'next/server';
import { Order, OrderItem, INITIAL_PRODUCTS, INITIAL_COUPONS } from '@/data/mockData';
import { calculateShipping, calculateCouponDiscount, calculateTotal } from '@/lib/pricing';
import { getSessionUser, customerIdFor } from '@/lib/session';
import {
  readOrders,
  writeOrders,
  generateOrderId,
  findByIdempotencyKey,
} from '@/lib/orderStore';

/**
 * Order intake for the manual-payment workflow. Creating an order never marks
 * it paid or confirmed — it only records what the customer asked for so the
 * owner can collect payment over WhatsApp and confirm it by hand.
 */

const sanitize = (value: string) => value.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();

/** Request bodies arrive untyped; read them through a narrowed record. */
type RawRecord = Record<string, unknown>;

const asRecord = (value: unknown): RawRecord =>
  value && typeof value === 'object' ? (value as RawRecord) : {};

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[0-9][0-9\s-]{6,14}$/;
const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;

interface ValidationFailure {
  message: string;
  status: number;
}

function validateAddress(input: unknown): { address: Order['shipping_address'] } | ValidationFailure {
  const raw = asRecord(input);

  const required: [string, string][] = [
    ['fullName', 'Please enter your full name.'],
    ['email', 'Please enter your email address.'],
    ['phone', 'Please enter your phone number.'],
    ['address', 'Please enter your delivery address.'],
    ['city', 'Please enter your city.'],
    ['state', 'Please enter your state.'],
    ['pincode', 'Please enter your pincode.'],
  ];

  for (const [field, message] of required) {
    if (!asString(raw[field]).trim()) {
      return { message, status: 400 };
    }
  }

  if (!EMAIL_PATTERN.test(asString(raw.email).trim())) {
    return { message: 'Please enter a valid email address.', status: 400 };
  }
  if (!PHONE_PATTERN.test(asString(raw.phone).trim())) {
    return { message: 'Please enter a valid phone number.', status: 400 };
  }
  if (!PINCODE_PATTERN.test(asString(raw.pincode).trim())) {
    return { message: 'Please enter a valid 6-digit pincode.', status: 400 };
  }

  return {
    address: {
      fullName: sanitize(asString(raw.fullName)),
      email: sanitize(asString(raw.email)),
      phone: sanitize(asString(raw.phone)),
      address: sanitize(asString(raw.address)),
      city: sanitize(asString(raw.city)),
      state: sanitize(asString(raw.state)),
      pincode: sanitize(asString(raw.pincode)),
      country: 'India',
    },
  };
}

/**
 * Rebuilds every line item from the product catalogue. Names, images and above
 * all prices come from the catalogue, never from the request body.
 */
function buildItems(rawItems: unknown): { items: OrderItem[] } | ValidationFailure {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { message: 'Your basket is empty.', status: 400 };
  }
  if (rawItems.length > 50) {
    return { message: 'Too many items in one order. Please split your order.', status: 400 };
  }

  const items: OrderItem[] = [];

  for (const rawItem of rawItems) {
    const raw = asRecord(rawItem);
    const product = INITIAL_PRODUCTS.find((p) => p.id === raw.productId);
    if (!product) {
      return { message: 'One of the items in your basket is no longer available.', status: 400 };
    }
    if (product.status !== 'active' || product.availability_status !== 'available') {
      return { message: `${product.name} is currently unavailable. Please remove it from your basket.`, status: 400 };
    }

    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { message: `Please choose a quantity between 1 and 99 for ${product.name}.`, status: 400 };
    }

    // Only accept a customization the product actually offers.
    let customization: string | undefined;
    const requested = asString(raw.customization);
    if (requested && product.customization_available) {
      const offered = product.personalization_options ?? [];
      if (offered.includes(requested)) {
        customization = requested;
      }
    }

    items.push({
      productId: product.id,
      name: product.name,
      quantity,
      price: product.price,
      image: product.images[0],
      customization,
    });
  }

  return { items };
}

// POST: Create an order awaiting manual payment (authenticated customers only)
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Please sign in to place an order.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const itemResult = buildItems(body?.items);
    if ('message' in itemResult) {
      return NextResponse.json({ success: false, message: itemResult.message }, { status: itemResult.status });
    }

    const addressResult = validateAddress(body?.shipping_address);
    if ('message' in addressResult) {
      return NextResponse.json({ success: false, message: addressResult.message }, { status: addressResult.status });
    }

    const orders = readOrders();

    // A repeated submission of the same checkout returns the original order
    // rather than creating a duplicate.
    const idempotencyKey =
      typeof body?.idempotency_key === 'string' ? body.idempotency_key.slice(0, 100) : undefined;
    const existing = findByIdempotencyKey(orders, idempotencyKey);
    if (existing) {
      return NextResponse.json({ success: true, order: existing, duplicate: true });
    }

    // Every amount is recalculated here; nothing from the browser is trusted.
    const { items } = itemResult;
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = calculateShipping(subtotal);
    const coupon = INITIAL_COUPONS.find(
      (c) => typeof body?.coupon_code === 'string' && c.code === body.coupon_code.trim().toUpperCase()
    );
    const discount = calculateCouponDiscount(coupon, subtotal);
    const total = calculateTotal(subtotal, shipping, discount);

    const rawNotes = typeof body?.customer_notes === 'string' ? sanitize(body.customer_notes).slice(0, 1000) : '';
    const now = new Date().toISOString();

    const order: Order = {
      id: generateOrderId(orders),
      customer_id: customerIdFor(user),
      items,
      subtotal,
      shipping,
      discount,
      total,
      // Manual payment: the order starts unpaid and unconfirmed, always.
      payment_status: 'awaiting_payment',
      order_status: 'pending_payment',
      shipping_address: addressResult.address,
      customer_notes: rawNotes || undefined,
      idempotency_key: idempotencyKey,
      created_at: now,
      updated_at: now,
    };

    writeOrders([order, ...orders]);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json(
      { success: false, message: 'We could not create your order. Please try again.' },
      { status: 500 }
    );
  }
}

// GET: Admins see every order; customers see only their own
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orders = readOrders();
    const visible =
      user.role === 'admin'
        ? orders
        : orders.filter((o) => o.customer_id === customerIdFor(user));

    visible.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, orders: visible });
  } catch (error) {
    console.error('List orders API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
