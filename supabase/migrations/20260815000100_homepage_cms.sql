-- ===================================================
-- NEESHIARTIQUE HOMEPAGE & ARTIST CMS MIGRATION
-- ===================================================

-- 1. Homepage Content Table
CREATE TABLE public.homepage_content (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Enforce single row singleton
    hero_heading TEXT NOT NULL DEFAULT 'Little Things, Crocheted With Love.',
    hero_description TEXT NOT NULL DEFAULT 'Handmade crochet creations, thoughtful gifts and custom pieces — made one stitch at a time.',
    hero_image_path TEXT NOT NULL DEFAULT '/images/butterfly_keychain.jpg',
    hero_cta_text TEXT NOT NULL DEFAULT 'Shop Crochet',
    hero_cta_link TEXT NOT NULL DEFAULT '/shop',
    announcement_text TEXT NOT NULL DEFAULT 'Handmade with love • Custom orders welcome ♡',
    announcement_enabled BOOLEAN NOT NULL DEFAULT true,
    announcement_link TEXT,
    featured_section_heading TEXT NOT NULL DEFAULT 'Made With Love',
    featured_section_description TEXT NOT NULL DEFAULT 'Some of our little favourites.',
    latest_section_heading TEXT NOT NULL DEFAULT 'Explore Our Crochet',
    latest_section_description TEXT NOT NULL DEFAULT 'Shop by categories.',
    custom_cta_heading TEXT NOT NULL DEFAULT 'Have Something Special in Mind?',
    custom_cta_description TEXT NOT NULL DEFAULT 'Tell us what you''re imagining, and we''ll create something especially for you.',
    section_visibility JSONB NOT NULL DEFAULT '{"hero": true, "announcement": true, "featured": true, "artist": true, "latest": true, "custom_cta": true, "instagram": true}'::jsonb,
    section_order TEXT[] NOT NULL DEFAULT ARRAY['hero', 'announcement', 'latest', 'featured', 'artist', 'custom_cta', 'instagram'],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initialize default homepage content
INSERT INTO public.homepage_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 2. Homepage Featured Products Table
CREATE TABLE public.homepage_featured_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Homepage Latest Products Table
CREATE TABLE public.homepage_latest_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Artist Profile Table
CREATE TABLE public.artist_profile (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Enforce single row singleton
    name TEXT NOT NULL DEFAULT 'Neeshita Prajapati',
    profile_photo TEXT NOT NULL DEFAULT '/images/neeshita.jpg',
    short_intro TEXT NOT NULL DEFAULT 'Hi, I’m Neeshita, the hands behind the yarn. 🧶✨ Turning little loops into beautiful, handmade creations—one stitch, one idea, and one piece of love at a time. 💕',
    email TEXT NOT NULL DEFAULT 'neeshita.art27@gmail.com',
    location TEXT NOT NULL DEFAULT 'Mumbai, India',
    story_childhood TEXT NOT NULL DEFAULT 'Art has been a part of me since childhood. I’ve always loved creating things and expressing ideas through creativity. Over time, that love for making things slowly found its way into crochet.',
    story_engineering TEXT NOT NULL DEFAULT 'It was during my second year of engineering that I slowly started getting interested in crochet. Amidst formulas and computer screens, I wanted to find a tactile, calming outlet to channel my childhood interest in art.',
    story_youtube TEXT NOT NULL DEFAULT 'I began learning crochet patterns through YouTube videos, trying different stitches, learning little by little, and slowly discovering how much I enjoyed turning a simple strand of yarn into something real. 🧶',
    story_friend_gift TEXT NOT NULL DEFAULT 'One of the things that inspired me was simply wanting to make a special gift for my best friend. Making something with my own hands felt different. It wasn''t just a gift — it carried time, effort and a little piece of me. That feeling made me realize how special handmade gifts can be, and I wanted to create pieces that could make someone else feel the same way.',
    story_chatgpt TEXT NOT NULL DEFAULT 'And how did Neeshiartique actually begin? Honestly... bas aise hi decide ho gaya ChatGPT se. 😂 Sometimes the best ideas don''t arrive with a big plan. They just start with a little curiosity, a little courage and the decision to give something a try.',
    story_favourites TEXT NOT NULL DEFAULT 'I especially love crocheting keychains and bouquets because they can make people feel special. They''re little creations, but sometimes the smallest gifts can carry the biggest feelings.',
    story_time TEXT NOT NULL DEFAULT 'Crochet takes time. Every stitch is made by hand, and every piece needs patience. But even when a creation takes longer than expected, I still want to make it with love for the person who will receive it. The time that goes into a handmade piece is part of what makes it special.',
    story_process TEXT NOT NULL DEFAULT 'Inspiration ➔ Choosing the Idea ➔ Learning & Exploring ➔ Crocheting ➔ Finishing Touches ➔ Made With Love',
    story_future TEXT NOT NULL DEFAULT 'There are still so many things I want to learn and create. One day, I''d love to make crochet tops, handbags, bigger and bigger bouquets, and explore even more ambitious crochet ideas. For now, I''m enjoying the journey — one stitch at a time. 🧶✨',
    story_signature TEXT NOT NULL DEFAULT 'Every piece I make takes a little time, a lot of patience and a whole lot of love. And knowing that something I created might become a special gift for someone makes every stitch worth it. 💕 Thank you for being here and for supporting my little crochet journey. — Neeshita',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initialize default artist profile
INSERT INTO public.artist_profile (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_featured_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_latest_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_profile ENABLE ROW LEVEL SECURITY;

-- Helper Function check (if not already declared in schema.sql)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Public read policies
CREATE POLICY "Allow public select on homepage_content" ON public.homepage_content FOR SELECT USING (true);
CREATE POLICY "Allow public select on homepage_featured_products" ON public.homepage_featured_products FOR SELECT USING (true);
CREATE POLICY "Allow public select on homepage_latest_products" ON public.homepage_latest_products FOR SELECT USING (true);
CREATE POLICY "Allow public select on artist_profile" ON public.artist_profile FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Allow admin all on homepage_content" ON public.homepage_content FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admin all on homepage_featured_products" ON public.homepage_featured_products FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admin all on homepage_latest_products" ON public.homepage_latest_products FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admin all on artist_profile" ON public.artist_profile FOR ALL USING (public.is_admin());
