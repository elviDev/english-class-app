"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

async function fetchAssignments() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("*, assignment_files(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function useAssignments() {
  return useQuery({ queryKey: queryKeys.assignments(), queryFn: fetchAssignments });
}
