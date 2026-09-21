import { cn } from "@/lib/utils";

const fieldStyles =
  "w-full rounded-lg border-[1.5px] border-line bg-white px-3 py-2.5 text-ink focus:border-gold focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-gold";

export function Input({ className, ...props }) {
  return <input className={cn(fieldStyles, className)} {...props} />;
}

export function TextArea({ className, ...props }) {
  return <textarea className={cn(fieldStyles, "min-h-[38px]", className)} {...props} />;
}
