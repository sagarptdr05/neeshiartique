# Neeshiartique Platform Security Guide

This document describes the security architecture, design patterns, and deployment requirements of the Neeshiartique platform.

---

## 1. Security Architecture

Neeshiartique utilizes a **client-server split** where the frontend is fully inspectable, but all security-sensitive operations, secrets, and database credentials reside strictly on the server-side.

```
┌─────────────────────────────────┐
│     Client Browser Bundle       │ (Inspectable storefront UI)
│   (createBrowserClient - Anon)  │
└────────────────┬────────────────┘
                 │ (Secure HTTP/HTTPS requests)
                 ▼
┌─────────────────────────────────┐
│      Next.js Server API         │ (Protected server boundary)
│   (createServerClient - Anon)   │
└────────────────┬────────────────┘
                 │ (Internal secure DB query)
                 ▼
┌─────────────────────────────────┐
│       Supabase PostgreSQL       │ (RLS policies + triggers)
└─────────────────────────────────┘
```

---

## 2. Authentication & Authorization

Authentication is offloaded entirely to **Supabase Auth**.

### 2.1 Unified Login
- Customers and administrators sign in using the exact same form. No role selector is visible on the client-side.
- The server determines the user's role on authentication and redirects them:
  - **Admin** → `/admin`
  - **Customer** → `/account`

### 2.2 Server-Side Role Gating
Authorization checks are verified at two server-side levels:
1. **Middleware Level (`src/middleware.ts`)**: Gating routes matching `/admin/:path*` by reading the token/session and looking up the role.
2. **Database Level (RLS)**: PostgreSQL query checks using the `public.is_admin()` SQL function.

---

## 3. Database Row Level Security (RLS)

RLS is enabled on all PostgreSQL tables. Database operations are restricted using matching user IDs (`auth.uid()`).

- **`profiles`**: Customers can read/update their own profile. Self-role escalation is blocked by a policy constraint on modification checks.
- **`orders` / `order_items`**: Gated by matching the profile ID associated with `auth.uid()`. Customers can only select or insert their own orders.
- **`contact_messages`**: Insert is open publicly (for the Contact form), but read/delete is restricted strictly to users with the `admin` role.
- **`custom_orders`**: Gated by the customer's profile ID. Only admins can query all requests.

---

## 4. Secret Management

- Public environment variables (prefixed with `NEXT_PUBLIC_`) contain only safe credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`) must never be prefixed with `NEXT_PUBLIC_` or imported into client components.
- The service-role client code (`src/lib/supabase/serviceRole.ts`) features client-side compilation blocks:
  ```typescript
  if (typeof window !== 'undefined') {
    throw new Error('CRITICAL SECURITY VIOLATION: Service client running on browser.');
  }
  ```
- All secret environment variables must be stored in `.env.local` which is ignored by `.gitignore`.

---

## 5. Input Validation & Parameterized Queries

- All endpoints parse payloads using **Zod schemas** (`src/lib/validation.ts`) to ensure data sanitization.
- User input is never concatenated directly into database queries. All operations use the Supabase JS client which constructs parameterized queries by default.
- State-changing actions (such as order tracking updates) must go through rigorous server-side status checks.

---

## 6. File Upload Security

- Storage buckets are partitioned:
  - `product-images` (Publicly readable)
  - `custom-order-images` (Authenticated customer read-only / Admin read-write)
  - `artist-images` (Publicly readable)
- Upload files must be validated for MIME type (e.g., `image/png`, `image/jpeg`) and size.
- Safe paths should use auto-generated UUIDs rather than trusting customer filenames to prevent directory traversal attacks.

---

## 7. Production Deployment Requirements

1. **Mandatory HTTPS**: All credentials and session cookies must be served over HTTPS. In `production`, cookies are set with the `secure` flag.
2. **Security Headers**: Enable standard security headers:
   - `Content-Security-Policy` (CSP)
   - `X-Frame-Options: DENY` (Clickjacking prevention)
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Strict-Transport-Security` (HSTS)

---

## 8. Incident Response & Credential Rotation

If credentials or keys are leaked:
1. Immediately regenerate the `anon` and `service_role` keys in the Supabase Dashboard (`Settings -> API`).
2. Update the environment variables in your hosting environment (e.g., Vercel, Netlify).
3. Redeploy the application.
4. Verify that the previous keys return a `401 Unauthorized` response to invalid requests.
