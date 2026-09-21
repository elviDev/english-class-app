"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ClaimTeacherBar } from "@/components/auth/ClaimTeacherBar";
import { useLogout } from "@/hooks/auth/useLogout";

export function TopBar({ me }) {
  const [showClaim, setShowClaim] = useState(false);
  const logout = useLogout();

  return (
    <>
      <header className="flex items-center justify-between bg-navy px-5 py-3.5 text-white">
        <span className="font-serif text-xl font-bold">English Class</span>
        <span className="flex items-center gap-3.5 text-sm">
          <span>{me.name}</span>
          <Badge tone="gold">{me.role === "teacher" ? "Teacher" : "Student"}</Badge>
          {me.role === "student" && (
            <Button variant="topbar" className="border-dashed" onClick={() => setShowClaim(true)}>
              I&apos;m the teacher
            </Button>
          )}
          <Button variant="topbar" onClick={() => logout.mutate()} disabled={logout.isPending}>
            Log out
          </Button>
        </span>
      </header>
      {showClaim && <ClaimTeacherBar onClose={() => setShowClaim(false)} />}
    </>
  );
}
