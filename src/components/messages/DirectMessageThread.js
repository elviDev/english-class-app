"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChatSkeleton } from "@/components/ui/Skeleton";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LinkButton } from "@/components/ui/LinkButton";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatScroll } from "@/components/chat/ChatScroll";
import { ChatInputForm } from "@/components/chat/ChatInputForm";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useDirectMessages } from "@/hooks/messages/useDirectMessages";
import { useSendDirectMessage } from "@/hooks/messages/useSendDirectMessage";
import { chatMessageSchema } from "@/schemas/chat";

export function DirectMessageThread({ me, studentId, label, onBack }) {
  const { data: messages, isLoading } = useDirectMessages(studentId);
  const sendMessage = useSendDirectMessage(me);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useAutoScroll([messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = chatMessageSchema.safeParse({ text: input });
    if (!parsed.success) return;
    setInput("");
    setError("");
    try {
      await sendMessage.mutateAsync({ studentId, text: parsed.data.text });
    } catch {
      setInput(parsed.data.text);
      setError("Couldn't send that message. Try again.");
    }
  }

  return (
    <Panel>
      {onBack && (
        <LinkButton className="mb-3.5 flex items-center gap-1 no-underline" onClick={onBack}>
          <ChevronLeft size={16} strokeWidth={2.5} />
          All students
        </LinkButton>
      )}
      <h2>{label}</h2>
      <ChatScroll ref={scrollRef}>
        {isLoading && <ChatSkeleton />}
        {messages?.length === 0 && <EmptyState>No messages yet.</EmptyState>}
        {messages?.map((m) => (
          <ChatBubble key={m.id} mine={m.sender_id === me.id} name={m.sender_name} text={m.text} time={m.created_at} />
        ))}
      </ChatScroll>
      <ErrorBanner className="mt-2.5">{error}</ErrorBanner>
      <ChatInputForm
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
        placeholder="Write a private message…"
      />
    </Panel>
  );
}
