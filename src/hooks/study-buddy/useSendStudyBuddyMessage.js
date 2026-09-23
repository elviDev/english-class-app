"use client";

import { useState } from "react";

/**
 * Reads the streamed reply from /api/study-buddy as it arrives, calling
 * onDelta(fullTextSoFar) on every chunk, instead of waiting for the whole
 * answer before showing anything.
 */
export function useSendStudyBuddyMessage() {
  const [isPending, setIsPending] = useState(false);

  async function sendMessage({ message, history, onDelta }) {
    setIsPending(true);
    try {
      const res = await fetch("/api/study-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        onDelta(full);
      }
      return full;
    } finally {
      setIsPending(false);
    }
  }

  return { sendMessage, isPending };
}
