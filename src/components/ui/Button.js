import { cn } from "@/lib/utils";

const variants = {
  primary:
    "w-full rounded-xl bg-navy py-3 font-bold text-white shadow-sm transition-all duration-150 hover:bg-navy-dark hover:shadow-md active:scale-[0.98] disabled:cursor-default disabled:opacity-60 disabled:active:scale-100",
  secondary:
    "w-full rounded-xl border border-line bg-transparent py-3 font-bold text-heading transition-all duration-150 hover:bg-hover active:scale-[0.98] disabled:cursor-default disabled:opacity-60",
  topbar:
    "rounded-lg border border-white/25 bg-white/5 px-3.5 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/15",
  pill: "rounded-full bg-gold px-5 font-bold text-navy-dark shadow-sm transition-all duration-150 hover:brightness-105 hover:shadow-md active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100",
};

export function Button({ variant = "primary", className, ...props }) {
  return <button className={cn(variants[variant], className)} {...props} />;
}
