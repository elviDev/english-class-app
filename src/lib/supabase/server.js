import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/config";

/**
 * Supabase client for Server Components and Route Handlers. Reads/writes
 * the auth cookies for the current request, so `auth.getUser()` reflects
 * whichever user's session cookie the browser sent, no manual bearer
 * token handling required.
 */
export async function getSupabaseServerClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render; middleware already
          // refreshes the session cookie on the request/response, so this
          // write can be safely ignored here.
        }
      },
    },
  });
}
