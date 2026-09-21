"use client";

import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** Requires an active (recovery) session, set by app/auth/confirm/route.js. */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (password) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
  });
}
