"use client";

import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Returns one of three outcomes so the form can show the right message:
 * - { status: "needs-confirmation" }: no session yet, email confirmation required
 * - { status: "signed-in" }: session created immediately (confirmation off)
 * - { status: "signed-in", claimedTeacher: true }: also claimed the teacher role
 */
export function useSignup() {
  return useMutation({
    mutationFn: async ({ name, email, password, isTeacher, code }) => {
      const supabase = getSupabaseBrowserClient();
      // The profile row is created automatically by a database trigger the
      // instant the account exists (see schema.sql), this works even before
      // email confirmation, when the browser has no permission yet to write
      // anything as this new user. We just pass the name along so the
      // trigger can use it.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Something went wrong creating your account. Please try again.");

      if (!data.session) {
        return { status: "needs-confirmation", isTeacher };
      }

      if (isTeacher) {
        const res = await fetch("/api/claim-teacher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || "Couldn't verify the teacher code.");
        return { status: "signed-in", claimedTeacher: true };
      }

      return { status: "signed-in", claimedTeacher: false };
    },
  });
}
