"use client";

import { GraduationCap } from "lucide-react";
import { useSessionStore } from "@/stores/session-store";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { AppShell } from "@/components/layout/AppShell";

export function RootView() {
  const status = useSessionStore((state) => state.status);
  const profile = useSessionStore((state) => state.profile);

  if (status === "signed-out") return <AuthScreen />;

  if (status === "loading" || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6">
        <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-navy text-gold-light">
          <GraduationCap size={24} strokeWidth={2} />
        </span>
      </div>
    );
  }

  return <AppShell me={profile} />;
}
