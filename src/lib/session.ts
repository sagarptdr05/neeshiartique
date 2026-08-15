import { cookies } from 'next/headers';

/**
 * Server-side session helpers. The session cookie is the only identity the API
 * trusts — nothing about the caller is ever read from the request body.
 */

export interface SessionUser {
  name: string;
  email: string;
  role: string;
  phone: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
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
