import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('neeshi_session');

    if (session && session.value) {
      try {
        const sessionData = JSON.parse(Buffer.from(session.value, 'base64').toString('utf8'));
        return NextResponse.json({ authenticated: true, user: sessionData });
      } catch {
        // Fallback to supabase check if token corrupted
      }
    }

    // Check Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let userRole = user.email?.toLowerCase() === 'neeshita.art27@gmail.com' ? 'admin' : 'customer';
        let userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        let userPhone = user.user_metadata?.phone || '';

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name, phone')
            .eq('auth_user_id', user.id)
            .maybeSingle();

          if (profile) {
            userRole = profile.role || userRole;
            userName = profile.full_name || userName;
            userPhone = profile.phone || userPhone;
          }
        } catch {}

        const sessionData = {
          name: userName,
          email: user.email || '',
          role: userRole,
          phone: userPhone,
        };

        const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');
        cookieStore.set('neeshi_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json({ authenticated: true, user: sessionData });
      }
    }

    return NextResponse.json({ authenticated: false });
  } catch (error: any) {
    console.error('Session API error:', error);
    return NextResponse.json({ authenticated: false, message: 'Invalid session' }, { status: 400 });
  }
}
