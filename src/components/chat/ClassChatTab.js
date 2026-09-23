"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChatSkeleton } from "@/components/ui/Skeleton";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatScroll } from "@/components/chat/ChatScroll";
import { ChatInputForm } from "@/components/chat/ChatInputForm";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useGroupMessages } from "@/hooks/chat/useGroupMessages";
import { useSendGroupMessage } from "@/hooks/chat/useSendGroupMessage";
import { useGroupReactions } from "@/hooks/chat/useGroupReactions";
import { useToggleGroupReaction } from "@/hooks/chat/useToggleGroupReaction";
import { chatMessageSchema } from "@/schemas/chat";
import { groupReactionsByMessage } from "@/lib/reactions";

export function ClassChatTab({ me }) {
  const { data: messages, isLoading } = useGroupMessages();
  const { data: reactionRows } = useGroupReactions();
  const sendMessage = useSendGroupMessage(me);
  const toggleReaction = useToggleGroupReaction(me);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useAutoScroll([messages]);

  const reactionsByMessage = groupReactionsByMessage(reactionRows ?? [], me.id);

  function handleToggleReaction(messageId, emoji) {
    const existing = reactionsByMessage[messageId]?.find((r) => r.emoji === emoji);
    toggleReaction.mutate({ messageId, emoji, reactionId: existing?.mine ? existing.mineReactionId : null });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = chatMessageSchema.safeParse({ text: input });
    if (!parsed.success) return;
    setInput("");
    setError("");
    try {
      await sendMessage.mutateAsync(parsed.data.text);
    } catch {
      setInput(parsed.data.text);
      setError("Couldn't send that message. Try again.");
    }
  }

  return (
    <Panel>
      <h2>Class chat</h2>
      <ChatScroll ref={scrollRef}>
        {isLoading && <ChatSkeleton />}
        {messages?.length === 0 && <EmptyState>No messages yet, say hello!</EmptyState>}
        {messages?.map((m) => (
          <ChatBubble
            key={m.id}
            mine={m.sender_id === me.id}
            name={m.sender_name}
            text={m.text}
            time={m.created_at}
            reactions={reactionsByMessage[m.id]}
            onToggleReaction={(emoji) => handleToggleReaction(m.id, emoji)}
          />
        ))}
      </ChatScroll>
      <ErrorBanner className="mt-2.5">{error}</ErrorBanner>
      <ChatInputForm
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onEmojiSelect={(emoji) => setInput((prev) => prev + emoji)}
        onSubmit={handleSubmit}
        placeholder="Write a message…"
      />
    </Panel>
  );
}
