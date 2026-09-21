"use client";

import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** The realtime INSERT subscription (see useGroupMessages) echoes the new
 * row back for every listener, including the sender, so no optimistic
 * update is needed here. */
export function useSendGroupMessage(me) {
  return useMutation({
    mutationFn: async (text) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("group_messages").insert({
        sender_id: me.id,
        sender_name: me.name,
        text,
      });
      if (error) throw error;
    },
  });
}
