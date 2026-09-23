"use client";

import { ChevronRight } from "lucide-react";
import { AssignmentCard, AssignmentMeta } from "@/components/assignments/AssignmentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SubmissionRow } from "@/components/assignments/SubmissionRow";
import { useAssignmentSubmissions } from "@/hooks/assignments/useAssignmentSubmissions";
import { useGradeSubmission } from "@/hooks/assignments/useGradeSubmission";

export function TeacherAssignmentCard({ assignment }) {
  const { data: submissions } = useAssignmentSubmissions(assignment.id);
  const gradeSubmission = useGradeSubmission();
  const count = submissions?.length ?? 0;

  return (
    <AssignmentCard>
      <AssignmentMeta assignment={assignment} />
      <details className="group mt-2.5 border-t border-line pt-2.5">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 font-bold text-heading [&::-webkit-details-marker]:hidden">
          <ChevronRight size={16} strokeWidth={2.5} className="transition-transform group-open:rotate-90" />
          {count} submission{count === 1 ? "" : "s"}
        </summary>
        {count === 0 && <EmptyState className="py-2.5">No submissions yet.</EmptyState>}
        {submissions?.map((s) => (
          <SubmissionRow
            key={s.id}
            submission={s}
            onSave={(grade, feedback) => gradeSubmission.mutateAsync({ submissionId: s.id, grade, feedback })}
          />
        ))}
      </details>
    </AssignmentCard>
  );
}
