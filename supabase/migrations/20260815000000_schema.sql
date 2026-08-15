-- ==========================================
-- NEESHIARTIQUE DATABASE SCHEMA MIGRATION
-- ==========================================

-- 1. Custom Types / Enums
CREATE TYPE user_role_enum AS ENUM ('customer', 'admin');
CREATE TYPE availability_status_enum AS ENUM ('available', 'temporarily_unavailable', 'discontinued');
CREATE TYPE order_status_enum AS ENUM ('pending_payment', 'payment_received', 'confirmed', 'being_crafted', 'quality_check', 'packed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status_enum AS ENUM ('awaiting_payment', 'payment_received', 'payment_verified', 'payment_issue', 'refunded');
CREATE TYPE custom_order_status_enum AS ENUM ('new', 'contacted', 'discussion', 'approved', 'payment_pending', 'confirmed', 'being_crafted', 'completed', 'rejected');

-- 2. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Categories Table
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY, -- e.g., 'keychains', 'flowers'
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    compare_at_price INTEGER CHECK (compare_at_price >= 0),
    category_id TEXT REFERENCES public.categories(id) ON DELETE RESTRICT,
    images TEXT[] NOT NULL DEFAULT '{}',
    availability_status availability_status_enum NOT NULL DEFAULT 'available',
    made_to_order BOOLEAN NOT NULL DEFAULT true,
    preparation_time TEXT,
    materials TEXT[] DEFAULT '{}',
    care_instructions TEXT[] DEFAULT '{}',
    customization_available BOOLEAN NOT NULL DEFAULT false,
    featured BOOLEAN NOT NULL DEFAULT false,
    bestseller BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    shipping_amount INTEGER NOT NULL CHECK (shipping_amount >= 0),
    discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total INTEGER NOT NULL CHECK (total >= 0),
    payment_status payment_status_enum NOT NULL DEFAULT 'awaiting_payment',
    order_status order_status_enum NOT NULL DEFAULT 'pending_payment',
    customer_notes TEXT,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_pincode TEXT NOT NULL,
    payment_received_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    crafting_started_at TIMESTAMP WITH TIME ZONE,
    quality_checked_at TIMESTAMP WITH TIME ZONE,
    packed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    carrier TEXT DEFAULT 'India Post',
    tracking_number TEXT,
    shipping_date TIMESTAMP WITH TIME ZONE,
    tracking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Order Items Table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL, -- Snapshot of product name at order time
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0), -- Snapshot of price at order time
    total_price INTEGER NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Custom Orders Table
CREATE TABLE public.custom_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    product_type TEXT NOT NULL,
    occasion TEXT,
    preferred_color TEXT,
    size TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    budget TEXT,
    required_date DATE NOT NULL,
    personalization_details TEXT,
    reference_image_path TEXT,
    additional_message TEXT,
    status custom_order_status_enum NOT NULL DEFAULT 'new',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Contact Messages Table
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Wishlists Table
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(customer_id, product_id)
);

-- 10. Customer Addresses Table
CREATE TABLE public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 11. INDEXES FOR PERFORMANCE & LOOKUP
-- ==========================================
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_custom_orders_customer ON public.custom_orders(customer_id);
CREATE INDEX idx_wishlists_customer ON public.wishlists(customer_id);
CREATE INDEX idx_addresses_customer ON public.customer_addresses(customer_id);

-- ==========================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if the current user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Profiles Policies
CREATE POLICY "Allow public read of profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE 
  USING (auth.uid() = auth_user_id) 
  WITH CHECK (auth.uid() = auth_user_id AND role = (SELECT role FROM public.profiles WHERE auth_user_id = auth.uid())); -- Prevent self role escalation

-- Categories Policies
CREATE POLICY "Allow public select on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admin write on categories" ON public.categories FOR ALL USING (public.is_admin());

-- Products Policies
CREATE POLICY "Allow public select on products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Allow admin write on products" ON public.products FOR ALL USING (public.is_admin());

-- Orders Policies
CREATE POLICY "Allow users to insert own orders" ON public.orders FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = customer_id AND auth_user_id = auth.uid()
  )
);
CREATE POLICY "Allow users to select own orders" ON public.orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = customer_id AND auth_user_id = auth.uid()
  ) OR public.is_admin()
);
CREATE POLICY "Allow admin all on orders" ON public.orders FOR ALL USING (public.is_admin());

-- Order Items Policies
CREATE POLICY "Allow users to select own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.profiles p ON o.customer_id = p.id
    WHERE o.id = order_id AND p.auth_user_id = auth.uid()
  ) OR public.is_admin()
);
CREATE POLICY "Allow users to insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.profiles p ON o.customer_id = p.id
    WHERE o.id = order_id AND p.auth_user_id = auth.uid()
  )
);
CREATE POLICY "Allow admin all on order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Custom Orders Policies
CREATE POLICY "Allow users to insert custom orders" ON public.custom_orders FOR INSERT WITH CHECK (
  customer_id IS NULL OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = customer_id AND auth_user_id = auth.uid()
  )
);
CREATE POLICY "Allow users to select own custom orders" ON public.custom_orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = customer_id AND auth_user_id = auth.uid()
  ) OR public.is_admin()
);
CREATE POLICY "Allow admin all on custom orders" ON public.custom_orders FOR ALL USING (public.is_admin());

-- Contact Messages Policies
CREATE POLICY "Allow public insert of contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin select/update/delete contact messages" ON public.contact_messages FOR ALL USING (public.is_admin());

-- Wishlists Policies
CREATE POLICY "Allow users to select own wishlist" ON public.wishlists FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = customer_id AND auth_user_id = auth.uid()
  )
);
CREATE POLICY "Allow users to insert own wishlist" ON public.wishlists FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = customer_id AND auth_user_id = auth.uid()
  )
);
CREATE POLICY "Allow users to delete own wishlist" ON public.wishlists FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = customer_id AND auth_user_id = auth.uid()
  )
);

-- Customer Addresses Policies
CREATE POLICY "Allow users to manage own addresses" ON public.customer_addresses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = customer_id AND auth_user_id = auth.uid()
  ) OR public.is_admin()
);

-- ==========================================
-- 13. AUTOMATED PROFILE ON AUTH SIGNUP
-- ==========================================

-- Trigger to automatically create a profile record when a new user registers in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Valued Customer'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
