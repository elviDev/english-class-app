"use client";

import { useMutation } from "@tanstack/react-query";

export function useSendStudyBuddyMessage() {
  return useMutation({
    mutationFn: async ({ message, history }) => {
      const res = await fetch("/api/study-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      return data.reply;
    },
  });
}
