"use client";

import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Supabase deliberately does not error for an unregistered email here
 * (it would leak which addresses have accounts), so the caller should
 * show a generic "check your email" message regardless of the outcome.
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
  });
}
