"use client";

import { ChevronRight } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import { useStudents } from "@/hooks/messages/useStudents";

export function StudentList({ onOpen }) {
  const { data: students, isLoading } = useStudents();

  return (
    <Panel>
      <h2>Messages</h2>
      <div className="flex flex-col gap-1.5">
        {isLoading && <ListRowSkeleton />}
        {students?.length === 0 && <EmptyState>No students have joined yet.</EmptyState>}
        {students?.map((s) => (
          <button
            key={s.id}
            onClick={() => onOpen(s)}
            className="flex animate-fade-in items-center gap-3 rounded-xl border border-line bg-paper px-3.5 py-3 text-left transition-all hover:-translate-y-px hover:border-gold/60 hover:shadow-sm"
          >
            <Avatar name={s.name} size="sm" />
            <span className="flex-1 font-semibold text-ink">{s.name}</span>
            <ChevronRight size={18} strokeWidth={2} className="text-muted" />
          </button>
        ))}
      </div>
    </Panel>
  );
}
