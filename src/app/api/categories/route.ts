import { NextResponse } from 'next/server';
import { Category } from '@/data/mockData';
import { getSessionUser } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { CategorySchema } from '@/lib/validation';
import { readCategories, writeCategories, slugify } from '@/lib/catalogStore';

/**
 * Categories are always public to read (they're just shop navigation) and
 * admin-only to write. Category ids double as slugs (e.g. `keychains`) and
 * products reference them directly, so ids are never edited after creation.
 */

// GET: Public list of every category
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, categories: data || [] });
    }

    return NextResponse.json({ success: true, categories: readCategories() });
  } catch (error) {
    console.error('List categories API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a category (Admin only)
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = CategorySchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }
    const data = result.data;
    const id = slugify(data.name);
    if (!id) {
      return NextResponse.json({ success: false, message: 'Please choose a category name with at least one letter or number.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data: row, error } = await supabase
        .from('categories')
        .insert({ id, name: data.name, description: data.description || '', image: data.image })
        .select()
        .single();

      if (error) {
        const message = error.code === '23505' ? 'A category with this name already exists.' : error.message;
        return NextResponse.json({ success: false, message }, { status: error.code === '23505' ? 400 : 500 });
      }
      return NextResponse.json({ success: true, category: row });
    }

    const categories = readCategories();
    if (categories.some((c) => c.id === id)) {
      return NextResponse.json({ success: false, message: 'A category with this name already exists.' }, { status: 400 });
    }

    const category: Category = { id, name: data.name, description: data.description || '', image: data.image };
    writeCategories([...categories, category]);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Create category API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
