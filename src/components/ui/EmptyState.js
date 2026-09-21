import { cn } from "@/lib/utils";

export function EmptyState({ className, children }) {
  return <p className={cn("px-2.5 py-[30px] text-center italic text-muted", className)}>{children}</p>;
}
