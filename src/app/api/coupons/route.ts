import { NextResponse } from 'next/server';
import { Coupon } from '@/data/mockData';
import { getSessionUser } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { CouponSchema } from '@/lib/validation';
import { readCoupons, writeCoupons, formatDbCoupon } from '@/lib/catalogStore';

/**
 * Coupons: customers only ever need to validate a code they already have, so
 * anonymous/customer reads are limited to active codes; admins manage the
 * full list (including disabled ones) from the dashboard.
 */

// GET: Active coupons for everyone; the full list (incl. disabled) for admins
export async function GET() {
  try {
    const user = await getSessionUser();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data, error } = await supabase.from('coupons').select('*').order('code');
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, coupons: (data || []).map(formatDbCoupon) });
    }

    const coupons = readCoupons();
    const visible = user?.role === 'admin' ? coupons : coupons.filter((c) => c.active);
    return NextResponse.json({ success: true, coupons: visible });
  } catch (error) {
    console.error('List coupons API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a coupon (Admin only)
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = CouponSchema.safeParse({ ...body, code: typeof body?.code === 'string' ? body.code.toUpperCase() : body?.code });
    if (!result.success) {
      const errorMsg = result.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }
    const data = result.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data: row, error } = await supabase
        .from('coupons')
        .insert({
          code: data.code,
          type: data.type,
          value: data.value,
          min_subtotal: data.minSubtotal ?? null,
          active: data.active ?? true,
        })
        .select()
        .single();

      if (error) {
        const message = error.code === '23505' ? 'A coupon with this code already exists.' : error.message;
        return NextResponse.json({ success: false, message }, { status: error.code === '23505' ? 400 : 500 });
      }
      return NextResponse.json({ success: true, coupon: formatDbCoupon(row) });
    }

    const coupons = readCoupons();
    if (coupons.some((c) => c.code === data.code)) {
      return NextResponse.json({ success: false, message: 'A coupon with this code already exists.' }, { status: 400 });
    }

    const coupon: Coupon = {
      code: data.code,
      type: data.type,
      value: data.value,
      minSubtotal: data.minSubtotal ?? undefined,
      active: data.active ?? true,
    };
    writeCoupons([...coupons, coupon]);
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('Create coupon API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
