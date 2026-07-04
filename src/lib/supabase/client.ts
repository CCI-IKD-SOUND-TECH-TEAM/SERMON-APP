import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client. Safe to use in Client Components.
 * Uses NEXT_PUBLIC_* env vars only — never exposes the service role key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
