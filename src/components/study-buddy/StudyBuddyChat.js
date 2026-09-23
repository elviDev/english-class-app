"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatScroll } from "@/components/chat/ChatScroll";
import { ChatInputForm } from "@/components/chat/ChatInputForm";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useSendStudyBuddyMessage } from "@/hooks/study-buddy/useSendStudyBuddyMessage";
import { studyBuddyMessageSchema } from "@/schemas/study-buddy";

export function StudyBuddyChat({ me }) {
  const [turns, setTurns] = useState([]); // { role: "user" | "ai", text }
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const { sendMessage, isPending } = useSendStudyBuddyMessage();
  const scrollRef = useAutoScroll([turns, isPending]);
  // Only show "thinking" before the reply starts streaming in; once the AI
  // bubble is appended (see onDelta below) it takes over as the live text.
  const showThinking = isPending && turns[turns.length - 1]?.role !== "ai";

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = studyBuddyMessageSchema.safeParse({ message: input });
    if (!parsed.success || isPending) return;
    setError("");
    setInput("");
    const history = turns;
    setTurns((prev) => [...prev, { role: "user", text: parsed.data.message }]);

    let appended = false;
    try {
      await sendMessage({
        message: parsed.data.message,
        history,
        onDelta: (fullTextSoFar) => {
          setTurns((prev) => {
            if (!appended) {
              appended = true;
              return [...prev, { role: "ai", text: fullTextSoFar }];
            }
            const next = [...prev];
            next[next.length - 1] = { role: "ai", text: fullTextSoFar };
            return next;
          });
        },
      });
    } catch (err) {
      setError(err.message || "Couldn't reach Study Buddy. Check your connection and try again.");
    }
  }

  return (
    <Panel>
      <h2 className="flex items-center gap-2">
        <Sparkles size={18} strokeWidth={2} />
        Study Buddy
      </h2>
      <p className="mb-4 rounded-xl border border-ai-line bg-ai-bg px-4 py-3.5 text-[0.95rem]">
        Ask about grammar, vocabulary, or practice a short conversation in English, in English, in Spanish, or a mix
        of both. Study Buddy understands Spanish and will help you find the English words. It&apos;s an AI, so it
        can make mistakes, bring good questions back to class too.
      </p>
      <ChatScroll ref={scrollRef}>
        {turns.length === 0 && <EmptyState>Try: &quot;¿Cómo se dice &apos;llevo dos años estudiando inglés&apos;?&quot;</EmptyState>}
        {turns.map((t, i) => (
          <ChatBubble
            key={i}
            mine={t.role === "user"}
            name={t.role === "user" ? me.name : "Study Buddy"}
            text={t.text}
            variant={t.role === "ai" ? "ai" : undefined}
          />
        ))}
        {showThinking && <TypingIndicator name="Study Buddy" variant="ai" />}
      </ChatScroll>
      <ErrorBanner className="mt-2.5">{error}</ErrorBanner>
      <ChatInputForm
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
        placeholder="Ask in English or Spanish…"
        disabled={isPending}
      />
    </Panel>
  );
}
