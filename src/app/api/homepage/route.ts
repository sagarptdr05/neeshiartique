import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSessionUser, isAdmin } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

// GET: Publicly read homepage content config
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Dynamic Mode: Fetch from Supabase
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();
      
      const { data: content, error: contentError } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (contentError || !content) {
        return NextResponse.json({ success: false, message: 'Homepage content configuration not found.' }, { status: 404 });
      }

      // Fetch featured products
      const { data: featuredRows } = await supabase
        .from('homepage_featured_products')
        .select('product_id')
        .order('display_order', { ascending: true });

      // Fetch latest products
      const { data: latestRows } = await supabase
        .from('homepage_latest_products')
        .select('product_id')
        .order('display_order', { ascending: true });

      const payload = {
        ...content,
        featured_products: (featuredRows || []).map(r => r.product_id),
        latest_products: (latestRows || []).map(r => r.product_id),
      };

      return NextResponse.json({ success: true, homepage: payload });
    }

    // 2. Fallback Mode: Fetch from local JSON simulated database
    const filePath = path.join(process.cwd(), 'src/data/homepage_content.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'Configuration file missing' }, { status: 404 });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const homepage = JSON.parse(data);

    return NextResponse.json({ success: true, homepage });
  } catch (error) {
    console.error('Fetch homepage content error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Save/Publish updated homepage content (Admin only)
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

    // 1. Dynamic Mode: Update Supabase homepage_content
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = await createServerClient();

      const { data, error } = await supabase
        .from('homepage_content')
        .update({
          hero_heading: body.hero_heading,
          hero_description: body.hero_description,
          hero_image_path: body.hero_image_path,
          hero_cta_text: body.hero_cta_text,
          hero_cta_link: body.hero_cta_link,
          announcement_text: body.announcement_text,
          announcement_enabled: body.announcement_enabled,
          announcement_link: body.announcement_link || null,
          featured_section_heading: body.featured_section_heading,
          featured_section_description: body.featured_section_description,
          latest_section_heading: body.latest_section_heading,
          latest_section_description: body.latest_section_description,
          custom_cta_heading: body.custom_cta_heading,
          custom_cta_description: body.custom_cta_description,
          video_heading: body.video_heading,
          video_description: body.video_description,
          video_url: body.video_url || null,
          video_poster_path: body.video_poster_path || null,
          video_caption: body.video_caption || null,
          section_visibility: body.section_visibility,
          section_order: body.section_order,
          updated_at: now,
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      // Update featured products relationships
      if (Array.isArray(body.featured_products)) {
        await supabase.from('homepage_featured_products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // delete all safely
        const featuredInserts = body.featured_products.map((pId: string, idx: number) => ({
          product_id: pId,
          display_order: idx,
        }));
        if (featuredInserts.length > 0) {
          await supabase.from('homepage_featured_products').insert(featuredInserts);
        }
      }

      // Update latest products relationships
      if (Array.isArray(body.latest_products)) {
        await supabase.from('homepage_latest_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const latestInserts = body.latest_products.map((pId: string, idx: number) => ({
          product_id: pId,
          display_order: idx,
        }));
        if (latestInserts.length > 0) {
          await supabase.from('homepage_latest_products').insert(latestInserts);
        }
      }

      return NextResponse.json({ success: true, homepage: data });
    }

    // 2. Fallback Mode: Write to local JSON simulated database
    const filePath = path.join(process.cwd(), 'src/data/homepage_content.json');
    const updatedContent = {
      hero_heading: body.hero_heading,
      hero_description: body.hero_description,
      hero_image_path: body.hero_image_path || "/images/butterfly_keychain.jpg",
      hero_cta_text: body.hero_cta_text || "Shop Crochet",
      hero_cta_link: body.hero_cta_link || "/shop",
      announcement_text: body.announcement_text,
      announcement_enabled: body.announcement_enabled,
      announcement_link: body.announcement_link || "",
      featured_section_heading: body.featured_section_heading,
      featured_section_description: body.featured_section_description,
      latest_section_heading: body.latest_section_heading,
      latest_section_description: body.latest_section_description,
      custom_cta_heading: body.custom_cta_heading,
      custom_cta_description: body.custom_cta_description,
      video_heading: body.video_heading || 'How Crochet Is Made',
      video_description: body.video_description || '',
      video_url: body.video_url || '',
      video_poster_path: body.video_poster_path || '',
      video_caption: body.video_caption || '',
      section_visibility: body.section_visibility,
      section_order: body.section_order,
      featured_products: body.featured_products || [],
      latest_products: body.latest_products || [],
      updated_at: now,
    };

    fs.writeFileSync(filePath, JSON.stringify(updatedContent, null, 2), 'utf8');

    return NextResponse.json({ success: true, homepage: updatedContent });
  } catch (error: any) {
    console.error('Update homepage content API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
