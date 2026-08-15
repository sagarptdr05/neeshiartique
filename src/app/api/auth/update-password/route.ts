import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Missing parameters.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src/data/users.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'Simulated user database missing.' }, { status: 500 });
    }

    const usersData = fs.readFileSync(filePath, 'utf8');
    const users = JSON.parse(usersData);

    const index = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'User account not found.' }, { status: 404 });
    }

    // Keep role unchanged, only update password field
    users[index].password = password;
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Update password API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
