import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-[#1f3a5f]",
  "bg-[#b8860b]",
  "bg-[#5b4b8a]",
  "bg-[#3c7a5a]",
  "bg-[#b3432b]",
  "bg-[#2c6e8f]",
  "bg-[#8a5a44]",
];

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

function colorForName(name) {
  const str = name || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Initial-based avatar with a color derived from the name, or the Study
 * Buddy "ai" variant, which gets a fixed sparkle mark instead of initials. */
export function Avatar({ name, size = "md", variant, className }) {
  if (variant === "ai") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 select-none items-center justify-center rounded-full bg-ai text-white",
          SIZES[size],
          className
        )}
        aria-hidden="true"
      >
        <Sparkles size={size === "sm" ? 14 : size === "lg" ? 22 : 16} strokeWidth={2} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold text-white",
        SIZES[size],
        colorForName(name),
        className
      )}
      aria-hidden="true"
    >
      {initialsFor(name)}
    </span>
  );
}
