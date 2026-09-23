import { Avatar } from "@/components/ui/Avatar";
import { MessageReactions } from "@/components/chat/MessageReactions";
import { cn, formatTime } from "@/lib/utils";

const bubbleStyles = {
  mine: "rounded-br-[4px] bg-navy text-white",
  theirs: "rounded-bl-[4px] border border-line bg-cream text-ink",
  ai: "rounded-bl-[4px] border border-ai-line bg-ai-bg text-ink",
};

export function ChatBubble({ mine, name, text, time, variant, reactions, onToggleReaction }) {
  const style = variant === "ai" ? bubbleStyles.ai : mine ? bubbleStyles.mine : bubbleStyles.theirs;
  const avatarName = variant === "ai" ? "Study Buddy" : name;

  return (
    <div
      className={cn(
        "flex max-w-[85%] animate-fade-in flex-col",
        mine ? "self-end items-end" : "self-start items-start"
      )}
    >
      <div className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
        <Avatar name={avatarName} variant={variant === "ai" ? "ai" : undefined} size="sm" />
        <div className={cn("min-w-0 whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[0.98rem] shadow-sm", style)}>
          <div className="mb-0.5 text-xs font-bold opacity-75">
            {mine ? "You" : name}
            {time ? ` · ${formatTime(time)}` : ""}
          </div>
          {text}
        </div>
      </div>
      {onToggleReaction && (
        <div className={mine ? "mr-11" : "ml-11"}>
          <MessageReactions reactions={reactions} mine={mine} onToggle={onToggleReaction} />
        </div>
      )}
    </div>
  );
}
