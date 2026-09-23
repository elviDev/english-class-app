"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

export function useDeleteGroupMessage() {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.groupMessages();

  return useMutation({
    mutationFn: async (messageId) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("group_messages").delete().eq("id", messageId);
      if (error) throw error;
      return messageId;
    },
    onSuccess: (messageId) => {
      queryClient.setQueryData(queryKey, (prev) => (prev ?? []).filter((m) => m.id !== messageId));
    },
  });
}
