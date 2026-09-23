"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { NewAssignmentForm } from "@/components/assignments/NewAssignmentForm";
import { TeacherAssignmentCard } from "@/components/assignments/TeacherAssignmentCard";
import { StudentAssignmentCard } from "@/components/assignments/StudentAssignmentCard";
import { useAssignments } from "@/hooks/assignments/useAssignments";

export function AssignmentsTab({ me }) {
  const { data: assignments, isLoading } = useAssignments();

  return (
    <div>
      {me.role === "teacher" && <NewAssignmentForm meId={me.id} />}
      {isLoading && <CardSkeleton />}
      {assignments?.length === 0 && <EmptyState>No assignments posted yet.</EmptyState>}
      {assignments?.map((a) =>
        me.role === "teacher" ? (
          <TeacherAssignmentCard key={a.id} assignment={a} />
        ) : (
          <StudentAssignmentCard key={a.id} assignment={a} me={me} />
        )
      )}
    </div>
  );
}
