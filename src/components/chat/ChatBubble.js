import { cn, formatTime } from "@/lib/utils";

const variantStyles = {
  mine: "self-end rounded-br-[3px] bg-navy text-white",
  theirs: "self-start rounded-bl-[3px] border border-line bg-cream text-ink",
  ai: "self-start rounded-bl-[3px] border border-ai-line bg-ai-bg text-ink",
};

export function ChatBubble({ mine, name, text, time, variant }) {
  const style = variant === "ai" ? variantStyles.ai : mine ? variantStyles.mine : variantStyles.theirs;
  return (
    <div className={cn("max-w-[75%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[0.98rem]", style)}>
      <div className="mb-0.5 text-xs font-bold opacity-75">
        {mine ? "You" : name}
        {time ? ` · ${formatTime(time)}` : ""}
      </div>
      {text}
    </div>
  );
}
