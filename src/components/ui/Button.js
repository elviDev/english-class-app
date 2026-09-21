import { cn } from "@/lib/utils";

const variants = {
  primary:
    "w-full rounded-lg bg-navy py-3 font-bold text-white transition-colors hover:bg-navy-dark disabled:cursor-default disabled:opacity-60",
  outline:
    "rounded-lg border border-dashed border-line bg-transparent px-3.5 py-1.5 text-sm text-navy transition-colors hover:bg-cream",
  topbar:
    "rounded-lg border border-white/50 bg-transparent px-3.5 py-1.5 text-sm text-white transition-colors hover:bg-white/10",
  pill: "rounded-full bg-gold px-5 font-bold text-navy-dark transition-colors disabled:opacity-60",
};

export function Button({ variant = "primary", className, ...props }) {
  return <button className={cn(variants[variant], className)} {...props} />;
}
