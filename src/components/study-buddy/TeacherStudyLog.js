"use client";

import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatTime } from "@/lib/utils";
import { useStudyLogs } from "@/hooks/study-buddy/useStudyLogs";

export function TeacherStudyLog() {
  const { data: logs, isLoading } = useStudyLogs();

  return (
    <Panel>
      <h2>Study Buddy activity</h2>
      <p className="mb-4 rounded-[10px] border border-ai-line bg-ai-bg px-4 py-3.5 text-[0.95rem]">
        What students have been asking their AI study buddy, useful for spotting what to cover in class. Read-only.
      </p>
      {isLoading && <EmptyState>Loading…</EmptyState>}
      {logs?.length === 0 && <EmptyState>No questions asked yet.</EmptyState>}
      {logs?.map((l) => (
        <div key={l.id} className="border-b border-dashed border-line py-2.5 last:border-b-0">
          <div className="font-bold text-navy">
            {l.student_name}: {l.question}
          </div>
          <div className="mt-0.5 whitespace-pre-wrap text-sm text-muted">{l.answer}</div>
          <small className="text-muted">{formatTime(l.created_at)}</small>
        </div>
      ))}
    </Panel>
  );
}
