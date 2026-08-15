# Supabase Integration Setup Guide

Follow this guide to connect the Neeshiartique frontend to your live Supabase project.

---

## 1. Create a Supabase Project
1. Log in to your [Supabase Dashboard](https://supabase.com).
2. Click **New Project** and choose your organization.
3. Choose a project name, database password, and your nearest deployment region.
4. Click **Create New Project**.

---

## 2. Configure Environment Variables
1. Navigate to **Project Settings -> API** in the Supabase Dashboard.
2. Copy your **Project URL**, **anon public key**, and **service_role secret key**.
3. Create a `.env.local` file in the root of your local project directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_copied_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_copied_anon_public_key
   SUPABASE_SERVICE_ROLE_KEY=your_copied_service_role_secret_key
   ```

---

## 3. Run Database Migrations
1. Navigate to **SQL Editor** in the Supabase Dashboard.
2. Click **New Query**.
3. Copy the contents of the migration file:
   [supabase/migrations/20260815000000_schema.sql](file:///Users/sagar/Desktop/neeshita/supabase/migrations/20260815000000_schema.sql)
4. Paste it into the SQL Editor and click **Run**. This will create the required tables, indexes, triggers, and Row Level Security (RLS) policies.

---

## 4. Configure Authentication Settings
1. Navigate to **Authentication -> Providers** in the Supabase Dashboard.
2. Verify that the **Email** provider is enabled.
3. (Optional) Turn off **Confirm Email** during local development/testing to sign in registered users immediately.
4. Navigate to **Authentication -> Email Templates** and configure the redirect URL templates pointing to your production storefront domain.

---

## 5. Configure Storage Buckets
1. Navigate to **Storage** in the Supabase Dashboard.
2. Create three new buckets:
   - **`product-images`**:
     - Make it **Public** (so anyone can read the product photos).
   - **`artist-images`**:
     - Make it **Public** (for artist profile portraits).
   - **`custom-order-images`**:
     - Keep it **Private** (to protect customer-uploaded custom request file attachments).
3. Create the following RLS policies for storage objects:
   - **`product-images` / `artist-images`**:
     - `Select`: Allow all (public).
     - `Insert/Update/Delete`: Restrict to `admin` role (using helper function `public.is_admin()`).
   - **`custom-order-images`**:
     - `Select`: Restrict to owner (check `owner = auth.uid()`) and admins.
     - `Insert`: Restrict to authenticated users.
     - `Delete`: Restrict to owners and admins.

---

## 6. Create the Administrator Account
To assign the admin role to your official address `neeshita.art27@gmail.com`:
1. Register the account through the storefront signup form (`/register`) or directly via the **Authentication** panel in the Supabase Dashboard.
2. Navigate to **SQL Editor** in the Supabase Dashboard.
3. Run the following update query:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'neeshita.art27@gmail.com';
   ```
4. This assigns `admin` privileges to the profile. Row Level Security policies and server-side middleware will now allow access to `/admin` dashboard panels and restricted endpoints.

---

## 7. Testing & Verification
Once connected:
1. **Test Registration**: Sign up a new customer account, and verify that a row is automatically created in `public.profiles` with `role = 'customer'`.
2. **Test Admin Access**: Sign in with `neeshita.art27@gmail.com` and verify that the app redirects to `/admin`.
3. **Test Route Security**: Log in as a customer and attempt to visit `/admin` directly; the middleware should block the request and redirect to `/account`.
4. **Test Order Workflow**: Place an order, verify that details populate the database `orders` table, and confirm that the WhatsApp order trigger operates correctly.
5. **Test Messages**: Submit the public Contact form, then log in as Admin and verify the message appears inside the dashboard Messages tab.
