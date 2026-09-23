"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { AccountPanel } from "@/components/layout/AccountPanel";

export function MobileHeader({ me, onClaimTeacher }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-3 backdrop-blur-sm md:hidden">
      <span className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-gold-light">
          <GraduationCap size={16} strokeWidth={2} />
        </span>
        <span className="font-serif text-base font-bold text-heading">English Class</span>
      </span>

      <div className="relative" ref={panelRef}>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Account menu" aria-expanded={open}>
          <Avatar name={me.name} size="sm" />
        </button>
        {open && (
          <div className="absolute right-0 top-11 w-64 animate-slide-down rounded-2xl border border-line bg-paper p-4 shadow-lg">
            <AccountPanel
              me={me}
              onClaimTeacher={() => {
                setOpen(false);
                onClaimTeacher();
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
