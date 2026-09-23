"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

/**
 * Appends the confirmed row to the cache as soon as the insert succeeds,
 * rather than waiting on the realtime INSERT echo to show the sender their
 * own message. Realtime still delivers it (deduped by id, see
 * rowSetReducer) for every other listener, and remains how everyone else's
 * messages arrive live.
 */
export function useSendGroupMessage(me) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.groupMessages();

  return useMutation({
    mutationFn: async (text) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("group_messages")
        .insert({ sender_id: me.id, sender_name: me.name, text })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => {
      queryClient.setQueryData(queryKey, (prev) => {
        const list = prev ?? [];
        if (list.some((m) => m.id === row.id)) return list;
        return [...list, row];
      });
    },
  });
}
