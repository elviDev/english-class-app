"use client";

import { SmilePlus } from "lucide-react";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import { cn } from "@/lib/utils";

export function MessageReactions({ reactions, mine, onToggle }) {
  const hasReactions = Boolean(reactions?.length);

  return (
    <div className={cn("mt-1 flex flex-wrap items-center gap-1", mine ? "justify-end" : "justify-start")}>
      {reactions?.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onToggle(r.emoji)}
          title={r.userNames.join(", ")}
          className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
            r.mine ? "border-gold bg-gold/15 text-heading" : "border-line bg-paper text-muted hover:bg-hover"
          )}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}
      <EmojiPickerButton
        icon={<SmilePlus size={14} strokeWidth={2} />}
        label="Add reaction"
        align={mine ? "right" : "left"}
        onSelect={onToggle}
        buttonClassName={cn("h-6 w-6", !hasReactions && "opacity-50 hover:opacity-100")}
      />
    </div>
  );
}
