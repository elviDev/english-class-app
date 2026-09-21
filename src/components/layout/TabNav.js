"use client";

import { cn } from "@/lib/utils";

const TABS = [
  ["chat", "Class chat"],
  ["messages", "Messages"],
  ["assignments", "Assignments"],
  ["study", "Study Buddy"],
];

export function TabNav({ active, onChange }) {
  return (
    <nav className="flex overflow-x-auto border-b border-line bg-white px-3">
      {TABS.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "whitespace-nowrap border-b-[3px] border-transparent px-4 py-3.5 font-bold text-muted transition-colors",
            active === key && "border-gold text-navy"
          )}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
