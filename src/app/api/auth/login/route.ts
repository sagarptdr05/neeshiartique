import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { createServerClient } from '@/lib/supabase/server';
import { LoginSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    // 1. Server-side validation using Zod
    const body = await request.json();
    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues.map((e: any) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const { email, password } = result.data;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 2. Dynamic Mode: Supabase Auth (If credentials configured)
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return NextResponse.json(
          { success: false, message: error?.message || 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Fetch user profile to return role to client
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_user_id', data.user.id)
        .single();

      return NextResponse.json({ success: true, role: profile?.role || 'customer' });
    }

    // 3. Fallback Mode: Local simulated JSON database
    const filePath = path.join(process.cwd(), 'src/data/users.json');
    let users = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      users = JSON.parse(data);
    }

    const user = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    // Set secure fallback session cookie
    const sessionData = {
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    const cookieStore = await cookies();
    const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    cookieStore.set('neeshi_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
