"use client";

import { useEffect, useState } from "react";
import { AssignmentCard, AssignmentMeta } from "@/components/assignments/AssignmentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Badge } from "@/components/ui/Badge";
import { TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSubmission } from "@/hooks/assignments/useSubmission";
import { useSubmitAssignment } from "@/hooks/assignments/useSubmitAssignment";
import { submissionSchema } from "@/schemas/assignments";

export function StudentAssignmentCard({ assignment, me }) {
  const { data: submission, isLoading } = useSubmission(assignment.id, me.id);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const submitAssignment = useSubmitAssignment({ assignmentId: assignment.id, me, existingSubmission: submission });

  useEffect(() => {
    setContent(submission?.content || "");
  }, [submission?.id, submission?.content]);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = submissionSchema.safeParse({ content });
    if (!parsed.success) return;
    setError("");
    try {
      await submitAssignment.mutateAsync(parsed.data.content);
    } catch {
      setError("Couldn't submit that. Try again.");
    }
  }

  return (
    <AssignmentCard>
      <AssignmentMeta assignment={assignment} />
      {isLoading && <EmptyState>Loading…</EmptyState>}
      {submission && submission.grade ? (
        <div className="mt-2.5 rounded-lg bg-cream p-3.5">
          <Badge tone="good" className="mb-1.5">
            Grade: {submission.grade}
          </Badge>
          <div>
            <strong>Your submission:</strong> {submission.content}
          </div>
          {submission.feedback && (
            <div className="mt-1.5">
              <strong>Feedback:</strong> {submission.feedback}
            </div>
          )}
        </div>
      ) : submission ? (
        <div className="mt-2.5 rounded-lg bg-cream p-3.5">
          <Badge tone="muted" className="mb-1.5">
            Submitted, awaiting grade
          </Badge>
          <div>
            <strong>Your submission:</strong> {submission.content}
          </div>
          <ErrorBanner className="mt-1.5">{error}</ErrorBanner>
          <form className="mt-2 flex flex-wrap gap-2" onSubmit={handleSubmit}>
            <TextArea className="min-w-[180px] flex-1" value={content} onChange={(e) => setContent(e.target.value)} />
            <Button type="submit" className="w-auto rounded-md px-4 py-2">
              Update
            </Button>
          </form>
        </div>
      ) : !isLoading ? (
        <>
          <ErrorBanner>{error}</ErrorBanner>
          <form className="mt-2 flex flex-wrap gap-2" onSubmit={handleSubmit}>
            <TextArea
              className="min-w-[180px] flex-1"
              placeholder="Write or paste your answer here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <Button type="submit" className="w-auto rounded-md px-4 py-2">
              Submit
            </Button>
          </form>
        </>
      ) : null}
    </AssignmentCard>
  );
}
