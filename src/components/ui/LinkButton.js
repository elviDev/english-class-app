import { cn } from "@/lib/utils";

export function LinkButton({ className, ...props }) {
  return (
    <button
      type="button"
      className={cn("border-none bg-transparent p-0 font-bold text-heading underline underline-offset-2", className)}
      {...props}
    />
  );
}
