import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ConfigWarning } from "@/components/auth/ConfigWarning";
import { SessionProvider } from "@/providers/SessionProvider";
import { RootView } from "@/components/layout/RootView";

export default async function Page() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[420px] rounded-2xl border border-line bg-paper p-9">
          <ConfigWarning />
        </div>
      </div>
    );
  }

  const supabase = await getSupabaseServerClient();
  // getUser() revalidates the token with the auth server, so this is the
  // trustworthy check for "is someone really signed in", unlike reading
  // the session straight out of the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile = null;
  if (user) {
    const { data: sessionData } = await supabase.auth.getSession();
    initialSession = sessionData.session;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    initialProfile = profile;
  }

  return (
    <SessionProvider initialSession={initialSession} initialProfile={initialProfile}>
      <RootView />
    </SessionProvider>
  );
}
