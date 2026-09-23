"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { assignmentFiles } from "@/lib/config";

export function useCreateAssignment(meId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, description, dueDate, files = [] }) => {
      const supabase = getSupabaseBrowserClient();
      const { data: assignment, error: insertError } = await supabase
        .from("assignments")
        .insert({ title, description, due_date: dueDate || null, created_by: meId })
        .select()
        .single();
      if (insertError) throw insertError;

      // The assignment itself is already posted at this point; a failed
      // attachment shouldn't undo that, so failures here are collected and
      // reported afterwards rather than thrown immediately.
      const failed = [];
      for (const file of files) {
        const path = `${assignment.id}/${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from(assignmentFiles.bucket).upload(path, file);
        if (uploadError) {
          failed.push(file.name);
          continue;
        }
        const { error: rowError } = await supabase.from("assignment_files").insert({
          assignment_id: assignment.id,
          file_path: path,
          file_name: file.name,
          file_size: file.size,
        });
        if (rowError) failed.push(file.name);
      }

      if (failed.length > 0) {
        throw new Error(`Assignment posted, but couldn't attach: ${failed.join(", ")}.`);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.assignments() }),
  });
}
