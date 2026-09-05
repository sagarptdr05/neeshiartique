-- ===================================================
-- NEESHIARTIQUE CATALOG EXTENSIONS MIGRATION
-- Adds the remaining product fields the storefront needs,
-- introduces a coupons table, and seeds the current catalog
-- (categories, products, coupons) so the shop isn't empty
-- the moment Supabase is connected.
-- ===================================================

-- 1. Extend products with fields the frontend already relies on
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 99,
  ADD COLUMN IF NOT EXISTS personalization_options TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS shipping_time TEXT;

-- Unique SKUs (multiple NULLs are allowed by Postgres, but the app always
-- generates one, so this stays effectively NOT NULL in practice).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_sku_key'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_sku_key UNIQUE (sku);
  END IF;
END $$;

-- Guard the free-text status column the same way the TS type does.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_status_check'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_status_check CHECK (status IN ('active', 'archived'));
  END IF;
END $$;

-- ==========================================
-- 2. Coupons Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value INTEGER NOT NULL CHECK (value >= 0),
    min_subtotal INTEGER CHECK (min_subtotal >= 0),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Customers only ever need to see codes that are actually usable; admins
-- manage the full list (including disabled codes) via the "ALL" policy.
CREATE POLICY "Allow public select on active coupons" ON public.coupons FOR SELECT USING (active = true);
CREATE POLICY "Allow admin all on coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- ==========================================
-- 3. Seed: Categories
-- ==========================================
INSERT INTO public.categories (id, name, description, image) VALUES
  ('keychains', 'Crochet Keychains', 'Cute, pocket-sized handmade companions for your keys or bags.', '/images/butterfly_keychain.jpg'),
  ('flowers', 'Crochet Flowers', 'Handmade crochet flowers and floral creations that bloom forever.', '/images/flower_bookmark.jpg'),
  ('bookmarks', 'Crochet Bookmarks', 'Elegantly stitched stems and blossoms to mark your reading journeys.', '/images/flower_bookmark.jpg'),
  ('accessories', 'Crochet Accessories', 'Wearable handmade bows and bands that add soft texture to your hair.', '/images/hair_accessories.jpg'),
  ('gifts', 'Crochet Gifts', 'Beautifully bundled handmade sets perfect for birthdays and special moments.', '/images/custom_gift.jpg'),
  ('custom-crochet', 'Custom Crochet', 'Personalized designs custom-knitted in your favorite color patterns.', '/images/custom_gift.jpg')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. Seed: Products
