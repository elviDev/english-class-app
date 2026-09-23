"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Subscribes to a Supabase Realtime channel and folds each payload into
 * the matching React Query cache entry via `reducer`, instead of
 * refetching. This is what keeps chat, messages, and grades live without
 * polling.
 */
export function useRealtimeSync({ enabled = true, channelName, table, event = "*", filter, queryKey, reducer }) {
  const queryClient = useQueryClient();
  const filterKey = JSON.stringify(queryKey);

  useEffect(() => {
    if (!enabled) return undefined;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return undefined;

    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event, schema: "public", table, filter }, (payload) => {
        queryClient.setQueryData(queryKey, (prev) => reducer(prev, payload));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, channelName, table, event, filter, filterKey]);
}

export const appendRowReducer = (list = [], payload) => [...list, payload.new];

export const upsertRowReducer = (list = [], payload) => {
  if (payload.eventType === "DELETE") return list;
  const index = list.findIndex((row) => row.id === payload.new.id);
  if (index === -1) return [...list, payload.new];
  const next = [...list];
  next[index] = payload.new;
  return next;
};

/** For a query cache that holds a single row (e.g. "my submission"). */
export const replaceSingleRowReducer = (matchesPayload) => (current, payload) => {
  if (payload.eventType === "DELETE" || !matchesPayload(payload)) return current;
  return payload.new;
};

/** A flat list where rows can be inserted, updated, or removed by id, e.g.
 * message reactions (added and removed freely, not just appended to). */
export const rowSetReducer = (list = [], payload) => {
  if (payload.eventType === "INSERT") return [...list, payload.new];
  if (payload.eventType === "DELETE") return list.filter((row) => row.id !== payload.old.id);
  if (payload.eventType === "UPDATE") return list.map((row) => (row.id === payload.new.id ? payload.new : row));
  return list;
};
