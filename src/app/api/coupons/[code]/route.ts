import { NextResponse } from 'next/server';
import { Coupon } from '@/data/mockData';
import { getSessionUser } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { CouponUpdateSchema } from '@/lib/validation';
import { readCoupons, writeCoupons, pickDefined, formatDbCoupon } from '@/lib/catalogStore';

// PATCH: Toggle or edit a coupon (Admin only)
export async function PATCH(request: Request, props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const isToggle = body?.action === 'toggle';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let changes: Record<string, any>;
      if (isToggle) {
        const { data: existing } = await supabase.from('coupons').select('active').eq('code', code).single();
        if (!existing) {
          return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
        }
        changes = { active: !existing.active };
      } else {
        const result = CouponUpdateSchema.safeParse(body);
        if (!result.success) {
          const errorMsg = result.error.issues.map((e) => e.message).join(', ');
          return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
        }
        const data = pickDefined(result.data);
        changes = { ...data };
        if ('minSubtotal' in data) {
          changes.min_subtotal = data.minSubtotal ?? null;
          delete changes.minSubtotal;
        }
      }

      const { data: row, error } = await supabase
        .from('coupons')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('code', code)
        .select()
        .single();

      if (error || !row) {
        return NextResponse.json({ success: false, message: error?.message || 'Coupon not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, coupon: formatDbCoupon(row) });
    }

    const coupons = readCoupons();
    const index = coupons.findIndex((c) => c.code === code);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    let updated: Coupon;
    if (isToggle) {
      updated = { ...coupons[index], active: !coupons[index].active };
    } else {
      const result = CouponUpdateSchema.safeParse(body);
      if (!result.success) {
        const errorMsg = result.error.issues.map((e) => e.message).join(', ');
        return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
      }
      const changes = pickDefined(result.data);
      updated = {
        ...coupons[index],
        ...changes,
        minSubtotal: 'minSubtotal' in changes ? (changes.minSubtotal ?? undefined) : coupons[index].minSubtotal,
      };
    }

    coupons[index] = updated;
    writeCoupons(coupons);
    return NextResponse.json({ success: true, coupon: updated });
  } catch (error) {
    console.error('Update coupon API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a coupon (Admin only)
export async function DELETE(request: Request, props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { error } = await supabase.from('coupons').delete().eq('code', code);
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    const coupons = readCoupons();
    if (!coupons.some((c) => c.code === code)) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }
    writeCoupons(coupons.filter((c) => c.code !== code));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete coupon API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
