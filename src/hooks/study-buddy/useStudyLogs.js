"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

async function fetchStudyLogs() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("study_buddy_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export function useStudyLogs() {
  return useQuery({ queryKey: queryKeys.studyLogs(), queryFn: fetchStudyLogs });
}
