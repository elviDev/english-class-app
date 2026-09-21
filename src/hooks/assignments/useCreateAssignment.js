"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

export function useCreateAssignment(meId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, description, dueDate }) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("assignments").insert({
        title,
        description,
        due_date: dueDate || null,
        created_by: meId,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.assignments() }),
  });
}
