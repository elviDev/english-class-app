"use client";

import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** No manual cache update needed: the teacher's own realtime UPDATE event
 * (see useAssignmentSubmissions) flows back and upserts the graded row. */
export function useGradeSubmission() {
  return useMutation({
    mutationFn: async ({ submissionId, grade, feedback }) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("submissions")
        .update({ grade, feedback, graded_at: new Date().toISOString() })
        .eq("id", submissionId);
      if (error) throw error;
    },
  });
}
