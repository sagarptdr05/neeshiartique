import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];
// Kept modest on purpose: this upload goes through the API route, and most
// serverless hosts cap request bodies well below this. Anything larger should
// be hosted elsewhere and pasted in as a URL instead.
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_BUCKETS = ['homepage-images', 'artist-images', 'product-images', 'homepage-videos'];

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

    // 1. Decide whether this is an image or a video upload from its MIME type
    const isImage = IMAGE_MIME_TYPES.includes(file.type);
    const isVideo = VIDEO_MIME_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, message: 'Unsupported format. Images: PNG, JPG, WEBP, GIF. Videos: MP4, WEBM, MOV.' },
        { status: 400 }
      );
    }

    // 2. Validate file size against the limit for that kind
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: isVideo
            ? 'Video is too large (max 25MB). Host it elsewhere and paste the URL instead.'
            : 'File is too large (max 5MB)',
        },
        { status: 400 }
      );
    }

    // 3. Validate file extension matches the detected kind
    const ext = path.extname(file.name).toLowerCase();
    const allowedExtensions = isVideo ? VIDEO_EXTENSIONS : IMAGE_EXTENSIONS;
    if (!allowedExtensions.includes(ext)) {
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

    // 5. Fallback Mode: Save locally under public/
    const publicSubDir = isVideo ? 'videos/uploads' : 'images/uploads';
    const uploadsDir = path.join(process.cwd(), 'public', publicSubDir);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/${publicSubDir}/${safeFilename}`;

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
