"use client";

import { useSessionStore } from "@/stores/session-store";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";

export function RootView() {
  const status = useSessionStore((state) => state.status);
  const profile = useSessionStore((state) => state.profile);

  if (status === "signed-out") return <AuthScreen />;

  if (status === "loading" || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <EmptyState>Loading your account…</EmptyState>
      </div>
    );
  }

  return <AppShell me={profile} />;
}
