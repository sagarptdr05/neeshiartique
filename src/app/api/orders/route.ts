import { NextResponse } from 'next/server';
import { Order, OrderItem, INITIAL_PRODUCTS, INITIAL_COUPONS } from '@/data/mockData';
import { calculateShipping, calculateCouponDiscount, calculateTotal } from '@/lib/pricing';
import { getSessionUser, customerIdFor } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import {
  readOrders,
  writeOrders,
  generateOrderId,
  findByIdempotencyKey,
} from '@/lib/orderStore';
import { CheckoutSchema } from '@/lib/validation';

const sanitize = (value: string) => value.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();

// GET: Admins see every order; customers see only their own
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusGroup = searchParams.get('status_group'); // 'active' | 'completed'
  const statusParam = searchParams.get('status');

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Fetch orders from Supabase orders / order_items tables
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      let query = supabase.from('orders').select('*, order_items(*)');

      if (user.role !== 'admin') {
        // Fetch current user's profile ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (!profile) {
          return NextResponse.json({ success: true, orders: [] });
        }
        query = query.eq('customer_id', profile.id);
      }

      if (statusGroup === 'active') {
        query = query.neq('order_status', 'delivered');
      } else if (statusGroup === 'completed') {
        query = query.eq('order_status', 'delivered');
      }

      if (statusParam) {
        query = query.eq('order_status', statusParam);
      }

      query = query.order('created_at', { ascending: false });

      const { data: dbOrders, error } = await query;
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      // Format database orders back to the frontend shape
      const formattedOrders: Order[] = (dbOrders || []).map((o: any) => ({
        id: o.order_number,
        customer_id: o.customer_id,
        subtotal: o.subtotal,
        shipping: o.shipping_amount,
        discount: o.discount_amount,
        total: o.total,
        payment_status: o.payment_status,
        order_status: o.order_status,
        customer_notes: o.customer_notes,
        created_at: o.created_at,
        updated_at: o.updated_at,
        shipping_address: {
          fullName: o.shipping_address.split('\n')[0] || '',
          email: user.email, // Read from session to protect PII
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
          image: '', // loaded from database join or product map in client
        })),
      }));

      return NextResponse.json({ success: true, orders: formattedOrders });
    }

    // 2. Fallback Mode: Fetch from local JSON simulated database
    const orders = readOrders();
    let visible =
      user.role === 'admin'
        ? orders
        : orders.filter((o) => o.customer_id === customerIdFor(user));

    if (statusGroup === 'active') {
      visible = visible.filter((o) => o.order_status !== 'delivered');
    } else if (statusGroup === 'completed') {
      visible = visible.filter((o) => o.order_status === 'delivered');
    }

    if (statusParam) {
      visible = visible.filter((o) => o.order_status === statusParam);
    }

    visible.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, orders: visible });
  } catch (error) {
    console.error('List orders API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create an order awaiting manual payment
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

    // Reconstruct items and validate with Zod CheckoutSchema
    const inputValidation = CheckoutSchema.safeParse({
      customerName: body?.shipping_address?.fullName,
      email: body?.shipping_address?.email || user.email,
      phone: body?.shipping_address?.phone,
      address: body?.shipping_address?.address,
      city: body?.shipping_address?.city,
      state: body?.shipping_address?.state,
      pincode: body?.shipping_address?.pincode,
      notes: body?.customer_notes,
      items: body?.items?.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
    });

    if (!inputValidation.success) {
      const errorMsg = inputValidation.error.issues.map((e: any) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const validData = inputValidation.data;

    // Recalculate amounts. Browser values are NEVER trusted for prices.
    const orderItemsList: OrderItem[] = [];
    for (const item of validData.items) {
      const product = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
      if (!product || product.status !== 'active' || product.availability_status !== 'available') {
        return NextResponse.json(
          { success: false, message: `${item.name} is no longer available.` },
          { status: 400 }
        );
      }
      orderItemsList.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images[0] || '',
      });
    }

    const subtotal = orderItemsList.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = calculateShipping(subtotal);
    const coupon = INITIAL_COUPONS.find(
      (c) => typeof body?.coupon_code === 'string' && c.code === body.coupon_code.trim().toUpperCase()
    );
    const discount = calculateCouponDiscount(coupon, subtotal);
    const total = calculateTotal(subtotal, shipping, discount);

    const idempotencyKey =
      typeof body?.idempotency_key === 'string' ? body.idempotency_key.slice(0, 100) : undefined;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Save order to Supabase PostgreSQL database
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      // Check for duplicate idempotency key
      if (idempotencyKey) {
        const { data: duplicate } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle();

        if (duplicate) {
          return NextResponse.json({ success: true, order: duplicate, duplicate: true });
        }
      }

      // Retrieve user profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        return NextResponse.json({ success: false, message: 'Customer profile not found.' }, { status: 400 });
      }

      const orderNumber = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      // Insert Order row
      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: profile.id,
          subtotal,
          shipping_amount: shipping,
          discount_amount: discount,
          total,
          payment_status: 'awaiting_payment',
          order_status: 'pending_payment',
          customer_notes: validData.notes ? sanitize(validData.notes) : null,
          shipping_address: sanitize(validData.customerName) + '\n' + sanitize(validData.address),
          shipping_city: sanitize(validData.city),
          shipping_state: sanitize(validData.state),
          shipping_pincode: sanitize(validData.pincode),
          idempotency_key: idempotencyKey,
        })
        .select()
        .single();

      if (orderError || !orderRow) {
        return NextResponse.json({ success: false, message: orderError?.message || 'Failed to record order' }, { status: 500 });
      }

      // Insert Order Items rows
      const itemsToInsert = orderItemsList.map((item) => ({
        order_id: orderRow.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsError) {
        // Rollback created order row (since transaction isn't easily done client-side without RPC)
        await supabase.from('orders').delete().eq('id', orderRow.id);
        return NextResponse.json({ success: false, message: itemsError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: { ...orderRow, id: orderRow.order_number, items: orderItemsList } });
    }

    // 2. Fallback Mode: Save order to local JSON simulated database
    const orders = readOrders();

    if (idempotencyKey) {
      const existing = findByIdempotencyKey(orders, idempotencyKey);
      if (existing) {
        return NextResponse.json({ success: true, order: existing, duplicate: true });
      }
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: generateOrderId(orders),
      customer_id: customerIdFor(user),
      items: orderItemsList,
      subtotal,
      shipping,
      discount,
      total,
      payment_status: 'awaiting_payment',
      order_status: 'pending_payment',
      shipping_address: {
        fullName: sanitize(validData.customerName),
        email: sanitize(validData.email),
        phone: sanitize(validData.phone),
        address: sanitize(validData.address),
        city: sanitize(validData.city),
        state: sanitize(validData.state),
        pincode: sanitize(validData.pincode),
        country: 'India',
      },
      customer_notes: validData.notes ? sanitize(validData.notes).slice(0, 1000) : undefined,
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
