import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Landing point for Supabase auth emails (password recovery today, any
// future magic-link/email-change confirmation later). Verifying the
// one-time token here, on the server, is what sets the session cookie
// via getSupabaseServerClient - the page it redirects to then already
// has an active session, no token handling of its own required.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const rawNext = searchParams.get("next") || "/";
  const next = rawNext.startsWith("http") ? rawNext : `${origin}${rawNext}`;

  if (tokenHash && type) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) {
        return NextResponse.redirect(next);
      }
    }
  }

  // Expired, already-used, or malformed link: send them back to the page
  // that knows how to explain that and offer a new one.
  return NextResponse.redirect(`${origin}/reset-password`);
}
