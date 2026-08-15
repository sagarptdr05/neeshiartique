import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { createServerClient } from '@/lib/supabase/server';
import { RegisterSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    // 1. Validate request body using Zod
    const body = await request.json();
    const result = RegisterSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues.map((e: any) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const { name, email, phone, password } = result.data;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 2. Dynamic Mode: Supabase Auth (If credentials configured)
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      
      // Perform Auth Sign Up with metadata passed for profile insertion
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }

      // Check if registration was successful or confirmation is pending
      if (data.user) {
        return NextResponse.json({ success: true, role: 'customer' });
      } else {
        return NextResponse.json({ success: true, message: 'Verification email sent' });
      }
    }

    // 3. Fallback Mode: Local simulated JSON database
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

    // Force role to customer. Never allow admin role selection on registration.
    const newUser = {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      role: 'customer',
    };

    users.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');

    // Automatically sign in the registered user in fallback mode
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
