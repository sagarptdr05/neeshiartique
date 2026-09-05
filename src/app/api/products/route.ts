import { NextResponse } from 'next/server';
import { Product } from '@/data/mockData';
import { getSessionUser } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { ProductSchema } from '@/lib/validation';
import {
  readProducts,
  writeProducts,
  generateProductId,
  generateSku,
  slugify,
  uniqueSlug,
  formatDbProduct,
} from '@/lib/catalogStore';

/**
 * The public product catalog. Reading is open to everyone (guests browse the
 * shop too); writing is admin-only. Like orders, this is dual-mode: Supabase
 * when configured, a shared JSON file otherwise — either way every visitor
 * sees the same catalog, not just whichever browser last edited it.
 */

// GET: Public catalog. Guests/customers only ever see active products;
// admins see everything (archived, paused) so they can manage it.
export async function GET() {
  try {
    const user = await getSessionUser();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Supabase (RLS itself restricts non-admins to `status = 'active'`)
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase products fetch warning, using catalog fallback:', error);
      } else if (data && data.length > 0) {
        return NextResponse.json({ success: true, products: data.map(formatDbProduct) });
      }

      // If database is empty or not yet seeded with products, serve built-in catalog
      const fallbackProducts = readProducts();
      const visible = user?.role === 'admin' ? fallbackProducts : fallbackProducts.filter((p) => p.status === 'active');
      return NextResponse.json({ success: true, products: visible });
    }

    // 2. Fallback Mode: Shared local JSON file
    const products = readProducts();
    const visible = user?.role === 'admin' ? products : products.filter((p) => p.status === 'active');

    return NextResponse.json({ success: true, products: visible });
  } catch (error) {
    console.error('List products API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a product (Admin only)
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = ProductSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }
    const data = result.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Slug and SKU are always derived server-side — never trust the browser.
    const baseSlug = slugify(data.name);

    // 1. Dynamic Mode: Insert into Supabase
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      const { data: existingSlugs } = await supabase.from('products').select('id, slug');
      const slug = uniqueSlug(baseSlug, existingSlugs || []);

      const { data: row, error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          slug,
          description: data.description,
          short_description: data.short_description,
          price: data.price,
          compare_at_price: data.compare_at_price ?? null,
          category_id: data.category_id,
          availability_status: data.availability_status,
          made_to_order: data.made_to_order,
          sku: generateSku(data.name),
          stock: 99,
          images: data.images,
          materials: data.materials,
          care_instructions: data.care_instructions,
          customization_available: data.customization_available,
          personalization_options: data.personalization_options ?? [],
          preparation_time: data.preparation_time ?? null,
          shipping_time: data.shipping_time ?? null,
          featured: data.featured,
          bestseller: data.bestseller,
          is_new: data.new_product,
          status: data.status,
        })
        .select()
        .single();

      if (error || !row) {
        return NextResponse.json({ success: false, message: error?.message || 'Failed to create product' }, { status: 500 });
      }

      return NextResponse.json({ success: true, product: formatDbProduct(row) });
    }

    // 2. Fallback Mode: Append to shared products.json
    const products = readProducts();
    const slug = uniqueSlug(baseSlug, products);
    const now = new Date().toISOString();

    const product: Product = {
      id: generateProductId(),
      name: data.name,
      slug,
      description: data.description,
      short_description: data.short_description,
      price: data.price,
      compare_at_price: data.compare_at_price ?? undefined,
      category_id: data.category_id,
      stock: 99,
      availability_status: data.availability_status,
      made_to_order: data.made_to_order,
      sku: generateSku(data.name),
      images: data.images,
      materials: data.materials,
      care_instructions: data.care_instructions,
      customization_available: data.customization_available,
      personalization_options: data.personalization_options?.length ? data.personalization_options : undefined,
      preparation_time: data.preparation_time,
      shipping_time: data.shipping_time,
      featured: data.featured,
      bestseller: data.bestseller,
      new_product: data.new_product,
      status: data.status,
      created_at: now,
    };

    writeProducts([product, ...products]);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create product API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
