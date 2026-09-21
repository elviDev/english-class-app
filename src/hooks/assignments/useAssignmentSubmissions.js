"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { upsertRowReducer, useRealtimeSync } from "@/hooks/useRealtimeSync";

async function fetchSubmissions(assignmentId) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("submitted_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** All submissions for one assignment (teacher view), realtime for new/edited/graded rows. */
export function useAssignmentSubmissions(assignmentId, { enabled = true } = {}) {
  const queryKey = queryKeys.submissions(assignmentId);
  const query = useQuery({
    queryKey,
    queryFn: () => fetchSubmissions(assignmentId),
    enabled: enabled && Boolean(assignmentId),
  });

  useRealtimeSync({
    enabled: enabled && Boolean(assignmentId),
    channelName: `submissions-${assignmentId}`,
    table: "submissions",
    event: "*",
    filter: `assignment_id=eq.${assignmentId}`,
    queryKey,
    reducer: upsertRowReducer,
  });

  return query;
}
