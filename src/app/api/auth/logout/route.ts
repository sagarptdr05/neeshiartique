import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Supabase Sign Out (If credentials configured)
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      await supabase.auth.signOut();
    }

    // 2. Clear local session cookie
    const cookieStore = await cookies();
    cookieStore.delete('neeshi_session');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
