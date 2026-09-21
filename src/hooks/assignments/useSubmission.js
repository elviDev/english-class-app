"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { replaceSingleRowReducer, useRealtimeSync } from "@/hooks/useRealtimeSync";

async function fetchSubmission(assignmentId, studentId) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

/**
 * A student's own submission for one assignment. Realtime-subscribed so a
 * grade the teacher posts while this card is open appears immediately.
 */
export function useSubmission(assignmentId, studentId) {
  const queryKey = queryKeys.submission(assignmentId, studentId);
  const query = useQuery({
    queryKey,
    queryFn: () => fetchSubmission(assignmentId, studentId),
    enabled: Boolean(assignmentId && studentId),
  });

  useRealtimeSync({
    enabled: Boolean(assignmentId && studentId),
    channelName: `submission-${assignmentId}-${studentId}`,
    table: "submissions",
    event: "*",
    filter: `assignment_id=eq.${assignmentId}`,
    queryKey,
    reducer: replaceSingleRowReducer((payload) => payload.new.student_id === studentId),
  });

  return query;
}
