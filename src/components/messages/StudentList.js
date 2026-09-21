"use client";

import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStudents } from "@/hooks/messages/useStudents";

export function StudentList({ onOpen }) {
  const { data: students, isLoading } = useStudents();

  return (
    <Panel>
      <h2>Messages</h2>
      <div className="flex flex-col gap-1.5">
        {isLoading && <EmptyState>Loading…</EmptyState>}
        {students?.length === 0 && <EmptyState>No students have joined yet.</EmptyState>}
        {students?.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-[10px] border border-line bg-white px-3.5 py-3"
          >
            <span>{s.name}</span>
            <button
              onClick={() => onOpen(s)}
              className="rounded-md bg-navy px-3.5 py-[7px] font-bold text-white transition-colors hover:bg-navy-dark"
            >
              Open chat
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
