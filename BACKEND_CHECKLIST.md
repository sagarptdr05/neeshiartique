# Backend & Supabase Deployment Checklist

Follow this checklist when migrating from local simulated databases to the live production Supabase instance.

---

## 1. Supabase Initialization
- [ ] Create a new project in the Supabase Dashboard.
- [ ] Verify database connection settings are visible under API settings.
- [ ] Create environment configuration in your hosting dashboard:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (Server-only secret)
- [ ] Deploy environment configuration locally inside `.env.local`.

---

## 2. Database Schema & Migration
- [ ] Run the migration script `supabase/migrations/20260815000000_schema.sql` in SQL Editor.
- [ ] Verify the following tables are created:
  - [ ] `profiles`
  - [ ] `categories`
  - [ ] `products`
  - [ ] `orders`
  - [ ] `order_items`
  - [ ] `custom_orders`
  - [ ] `contact_messages`
  - [ ] `wishlists`
  - [ ] `customer_addresses`
- [ ] Verify that Row Level Security (RLS) is enabled on all tables.
- [ ] Verify that triggers (`on_auth_user_created`) are active.

---

## 3. Storage Configuration
- [ ] Create public bucket `product-images` and apply select-all read policies.
- [ ] Create public bucket `artist-images` and apply select-all read policies.
- [ ] Create private bucket `custom-order-images` and apply selective owner-read policies.
- [ ] Set write access for all buckets to admin role only (except insert custom-order-images).

---

## 4. Authentication Verification
- [ ] Enable Email Provider in Supabase Auth.
- [ ] Turn off "Confirm Email" for testing if desired.
- [ ] Sign up a new customer via storefront `/register`:
  - [ ] Check profile row created automatically in `public.profiles`.
  - [ ] Check default role is set to `customer`.
- [ ] Register `neeshita.art27@gmail.com`:
  - [ ] Run the admin escalation query:
    ```sql
    UPDATE public.profiles SET role = 'admin' WHERE email = 'neeshita.art27@gmail.com';
    ```

---

## 5. Security & Authorization Gating
- [ ] Test `/admin` URL access with a customer account (should redirect to `/account`).
- [ ] Test `/admin` URL access as a guest (should redirect to `/login`).
- [ ] Verify that database operations (orders, messages, custom orders) are blocked by RLS policies when calling from unauthenticated sources.
- [ ] Run typescript compile checks (`npx tsc --noEmit`).
- [ ] Compile production bundles (`npm run build`).

---

## 6. Gifting & Order Workflows
- [ ] Test the public Contact form:
  - [ ] Verify message details are written to `contact_messages` table.
  - [ ] Verify status starts as `unread`.
- [ ] Log in as Admin:
  - [ ] Navigate to `/admin/messages` and verify you can view all submissions.
  - [ ] Check inbox message counter metrics update.
- [ ] Test placing a custom order:
  - [ ] Verify submission goes to database table `custom_orders`.
- [ ] Test placing a shop order:
  - [ ] Check `orders` and `order_items` are populated with catalog snapshots.
  - [ ] Verify default payment status is `awaiting_payment` and order status is `pending_payment`.
  - [ ] Confirm WhatsApp order share opens correctly.
  - [ ] Verify Admin can advance order states, input tracking info (carrier: India Post), and confirm payment manually.
