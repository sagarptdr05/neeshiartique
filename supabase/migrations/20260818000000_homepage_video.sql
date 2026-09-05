-- ===================================================
-- NEESHIARTIQUE HOMEPAGE VIDEO SECTION MIGRATION
-- Adds a "how it's made" video block to the homepage CMS.
-- ===================================================

-- 1. Video fields on the homepage_content singleton
ALTER TABLE public.homepage_content
  ADD COLUMN IF NOT EXISTS video_heading TEXT NOT NULL DEFAULT 'How Crochet Is Made',
  ADD COLUMN IF NOT EXISTS video_description TEXT NOT NULL DEFAULT 'A little look at the craft behind every handmade piece.',
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_poster_path TEXT,
  ADD COLUMN IF NOT EXISTS video_caption TEXT;

-- 2. Make the section visible by default for fresh installs
ALTER TABLE public.homepage_content
  ALTER COLUMN section_visibility
  SET DEFAULT '{"hero": true, "announcement": true, "featured": true, "artist": true, "video": true, "latest": true, "custom_cta": true, "instagram": true}'::jsonb;

ALTER TABLE public.homepage_content
  ALTER COLUMN section_order
  SET DEFAULT ARRAY['hero', 'announcement', 'latest', 'featured', 'artist', 'video', 'custom_cta', 'instagram'];

-- 3. Add the section to the existing row (defaults above only apply to new rows)
UPDATE public.homepage_content
SET section_visibility = section_visibility || '{"video": true}'::jsonb
WHERE id = 1 AND NOT (section_visibility ? 'video');

-- Slot the video straight after the artist section, so "meet the maker"
-- flows into "watch the craft".
UPDATE public.homepage_content
SET section_order = section_order[1:array_position(section_order, 'artist')]
                    || ARRAY['video']
                    || section_order[array_position(section_order, 'artist') + 1:]
WHERE id = 1
  AND NOT ('video' = ANY(section_order))
  AND array_position(section_order, 'artist') IS NOT NULL;

-- Fallback: if there is no artist section to anchor to, append it.
UPDATE public.homepage_content
SET section_order = array_append(section_order, 'video')
WHERE id = 1 AND NOT ('video' = ANY(section_order));
