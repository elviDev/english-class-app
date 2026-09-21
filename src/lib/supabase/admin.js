import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/config";

/**
 * Service-role Supabase client. Bypasses Row Level Security, so it may
 * ONLY be used inside trusted Route Handlers, after the caller's identity
 * has already been verified with the server (cookie-based) client. Never
 * import this from a Client Component.
 */
export function getSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || serviceKey.includes("YOUR_")) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
