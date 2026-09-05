import { NextResponse } from 'next/server';
import { Product } from '@/data/mockData';
import { getSessionUser } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { ProductUpdateSchema } from '@/lib/validation';
import {
  readProducts,
  writeProducts,
  slugify,
  uniqueSlug,
  pickDefined,
  formatDbProduct,
} from '@/lib/catalogStore';

// PATCH: Update a product (Admin only)
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = ProductUpdateSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }
    const data = result.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Update the Supabase row
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const changes: Record<string, any> = {};
      if (data.name !== undefined) {
        changes.name = data.name;
        const { data: existingSlugs } = await supabase.from('products').select('id, slug').neq('id', id);
        changes.slug = uniqueSlug(slugify(data.name), existingSlugs || []);
      }
      if (data.description !== undefined) changes.description = data.description;
      if (data.short_description !== undefined) changes.short_description = data.short_description;
      if (data.price !== undefined) changes.price = data.price;
      if ('compare_at_price' in data) changes.compare_at_price = data.compare_at_price ?? null;
      if (data.category_id !== undefined) changes.category_id = data.category_id;
      if (data.availability_status !== undefined) changes.availability_status = data.availability_status;
      if (data.made_to_order !== undefined) changes.made_to_order = data.made_to_order;
      if (data.images !== undefined) changes.images = data.images;
      if (data.materials !== undefined) changes.materials = data.materials;
      if (data.care_instructions !== undefined) changes.care_instructions = data.care_instructions;
      if (data.customization_available !== undefined) changes.customization_available = data.customization_available;
      if (data.personalization_options !== undefined) changes.personalization_options = data.personalization_options;
      if (data.preparation_time !== undefined) changes.preparation_time = data.preparation_time;
      if (data.shipping_time !== undefined) changes.shipping_time = data.shipping_time;
      if (data.featured !== undefined) changes.featured = data.featured;
      if (data.bestseller !== undefined) changes.bestseller = data.bestseller;
      if (data.new_product !== undefined) changes.is_new = data.new_product;
      if (data.status !== undefined) changes.status = data.status;
      changes.updated_at = new Date().toISOString();

      const { data: row, error } = await supabase
        .from('products')
        .update(changes)
        .eq('id', id)
        .select()
        .single();

      if (error || !row) {
        return NextResponse.json({ success: false, message: error?.message || 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, product: formatDbProduct(row) });
    }

    // 2. Fallback Mode: Update the shared products.json entry
    const products = readProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const current = products[index];
    // Zod's partial-parse result carries every schema key, `undefined` for
    // whatever the client omitted — only merge in what was actually sent.
    const changes = pickDefined(data);
    const updated: Product = {
      ...current,
      ...changes,
      compare_at_price: 'compare_at_price' in changes ? (changes.compare_at_price ?? undefined) : current.compare_at_price,
      personalization_options:
        'personalization_options' in changes
          ? (changes.personalization_options?.length ? changes.personalization_options : undefined)
          : current.personalization_options,
      slug: changes.name ? uniqueSlug(slugify(changes.name), products, current.id) : current.slug,
    };

    products[index] = updated;
    writeProducts(products);

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update product API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a product (Admin only)
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Delete from Supabase
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    // 2. Fallback Mode: Remove from shared products.json
    const products = readProducts();
    const exists = products.some((p) => p.id === id);
    if (!exists) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    writeProducts(products.filter((p) => p.id !== id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
