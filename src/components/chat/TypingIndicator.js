import { Avatar } from "@/components/ui/Avatar";

export function TypingIndicator({ name, variant }) {
  return (
    <div className="flex animate-fade-in items-end gap-2 self-start">
      <Avatar name={name} variant={variant} size="sm" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-[4px] border border-line bg-cream px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
      </div>
    </div>
  );
}
