"use client";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";

export function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
              isActive ? "text-heading" : "text-muted"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
