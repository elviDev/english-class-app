"use client";

import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** No manual cache update: the realtime INSERT/DELETE echo (see
 * useGroupReactions) updates the cache for us, same pattern as messages. */
export function useToggleGroupReaction(me) {
  return useMutation({
    mutationFn: async ({ messageId, emoji, reactionId }) => {
      const supabase = getSupabaseBrowserClient();
      if (reactionId) {
        const { error } = await supabase.from("group_message_reactions").delete().eq("id", reactionId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("group_message_reactions")
          .insert({ message_id: messageId, user_id: me.id, emoji });
        if (error) throw error;
      }
    },
  });
}
