import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/session';

// PATCH: Update message read/unread status (Admin only)
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const authorized = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (status !== 'read' && status !== 'unread') {
      return NextResponse.json({ success: false, message: 'Invalid status value' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Update status in Supabase contact_messages table
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('contact_messages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: data });
    }

    // 2. Fallback Mode: Update in local JSON simulated database
    const filePath = path.join(process.cwd(), 'src/data/messages.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const messages = JSON.parse(data);

    const messageIndex = messages.findIndex((m: any) => m.id === id);
    if (messageIndex === -1) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    messages[messageIndex].status = status;
    messages[messageIndex].updated_at = new Date().toISOString();

    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: messages[messageIndex] });
  } catch (error) {
    console.error('Update message status API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete customer message (Admin only)
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const authorized = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Delete from Supabase contact_messages table
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Message deleted successfully' });
    }

    // 2. Fallback Mode: Delete in local JSON simulated database
    const filePath = path.join(process.cwd(), 'src/data/messages.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const messages = JSON.parse(data);

    const messageIndex = messages.findIndex((m: any) => m.id === id);
    if (messageIndex === -1) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    messages.splice(messageIndex, 1);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
