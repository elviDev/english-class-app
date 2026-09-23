"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { rowSetReducer, useRealtimeSync } from "@/hooks/useRealtimeSync";

async function fetchDirectReactions() {
  const supabase = getSupabaseBrowserClient();
  // No message_id filter: Row Level Security already scopes this to
  // reactions on threads the caller is allowed to see (their own thread
  // for a student, every thread for the teacher), same as direct_messages.
  const { data, error } = await supabase.from("direct_message_reactions").select("*");
  if (error) throw error;
  return data ?? [];
}

export function useDirectReactions() {
  const queryKey = queryKeys.directReactions();
  const query = useQuery({ queryKey, queryFn: fetchDirectReactions });

  useRealtimeSync({
    channelName: "direct-reactions",
    table: "direct_message_reactions",
    event: "*",
    queryKey,
    reducer: rowSetReducer,
  });

  return query;
}
