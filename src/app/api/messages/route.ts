import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/session';
import { ContactFormSchema } from '@/lib/validation';

// GET: Fetch contact messages (Admin only)
export async function GET(request: Request) {
  const authorized = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, read, unread
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Fetch from Supabase contact_messages table
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      let query = supabase.from('contact_messages').select('*');

      if (filter === 'read') {
        query = query.eq('status', 'read');
      } else if (filter === 'unread') {
        query = query.eq('status', 'unread');
      }

      if (search.trim()) {
        const term = `%${search.trim().toLowerCase()}%`;
        query = query.or(`name.ilike.${term},email.ilike.${term},subject.ilike.${term},message.ilike.${term}`);
      }

      query = query.order('created_at', { ascending: sort !== 'newest' });

      const { data: messages, error } = await query;
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, messages });
    }

    // 2. Fallback Mode: Fetch from local JSON simulated database
    const filePath = path.join(process.cwd(), 'src/data/messages.json');
    let messages = [];

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      messages = JSON.parse(data);
    }

    // Filter by read/unread status
    if (filter === 'read') {
      messages = messages.filter((m: any) => m.status === 'read');
    } else if (filter === 'unread') {
      messages = messages.filter((m: any) => m.status === 'unread');
    }

    // Search by name, email, subject, message content
    if (search.trim()) {
      const term = search.toLowerCase();
      messages = messages.filter(
        (m: any) =>
          m.name.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term) ||
          m.subject.toLowerCase().includes(term) ||
          m.message.toLowerCase().includes(term)
      );
    }

    // Sort messages
    messages.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Fetch messages API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Public submission of contact inquiries
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Server-side validation using Zod
    const result = ContactFormSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues.map((e: any) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const { name, email, phone, subject, message } = result.data;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Insert into Supabase contact_messages table
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data, error } = await supabase.from('contact_messages').insert({
        name,
        email,
        phone,
        subject,
        message,
        status: 'unread',
      }).select();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Your message has been received! We will get back to you soon. ♡' });
    }

    // 2. Fallback Mode: Write to local messages.json simulated database
    const filePath = path.join(process.cwd(), 'src/data/messages.json');
    let messages = [];

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      messages = JSON.parse(data);
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      name,
      email,
      phone,
      subject,
      message,
      status: 'unread',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    messages.push(newMessage);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: 'Your message has been received! We will get back to you soon. ♡' });
  } catch (error) {
    console.error('Submit message API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
