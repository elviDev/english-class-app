"use client";

import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useSendDirectMessage(me) {
  return useMutation({
    mutationFn: async ({ studentId, text }) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("direct_messages").insert({
        student_id: studentId,
        sender_id: me.id,
        sender_name: me.name,
        text,
      });
      if (error) throw error;
    },
  });
}
