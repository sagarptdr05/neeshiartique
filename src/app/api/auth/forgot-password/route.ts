import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email address is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Trigger Supabase default Auth reset email flow
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/update-password`,
      });

      if (error) {
        // Log error but return generic success to browser for security (prevents enumeration)
        console.error('Supabase password reset error:', error);
      }

      return NextResponse.json({ success: true });
    }

    // 2. Fallback Mode: Local JSON Simulated Mail logs
    const filePath = path.join(process.cwd(), 'src/data/users.json');
    if (fs.existsSync(filePath)) {
      const usersData = fs.readFileSync(filePath, 'utf8');
      const users = JSON.parse(usersData);
      
      const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        console.log(`\n======================================================`);
        console.log(`[MOCK MAIL] Password reset requested for: ${email}`);
        console.log(`[MOCK MAIL] Reset Link: http://localhost:3000/update-password?email=${encodeURIComponent(email)}`);
        console.log(`======================================================\n`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
