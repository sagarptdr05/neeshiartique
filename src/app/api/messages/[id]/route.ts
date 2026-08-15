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

// PATCH: Update message read/unread status (Admin only)
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const authorized = await isAdminAuthorized();
  if (!authorized) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (status !== 'read' && status !== 'unread') {
      return NextResponse.json({ success: false, message: 'Invalid status value' }, { status: 400 });
    }

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
  const authorized = await isAdminAuthorized();
  if (!authorized) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
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
