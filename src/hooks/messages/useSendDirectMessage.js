"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

/** See useSendGroupMessage: appends the confirmed row directly rather than
 * relying solely on the realtime echo for the sender's own message. */
export function useSendDirectMessage(me) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, text }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("direct_messages")
        .insert({ student_id: studentId, sender_id: me.id, sender_name: me.name, text })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => {
      const queryKey = queryKeys.directMessages(row.student_id);
      queryClient.setQueryData(queryKey, (prev) => {
        const list = prev ?? [];
        if (list.some((m) => m.id === row.id)) return list;
        return [...list, row];
      });
    },
  });
}
