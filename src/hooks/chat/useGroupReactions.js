"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { rowSetReducer, useRealtimeSync } from "@/hooks/useRealtimeSync";

async function fetchGroupReactions() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("group_message_reactions").select("*");
  if (error) throw error;
  return data ?? [];
}

export function useGroupReactions() {
  const queryKey = queryKeys.groupReactions();
  const query = useQuery({ queryKey, queryFn: fetchGroupReactions });

  useRealtimeSync({
    channelName: "group-reactions",
    table: "group_message_reactions",
    event: "*",
    queryKey,
    reducer: rowSetReducer,
  });

  return query;
}
