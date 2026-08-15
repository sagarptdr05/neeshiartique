import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('neeshi_session');

    if (!session || !session.value) {
      return NextResponse.json({ authenticated: false });
    }

    const sessionData = JSON.parse(Buffer.from(session.value, 'base64').toString('utf8'));
    return NextResponse.json({ authenticated: true, user: sessionData });
  } catch (error: any) {
    console.error('Session API error:', error);
    return NextResponse.json({ authenticated: false, message: 'Invalid session' }, { status: 400 });
  }
}
