import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Read simulated database file
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

    // Set secure session cookie
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
