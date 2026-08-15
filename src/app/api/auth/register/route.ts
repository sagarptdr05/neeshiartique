import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password, confirmPassword } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'Passwords do not match' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src/data/users.json');
    let users = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      users = JSON.parse(data);
    }

    const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists' }, { status: 400 });
    }

    // Force role to customer. Never allow admin role to be selected from registration.
    const newUser = {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      role: 'customer',
    };

    users.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');

    // Automatically sign in the registered user
    const sessionData = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
    };

    const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    const cookieStore = await cookies();

    cookieStore.set('neeshi_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, role: 'customer' });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
