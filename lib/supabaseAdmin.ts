import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient<any> | null | undefined;

export function supabaseAdmin(): SupabaseClient<any> | null {
  if (cached !== undefined) return cached;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    cached = null;
    return cached;
  }

  cached = createClient<any>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  return cached;
}
