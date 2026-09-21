"use client";

import { useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { createSessionStore, SessionStoreContext, useSessionStore } from "@/stores/session-store";
import { useProfileQuery } from "@/hooks/auth/useProfileQuery";

/**
 * Bridges server-known auth state into the client. The store is seeded
 * synchronously from whatever the server already resolved (see app/page.js),
 * so there is no loading flash, then kept live via Supabase's
 * onAuthStateChange and a cached profile query (so a role change, e.g.
 * claiming teacher, shows up without a full reload).
 */
export function SessionProvider({ initialSession, initialProfile, children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = createSessionStore({ session: initialSession, profile: initialProfile });
  }

  return (
    <SessionStoreContext.Provider value={storeRef.current}>
      <AuthSync initialSession={initialSession} initialProfile={initialProfile} />
      {children}
    </SessionStoreContext.Provider>
  );
}

function AuthSync({ initialSession, initialProfile }) {
  const setSession = useSessionStore((state) => state.setSession);
  const setProfile = useSessionStore((state) => state.setProfile);
  const session = useSessionStore((state) => state.session);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return undefined;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => sub.subscription.unsubscribe();
  }, [setSession]);

  const userId = session?.user?.id;
  const isInitialUser = userId === initialSession?.user?.id;
  const profileQuery = useProfileQuery(userId, isInitialUser ? initialProfile : undefined);

  useEffect(() => {
    setProfile(userId ? profileQuery.data ?? null : null);
  }, [userId, profileQuery.data, setProfile]);

  return null;
}
