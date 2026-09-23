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
  // No retries: if the table doesn't exist yet (the reactions migration
  // hasn't been run), fail once and stay quiet rather than hammering the
  // endpoint.
  const query = useQuery({ queryKey, queryFn: fetchGroupReactions, retry: false });

  useRealtimeSync({
    // Only open the realtime subscription once a plain fetch has proven the
    // table is actually reachable. Subscribing to postgres_changes on a
    // table that doesn't exist yet leaves Realtime retrying that channel
    // forever on the same shared socket, which was degrading every other
    // channel (chat stopped updating live) even though reactions and chat
    // are otherwise unrelated.
    enabled: query.isSuccess,
    channelName: "group-reactions",
    table: "group_message_reactions",
    event: "*",
    queryKey,
    reducer: rowSetReducer,
  });

  return query;
}
