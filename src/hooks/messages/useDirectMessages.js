"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { rowSetReducer, useRealtimeSync } from "@/hooks/useRealtimeSync";

async function fetchDirectMessages(studentId) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("direct_messages")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export function useDirectMessages(studentId) {
  const queryKey = queryKeys.directMessages(studentId);
  const query = useQuery({
    queryKey,
    queryFn: () => fetchDirectMessages(studentId),
    enabled: Boolean(studentId),
  });

  useRealtimeSync({
    enabled: Boolean(studentId),
    channelName: `dm-${studentId}`,
    table: "direct_messages",
    event: "*",
    filter: `student_id=eq.${studentId}`,
    queryKey,
    reducer: rowSetReducer,
  });

  return query;
}
