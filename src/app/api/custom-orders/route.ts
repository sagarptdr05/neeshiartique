import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSessionUser } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { CustomOrderSchema } from '@/lib/validation';

const sanitize = (value: string) => value.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();

// GET: Admin sees all custom orders, customers see only their own
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Fetch from Supabase custom_orders table
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      let query = supabase.from('custom_orders').select('*');

      if (user.role !== 'admin') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (!profile) {
          return NextResponse.json({ success: true, customOrders: [] });
        }
        query = query.eq('customer_id', profile.id);
      }

      query = query.order('created_at', { ascending: false });
      const { data: customOrders, error } = await query;
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, customOrders });
    }

    // 2. Fallback Mode: Fetch from local custom_orders.json
    const filePath = path.join(process.cwd(), 'src/data/custom_orders.json');
    let customOrders = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      customOrders = JSON.parse(data);
    }

    if (user.role !== 'admin') {
      customOrders = customOrders.filter((co: any) => co.email.toLowerCase() === user.email.toLowerCase());
    }

    customOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, customOrders });
  } catch (error) {
    console.error('List custom orders error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a custom order request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Zod validation
    const result = CustomOrderSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues.map((e: any) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const validData = result.data;
    const user = await getSessionUser();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Save to Supabase public.custom_orders
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      let customerId: string | null = null;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        if (profile) customerId = profile.id;
      }

      const { data, error } = await supabase
        .from('custom_orders')
        .insert({
          customer_id: customerId,
          name: sanitize(validData.name),
          email: sanitize(validData.email),
          phone: sanitize(validData.phone),
          product_type: sanitize(validData.productType),
          occasion: validData.occasion ? sanitize(validData.occasion) : null,
          preferred_color: validData.preferredColor ? sanitize(validData.preferredColor) : null,
          size: validData.size ? sanitize(validData.size) : null,
          quantity: validData.quantity,
          budget: validData.budgetRange ? sanitize(validData.budgetRange) : null,
          required_date: validData.requiredDate,
          personalization_details: sanitize(validData.customizationDetails),
          reference_image_path: validData.referenceImage ? sanitize(validData.referenceImage) : null,
          additional_message: validData.message ? sanitize(validData.message) : null,
          status: 'new',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, customOrder: data });
    }

    // 2. Fallback Mode: Write to local custom_orders.json
    const filePath = path.join(process.cwd(), 'src/data/custom_orders.json');
    let customOrders = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      customOrders = JSON.parse(data);
    }

    const newCustomOrder = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: sanitize(validData.name),
      email: sanitize(validData.email),
      phone: sanitize(validData.phone),
      productType: validData.productType,
      occasion: validData.occasion || 'Personal Use',
      preferredColor: validData.preferredColor || 'No preference',
      quantity: validData.quantity,
      budgetRange: validData.budgetRange || 'Under ₹500',
      customizationDetails: sanitize(validData.customizationDetails),
      requiredDate: validData.requiredDate || 'Flexible',
      referenceImage: validData.referenceImage || undefined,
      message: validData.message ? sanitize(validData.message) : undefined,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    customOrders.push(newCustomOrder);
    fs.writeFileSync(filePath, JSON.stringify(customOrders, null, 2), 'utf8');

    return NextResponse.json({ success: true, customOrder: newCustomOrder });
  } catch (error) {
    console.error('Submit custom order error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
