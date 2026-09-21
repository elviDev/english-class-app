"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/config";

let browserClient;

/**
 * Singleton Supabase client for use in Client Components. Session cookies
 * are kept in sync with the server by @supabase/ssr, so a session started
 * here is also visible to Server Components, Route Handlers, and middleware.
 */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}
