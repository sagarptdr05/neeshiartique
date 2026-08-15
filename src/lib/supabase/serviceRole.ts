import { createClient } from '@supabase/supabase-js';

/**
 * Creates a privileged server-side Supabase client using the service role key.
 * This client bypasses Row Level Security (RLS) policies and should only be used 
 * for admin tasks (e.g., seeding data, updating profile roles).
 * 
 * CRITICAL: This file MUST NEVER be imported or used in client components.
 */
export function createServiceRoleClient() {
  // Prevent execution in client-side bundles
  if (typeof window !== 'undefined') {
    throw new Error('CRITICAL SECURITY VIOLATION: createServiceRoleClient executed on the client-side browser.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // Return dummy client to prevent server crash during build or local dev without config.
    return createClient('https://placeholder-project.supabase.co', 'placeholder-service-role-key');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
