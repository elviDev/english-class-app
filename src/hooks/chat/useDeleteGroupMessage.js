"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

/** Soft delete: sets deleted_at rather than removing the row, so a
 * placeholder is left behind for everyone instead of the message just
 * vanishing without explanation. */
export function useDeleteGroupMessage() {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.groupMessages();

  return useMutation({
    mutationFn: async (messageId) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("group_messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", messageId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => {
      queryClient.setQueryData(queryKey, (prev) => (prev ?? []).map((m) => (m.id === row.id ? row : m)));
    },
  });
}
