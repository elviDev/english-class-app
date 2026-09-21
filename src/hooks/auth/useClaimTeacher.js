"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/stores/session-store";
import { queryKeys } from "@/lib/query-keys";

export function useClaimTeacher() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.session?.user?.id);

  return useMutation({
    mutationFn: async ({ code }) => {
      const res = await fetch("/api/claim-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Couldn't verify that code.");
      return result;
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
    },
  });
}
