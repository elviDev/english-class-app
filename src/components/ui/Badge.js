import { cn } from "@/lib/utils";

const tones = {
  gold: "bg-gold text-navy-dark",
  good: "bg-good text-white",
  muted: "bg-muted text-white",
};

export function Badge({ tone = "gold", className, children }) {
  return (
    <span className={cn("inline-block rounded-full px-3 py-[3px] text-xs font-bold", tones[tone], className)}>
      {children}
    </span>
  );
}
