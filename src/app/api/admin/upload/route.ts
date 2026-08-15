import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_BUCKETS = ['homepage-images', 'artist-images', 'product-images'];

export async function POST(request: Request) {
  const authorized = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'homepage-images';

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ success: false, message: 'Invalid storage destination' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    // 1. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: 'File is too large (max 5MB)' }, { status: 400 });
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Invalid image format. Allowed: PNG, JPG, WEBP, GIF' }, { status: 400 });
    }

    // 3. Validate file extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ success: false, message: 'Invalid file extension' }, { status: 400 });
    }

    // Generate safe unique filename to prevent path traversal and duplicates
    const safeFilename = `${crypto.randomUUID()}${ext}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 4. Dynamic Mode: Upload to Supabase Storage
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(safeFilename, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(safeFilename);

      return NextResponse.json({
        success: true,
        url: publicUrlData.publicUrl,
        path: data.path,
      });
    }

    // 5. Fallback Mode: Save locally to public/images/uploads/
    const uploadsDir = path.join(process.cwd(), 'public/images/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/images/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: localUrl,
      path: localUrl,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error during upload.' }, { status: 500 });
  }
}
