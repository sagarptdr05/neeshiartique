import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { CategoryUpdateSchema } from '@/lib/validation';
import { readCategories, writeCategories, readProducts, pickDefined } from '@/lib/catalogStore';

// PATCH: Update a category's display fields (Admin only). The id itself is
// immutable — products reference it directly.
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = CategoryUpdateSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }
    const changes = pickDefined(result.data);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data: row, error } = await supabase
        .from('categories')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error || !row) {
        return NextResponse.json({ success: false, message: error?.message || 'Category not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, category: row });
    }

    const categories = readCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    const updated = { ...categories[index], ...changes };
    categories[index] = updated;
    writeCategories(categories);
    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error('Update category API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a category (Admin only) — blocked while any product still
// references it, matching the database's own foreign-key restriction.
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);

      if (count && count > 0) {
        return NextResponse.json(
          { success: false, message: 'This category still has products assigned to it. Move or delete them first.' },
          { status: 409 }
        );
      }

      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    const categories = readCategories();
    if (!categories.some((c) => c.id === id)) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    const stillInUse = readProducts().some((p) => p.category_id === id);
    if (stillInUse) {
      return NextResponse.json(
        { success: false, message: 'This category still has products assigned to it. Move or delete them first.' },
        { status: 409 }
      );
    }

    writeCategories(categories.filter((c) => c.id !== id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
