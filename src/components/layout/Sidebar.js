"use client";

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { AccountPanel } from "@/components/layout/AccountPanel";

export function Sidebar({ me, active, onChange, onClaimTeacher }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-paper md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-gold-light">
          <GraduationCap size={20} strokeWidth={2} />
        </span>
        <span className="font-serif text-lg font-bold text-heading">English Class</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors",
                isActive ? "bg-navy text-white shadow-sm" : "text-muted hover:bg-hover hover:text-heading"
              )}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <AccountPanel me={me} onClaimTeacher={onClaimTeacher} />
      </div>
    </aside>
  );
}
