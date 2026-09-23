import { cn } from "@/lib/utils";

export function ErrorBanner({ className, children }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={cn(
        "mb-3.5 animate-slide-down rounded-xl border border-danger-line bg-danger-bg px-3.5 py-2.5 text-sm text-danger",
        className
      )}
    >
      {children}
    </div>
  );
}
