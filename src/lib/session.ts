import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Server-side session helpers. Supports dynamic switching between Supabase Auth
 * and local simulated cookies depending on credentials configuration.
 */

export interface SessionUser {
  name: string;
  email: string;
  role: string;
  phone: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Dynamic Check: If Supabase is configured, read session via Supabase Auth
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createServerClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      // Retrieve profile details to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone, role')
        .eq('auth_user_id', user.id)
        .single();

      return {
        name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Valued Customer',
        email: user.email || '',
        role: profile?.role || 'customer',
        phone: profile?.phone || user.user_metadata?.phone || '',
      };
    } catch (err) {
      console.error('Supabase session lookup error, falling back:', err);
    }
  }

  // 2. Fallback Check: Read neeshi_session cookie
  const cookieStore = await cookies();
  const session = cookieStore.get('neeshi_session');
  if (!session || !session.value) return null;

  try {
    const decoded = JSON.parse(Buffer.from(session.value, 'base64').toString('utf8'));
    if (!decoded || typeof decoded.email !== 'string') return null;
    return decoded as SessionUser;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.role === 'admin';
}

/** Orders are keyed by the account's email address. */
export function customerIdFor(user: SessionUser): string {
  return user.email.toLowerCase();
}
