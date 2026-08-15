import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSessionUser, isAdmin } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

// GET: Publicly read artist profile config
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Fetch from Supabase
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      
      const { data: artist, error } = await supabase
        .from('artist_profile')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error || !artist) {
        return NextResponse.json({ success: false, message: 'Artist profile not found.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, artist });
    }

    // 2. Fallback Mode: Fetch from local JSON simulated database
    const filePath = path.join(process.cwd(), 'src/data/artist_profile.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'Artist profile file missing' }, { status: 404 });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const artist = JSON.parse(data);

    return NextResponse.json({ success: true, artist });
  } catch (error) {
    console.error('Fetch artist profile error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Save/Publish updated artist profile content (Admin only)
export async function POST(request: Request) {
  const authorized = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const now = new Date().toISOString();

    // 1. Dynamic Mode: Update Supabase artist_profile
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      const { data, error } = await supabase
        .from('artist_profile')
        .update({
          name: body.name,
          profile_photo: body.profile_photo,
          short_intro: body.short_intro,
          email: body.email,
          location: body.location,
          story_childhood: body.story_childhood,
          story_engineering: body.story_engineering,
          story_youtube: body.story_youtube,
          story_friend_gift: body.story_friend_gift,
          story_chatgpt: body.story_chatgpt,
          story_favourites: body.story_favourites,
          story_time: body.story_time,
          story_process: body.story_process,
          story_future: body.story_future,
          story_signature: body.story_signature,
          updated_at: now,
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, artist: data });
    }

    // 2. Fallback Mode: Write to local JSON simulated database
    const filePath = path.join(process.cwd(), 'src/data/artist_profile.json');
    const updatedProfile = {
      name: body.name,
      profile_photo: body.profile_photo || "/images/neeshita.jpg",
      short_intro: body.short_intro,
      email: body.email || "neeshita.art27@gmail.com",
      location: body.location || "Mumbai, India",
      story_childhood: body.story_childhood,
      story_engineering: body.story_engineering,
      story_youtube: body.story_youtube,
      story_friend_gift: body.story_friend_gift,
      story_chatgpt: body.story_chatgpt,
      story_favourites: body.story_favourites,
      story_time: body.story_time,
      story_process: body.story_process,
      story_future: body.story_future,
      story_signature: body.story_signature,
      updated_at: now,
    };

    fs.writeFileSync(filePath, JSON.stringify(updatedProfile, null, 2), 'utf8');

    return NextResponse.json({ success: true, artist: updatedProfile });
  } catch (error: any) {
    console.error('Update artist profile API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
