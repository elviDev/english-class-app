"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { rowSetReducer, useRealtimeSync } from "@/hooks/useRealtimeSync";

async function fetchGroupMessages() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("group_messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export function useGroupMessages() {
  const queryKey = queryKeys.groupMessages();
  const query = useQuery({ queryKey, queryFn: fetchGroupMessages });

  useRealtimeSync({
    channelName: "group-chat",
    table: "group_messages",
    event: "*",
    queryKey,
    reducer: rowSetReducer,
  });

  return query;
}
