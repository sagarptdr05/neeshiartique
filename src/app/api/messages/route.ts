import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

// Helper to check admin authorization server-side
async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const session = cookieStore.get('neeshi_session');
  if (!session || !session.value) return false;
  try {
    const sessionData = JSON.parse(Buffer.from(session.value, 'base64').toString('utf8'));
    return sessionData.role === 'admin';
  } catch (e) {
    return false;
  }
}

// GET: Fetch contact messages (Admin only)
export async function GET(request: Request) {
  const authorized = await isAdminAuthorized();
  if (!authorized) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, read, unread
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest

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
    const { name, email, phone, subject, message } = body;

    // Server-side validation
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ success: false, message: 'Please provide a valid email address' }, { status: 400 });
    }
    if (phone && phone.trim()) {
      const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        return NextResponse.json({ success: false, message: 'Please provide a valid phone number' }, { status: 400 });
      }
    }
    if (!subject || !subject.trim()) {
      return NextResponse.json({ success: false, message: 'Subject is required' }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Message content is required' }, { status: 400 });
    }

    // Sanitize user inputs to prevent injection / XSS
    const sanitize = (str: string) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();

    const newMessage = {
      id: `msg-${Date.now().toString()}`,
      name: sanitize(name),
      email: sanitize(email),
      phone: phone ? sanitize(phone) : '',
      subject: sanitize(subject),
      message: sanitize(message),
      status: 'unread',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const filePath = path.join(process.cwd(), 'src/data/messages.json');
    let messages = [];

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      messages = JSON.parse(data);
    }

    messages.push(newMessage);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out. ♡\nYour message has been received. We'll get back to you soon.",
    });
  } catch (error) {
    console.error('Submit contact message API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to save message. Internal server error.' }, { status: 500 });
  }
}
