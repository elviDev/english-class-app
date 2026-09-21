"use client";

import { createContext, useContext } from "react";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

/**
 * Vanilla store factory. A NEW instance is created per request/mount (see
 * SessionProvider) instead of a module-level singleton, since a singleton
 * store would be shared by every concurrent request on the Node server and
 * leak one visitor's session into another's server-rendered HTML.
 */
export function createSessionStore({ session = null, profile = null } = {}) {
  return createStore((set) => ({
    session,
    profile,
    status: session ? "signed-in" : "signed-out",

    setSession: (nextSession) =>
      set((state) => ({
        session: nextSession,
        status: nextSession ? "signed-in" : "signed-out",
        profile: nextSession ? state.profile : null,
      })),

    setProfile: (profile) => set({ profile }),
  }));
}

export const SessionStoreContext = createContext(null);

/** Read from the current request's session store. Must be used under <SessionProvider>. */
export function useSessionStore(selector) {
  const store = useContext(SessionStoreContext);
  if (!store) throw new Error("useSessionStore must be used within <SessionProvider>");
  return useStore(store, selector);
}
