import { cn } from "@/lib/utils";

export function Panel({ className, children }) {
  return (
    <div
      className={cn(
        "mb-[18px] rounded-2xl border border-line bg-paper p-5 shadow-[0_1px_3px_rgb(0_0_0_/_4%)] dark:shadow-[0_1px_3px_rgb(0_0_0_/_20%)]",
        className
      )}
    >
      {children}
    </div>
  );
}
