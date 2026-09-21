import { cn } from "@/lib/utils";

export function Panel({ className, children }) {
  return <div className={cn("mb-[18px] rounded-xl border border-line bg-paper p-5", className)}>{children}</div>;
}
