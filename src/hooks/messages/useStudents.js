"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

async function fetchStudents() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("profiles").select("id,name").eq("role", "student").order("name");
  if (error) throw error;
  return data ?? [];
}

export function useStudents() {
  return useQuery({ queryKey: queryKeys.students(), queryFn: fetchStudents });
}
