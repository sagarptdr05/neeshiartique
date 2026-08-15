import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAdmin } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

// PATCH: Update custom order status (Admin only)
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const authorized = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['new', 'contacted', 'discussion', 'approved', 'payment_pending', 'confirmed', 'being_crafted', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status value' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Update in Supabase custom_orders table
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('custom_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},name.ilike.${id}`) // handles ID or query match safely
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, customOrder: data });
    }

    // 2. Fallback Mode: Update in local custom_orders.json
    const filePath = path.join(process.cwd(), 'src/data/custom_orders.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'Custom order not found' }, { status: 404 });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const customOrders = JSON.parse(data);

    const index = customOrders.findIndex((co: any) => co.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Custom order not found' }, { status: 404 });
    }

    customOrders[index].status = status;
    customOrders[index].updated_at = new Date().toISOString();

    fs.writeFileSync(filePath, JSON.stringify(customOrders, null, 2), 'utf8');

    return NextResponse.json({ success: true, customOrder: customOrders[index] });
  } catch (error) {
    console.error('Update custom order status error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
