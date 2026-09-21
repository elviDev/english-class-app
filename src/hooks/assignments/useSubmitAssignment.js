"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

export function useSubmitAssignment({ assignmentId, me, existingSubmission }) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.submission(assignmentId, me.id);

  return useMutation({
    mutationFn: async (content) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = existingSubmission
        ? await supabase
            .from("submissions")
            .update({ content, submitted_at: new Date().toISOString() })
            .eq("id", existingSubmission.id)
        : await supabase.from("submissions").insert({
            assignment_id: assignmentId,
            student_id: me.id,
            student_name: me.name,
            content,
          });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}
