"use client";

import { LogOut, UserCog } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLogout } from "@/hooks/auth/useLogout";

/** Shared account block: who's signed in, theme toggle, and the two
 * account-level actions. Rendered inline in the desktop Sidebar footer and
 * inside the mobile header's dropdown. */
export function AccountPanel({ me, onClaimTeacher }) {
  const logout = useLogout();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar name={me.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-heading">{me.name}</p>
          <Badge tone="gold" className="mt-0.5">
            {me.role === "teacher" ? "Teacher" : "Student"}
          </Badge>
        </div>
        <ThemeToggle />
      </div>

      {me.role === "student" && (
        <button
          type="button"
          onClick={onClaimTeacher}
          className="flex items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 text-left text-sm font-semibold text-heading transition-colors hover:bg-hover"
        >
          <UserCog size={16} strokeWidth={2} />
          I&apos;m the teacher
        </button>
      )}

      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted transition-colors hover:bg-hover hover:text-danger disabled:opacity-60"
      >
        <LogOut size={16} strokeWidth={2} />
        Log out
      </button>
    </div>
  );
}