-- ==========================================
INSERT INTO public.products (
  name, slug, description, short_description, price, compare_at_price, category_id,
  images, availability_status, made_to_order, preparation_time, materials, care_instructions,
  customization_available, personalization_options, featured, bestseller, is_new, status,
  sku, stock, shipping_time, created_at
) VALUES
  (
    'Crochet Butterfly Keychain', 'crochet-butterfly-keychain',
    'Add a touch of handcrafted sweetness to your keys, bag, or backpack with this lovely crochet butterfly keychain. Carefully stitched with high-quality, non-pilling cotton yarn, this keychain is durable and soft. It features a bright multi-colored butterfly wing pattern and three dangling flower buds that sway beautifully with movement. Each piece is unique and made with love.',
    'An adorable handmade crochet butterfly keychain featuring vibrant wings and dangling flower buds.',
    249, 299, 'keychains',
    ARRAY['/images/butterfly_keychain.jpg', '/images/evil_eye_keychain.jpg'], 'available', true, '2-3 days',
    ARRAY['100% Organic Cotton Yarn', 'Metal Key Ring', 'Hypoallergenic Fiberfill'],
    ARRAY['Gently hand wash in cold water with mild detergent.', 'Do not wring or squeeze aggressively.', 'Lay flat on a clean dry towel to air dry.', 'Do not bleach or iron.'],
    true, ARRAY['Vibrant Red & Orange (Default)', 'Dusty Pink & White', 'Sage Green & Beige', 'Lavender & Pastel Yellow'],
    true, true, true, 'active',
    'KC-BUTTERFLY-01', 12, '3-5 days', '2026-08-01T10:00:00Z'
  ),
  (
    'Crochet Evil Eye Keychain', 'crochet-evil-eye-keychain',
    'Stitched with precision, this crochet evil eye keychain is a wonderful charm to keep close. Featuring concentric circles of deep blue, white, soft blue, and a black pupil, it serves as both a fashionable accessory and a symbol of protection. Ideal for gifting to friends and family or keeping for yourself.',
    'A pocket-sized crochet evil eye keychain designed to bring good vibes and protect your keys.',
    199, NULL, 'keychains',
    ARRAY['/images/evil_eye_keychain.jpg', '/images/butterfly_keychain.jpg'], 'available', true, '1-2 days',
    ARRAY['Organic Cotton Yarn', 'Metal Key Ring', 'Wooden Bead Accent'],
    ARRAY['Spot clean with a damp cloth.', 'If fully washed, hand wash cold and air dry.', 'Avoid pulling on any yarn loops.'],
    false, '{}',
    true, true, false, 'active',
    'KC-EVILEYE-01', 18, '3-5 days', '2026-08-02T12:00:00Z'
  ),
  (
    'Crochet Flower Bookmark', 'crochet-flower-bookmark',
    'Never lose your place again with this beautiful handmade flower bookmark. A purple flower with a bright yellow center sits gracefully at the top of a long, green chain-stitched stem, finished with two delicate green leaves. It lies flat inside any book and peeks out elegantly, making it a perfect gift for book lovers.',
    'An elegant, long-stemmed crochet flower bookmark to accompany your reading sessions.',
    149, 179, 'bookmarks',
    ARRAY['/images/flower_bookmark.jpg', '/images/hair_accessories.jpg'], 'available', true, '1-2 days',
    ARRAY['Soft Cotton Yarn', 'Fabric Stiffener (for leaves)'],
    ARRAY['Lay flat and hand wash only if needed.', 'Reshape while damp and let air dry.', 'Steam iron on low setting if edges curl.'],
    true, ARRAY['Soft Purple (Default)', 'Blush Pink', 'Sunny Yellow', 'Pastel Blue'],
    true, false, true, 'active',
    'BM-FLOWER-01', 25, '3-5 days', '2026-08-03T09:00:00Z'
  ),
  (
    'Crochet Hair Bow Clips (Set of 2)', 'crochet-hair-bow-clips',
    'This set features two matching crochet bows mounted on secure alligator metal clips. Crafted from dusty blush pink cotton yarn, they add a warm, feminine, and artistic touch to any hairstyle. Sturdy construction ensures they stay in place comfortably all day long.',
    'A set of two soft, dusty blush pink crochet bow clips for a warm and elegant hair accessory.',
    129, NULL, 'accessories',
    ARRAY['/images/hair_accessories.jpg', '/images/flower_bookmark.jpg'], 'available', true, '2 days',
    ARRAY['Premium Cotton Yarn', 'Alligator Steel Clips', 'Hot Glue Adhesion'],
    ARRAY['Avoid contact with water to protect the metal clips from rusting.', 'Spot clean yarn parts gently if required.'],
    true, ARRAY['Blush Pink (Default)', 'Cocoa Brown', 'Creamy White', 'Sage Green'],
    false, true, true, 'active',
    'HA-BOWS-01', 15, '3-5 days', '2026-08-04T15:00:00Z'
  ),
  (
    'Crochet Mini Sunflower Pot', 'crochet-mini-sunflower-pot',
    'Stitched with soft cotton threads, this mini crochet sunflower potted plant is a delightful desk companion. Resting inside a tiny knitted brown pot, its bright yellow petals bring sunshine and warmth to any office desk, study table, dashboard, or shelf. Requires zero maintenance and makes a thoughtful gift!',
    'A cute, hand-stitched mini crochet sunflower in an adorable brown potted base.',
    299, NULL, 'flowers',
    ARRAY['/images/flower_bookmark.jpg', '/images/custom_gift.jpg'], 'available', true, '2-3 days',
    ARRAY['Cotton Threads', 'Fiberfill Stuffing', 'Recycled Cardboard Pot Base'],
    ARRAY['Dust gently with a soft dry brush.', 'Do not wash or submerge in water.', 'Reshape leaves if flattened during transit.'],
    false, '{}',
    true, true, true, 'active',
    'FL-SUNFLOWER-01', 8, '3-5 days', '2026-08-05T11:00:00Z'
  ),
  (
    'Custom Crochet Gift Box', 'custom-crochet-gift-box',
    'Make someone feel special with this small-batch customized gift box. We bundle a selection of Neeshiartique favorites (like keychains, flower bookmarks, and bow clips) inside a kraft gift box, wrapped in soft cotton ribbon and finished with a dried baby''s breath flower sprig. Include a handwritten message of your choice to complete this thoughtful gift.',
    'A beautifully packaged custom-crafted gift bundle complete with personalized notes.',
    499, NULL, 'gifts',
    ARRAY['/images/custom_gift.jpg', '/images/butterfly_keychain.jpg'], 'available', true, '4-6 days',
    ARRAY['Kraft Cardboard Box', 'Cotton Ribbon Wrapper', 'Dried Flowers', 'Handwritten Cardboard Tag'],
    ARRAY['Keep in dry storage.', 'Handle dried flowers gently.'],
    true, ARRAY['Default (1 Keychain + 1 Bookmark)', 'Double Keychain Box', 'Double Bookmark & Bows Box'],
    true, true, false, 'active',
    'GB-CUSTOM-01', 10, '3-5 days', '2026-08-06T14:30:00Z'
  ),
  (
    'Crochet Pink Blossom Hairclip', 'crochet-pink-blossom-hairclip',
    'Add a soft, romantic touch to your hair or outfit with this stunning hand-crafted pink blossom. Stitched using premium gradient pink and white cotton yarn, it features a shiny faux pearl centerpiece. Securely mounted on a high-quality metal clip, it stays in place comfortably all day. Perfect for casual wear, picnics, or gifting to someone special.',
    'A beautifully hand-crafted pink flower hair clip featuring a delicate pearl centerpiece and soft gradient petals.',
    159, NULL, 'accessories',
    ARRAY['/images/pink_flower.png'], 'available', true, '2 days',
    ARRAY['Premium Cotton Yarn', 'Faux Pearl Bead', 'Metal Hair Clip', 'Hot Glue'],
    ARRAY['Avoid contact with water to protect the metal clip.', 'Spot clean the petals gently if needed.'],
    true, ARRAY['Soft Pink (Default)', 'Peach Orange', 'Lavender Purple', 'Creamy White'],
    true, true, true, 'active',
    'HA-PINKFLOWER-01', 15, '3-5 days', '2026-08-15T12:00:00Z'
  ),
  (
    'Festive Crochet Damru Keychain', 'festive-crochet-damru-keychain',
    'Celebrate the divine spirit with this meticulously hand-crafted Damru keychain. Stitched with deep cocoa and cream cotton yarn, it mimics the traditional Shiva Damru structure with white threads and two dangling cords finished with tiny golden brass bells. Perfect as a car rear-view mirror charm, key companion, or a spiritual gift for loved ones during Sawan and festive seasons.',
    'A beautiful holy-themed brown and white crochet Damru keychain with dangling bells, representing peace and positivity.',
    199, NULL, 'keychains',
    ARRAY['/images/damru_keychain.jpg'], 'available', true, '2 days',
    ARRAY['Soft Cotton Yarn', 'Brass Bells', 'Metal Key Ring & Chain', 'Polyester Fiberfill'],
    ARRAY['Spot clean only.', 'Keep away from moisture to avoid bell tarnishing.'],
    false, '{}',
    true, true, true, 'active',
    'KC-DAMRU-01', 20, '3-5 days', '2026-08-15T12:10:00Z'
  ),
  (
    'Red Crochet Bow Hair Clips (Set of 2)', 'red-crochet-bow-hair-clips',
    'Brighten up your look with this set of two hand-knitted hair clips. Crafted from vibrant red cotton yarn, each oval-shaped clip is decorated with a sweet, contrast baby pink crochet bow. Sturdy metal alligator clips on the back ensure a secure hold. Ideal for adding a touch of vintage and handmade warmth to any outfit.',
    'A charming pair of deep red crochet hair clips adorned with contrast pink bows.',
    139, NULL, 'accessories',
    ARRAY['/images/red_bow_clips.jpg'], 'available', true, '2 days',
    ARRAY['Vibrant Cotton Yarn', 'Metal Alligator Clips', 'Hot Glue'],
    ARRAY['Keep dry to prevent metal clip rusting.', 'Gently brush off dust with a clean, dry cloth.'],
    true, ARRAY['Red with Pink Bows (Default)', 'Pink with White Bows', 'Navy Blue with Red Bows', 'Green with Cream Bows'],
    false, true, true, 'active',
    'HA-REDBOW-01', 18, '3-5 days', '2026-08-15T12:20:00Z'
  ),
  (
    'Crochet Mini Rose Bouquet Keychain', 'crochet-mini-rose-bouquet-keychain',
    'A bouquet of roses that lasts forever! This sweet keychain features a miniature hand-crocheted bouquet of red and pink roses, neatly wrapped in a pink crochet cone, tied with a delicate red and white striped ribbon. It comes with a sturdy silver key ring, making it a lovely charm for your keys, bag, or a cute valentine/anniversary gift.',
    'An adorable, hand-knitted mini pink rose bouquet keychain wrapped in a pink cone and tied with a ribbon.',
    249, NULL, 'keychains',
    ARRAY['/images/pink_bouquet.png'], 'available', true, '2-3 days',
    ARRAY['Organic Cotton Yarn', 'Metal Key Ring', 'Striped Ribbon', 'Fiberfill'],
    ARRAY['Spot clean gently with a damp cloth if necessary.', 'Do not machine wash or soak.'],
    true, ARRAY['Pink Bouquet (Default)', 'Red Roses Bouquet', 'Yellow Sunflower Bouquet', 'Purple Lavender Bouquet'],
    true, true, true, 'active',
    'KC-BOUQUET-01', 12, '3-5 days', '2026-08-15T12:30:00Z'
  ),
  (
    'Custom Crochet Letter Keychain', 'custom-crochet-letter-keychain',
    'Personalize your everyday carry with this custom crochet alphabet keychain! Hand-knitted in your choice of letters, each piece features a contrast white border and is adorned with an adorable miniature blue crown embedded with tiny pearls. Includes a metal key chain and ring, perfect as a thoughtful gift for birthdays, anniversaries, or a treat for yourself.',
    'A personalized, hand-stitched alphabet letter keychain with a cute matching crochet crown.',
    279, NULL, 'custom-crochet',
    ARRAY['/images/letter_s_keychain.png'], 'available', true, '3-4 days',
    ARRAY['High-quality Cotton Yarn', 'Faux Pearls', 'Metal Key Ring & Chain', 'Fiberfill'],
    ARRAY['Spot clean only.', 'Avoid contact with water to maintain key ring shine.'],
    true, ARRAY['Letter S (Default)', 'Custom Letter (A-Z) - Specify in notes', 'Color: Deep Blue & Cream (Default)', 'Color: Lavender & White', 'Color: Pastel Pink & White'],
    true, true, true, 'active',
    'KC-CUSTOM-LETTER', 25, '3-5 days', '2026-08-15T12:40:00Z'
  )
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 5. Seed: Coupons
-- ==========================================
INSERT INTO public.coupons (code, type, value, min_subtotal, active) VALUES
  ('LOVECROCHET', 'percentage', 10, NULL, true),
  ('NEESHIGIFT', 'fixed', 50, 300, true),
  ('WELCOME15', 'percentage', 15, NULL, true)
ON CONFLICT (code) DO NOTHING;
