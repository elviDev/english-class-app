import { cn } from "@/lib/utils";

const fieldStyles =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-ink transition-colors placeholder:text-muted/70 focus:border-gold focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-gold/50";

export function Input({ className, ...props }) {
  return <input className={cn(fieldStyles, className)} {...props} />;
}

export function TextArea({ className, ...props }) {
  return <textarea className={cn(fieldStyles, "min-h-[38px]", className)} {...props} />;
}
