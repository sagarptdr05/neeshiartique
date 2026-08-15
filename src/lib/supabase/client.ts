import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for safe use inside client components (browser-side).
 * Relies on public environment variables.
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Graceful warning during build or local dev when credentials aren't provided yet
    if (typeof window !== 'undefined') {
      console.warn('Supabase Browser Client: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    // Return dummy client to prevent crash, fallback will handle data loading
    return createSupabaseBrowserClient('https://placeholder-project.supabase.co', 'placeholder-anon-key');
  }

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
}
