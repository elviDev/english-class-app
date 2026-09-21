import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const ChatScroll = forwardRef(function ChatScroll({ className, children }, ref) {
  return (
    <div ref={ref} className={cn("flex h-[52vh] flex-col gap-2.5 overflow-y-auto px-1 py-1.5", className)}>
      {children}
    </div>
  );
});
