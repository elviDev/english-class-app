"use client";

import { useState } from "react";
import { formatTime } from "@/lib/utils";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { gradeSchema } from "@/schemas/assignments";

export function SubmissionRow({ submission, onSave }) {
  const [grade, setGrade] = useState(submission.grade || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = gradeSchema.safeParse({ grade, feedback });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Enter a grade");
      return;
    }
    setError("");
    try {
      await onSave(parsed.data.grade, parsed.data.feedback);
    } catch {
      setError("Couldn't save that grade. Try again.");
    }
  }

  return (
    <div className="border-b border-dashed border-line py-2.5 last:border-b-0">
      <strong>{submission.student_name}</strong> <small className="text-muted">· {formatTime(submission.submitted_at)}</small>
      <div className="my-1.5">{submission.content}</div>
      <ErrorBanner className="mb-1.5">{error}</ErrorBanner>
      <form className="mt-2 flex flex-wrap gap-2" onSubmit={handleSubmit}>
        <Input className="w-[90px] flex-none" placeholder="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} />
        <TextArea
          className="min-w-[180px] flex-1"
          placeholder="Feedback (optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <Button type="submit" className="w-auto rounded-md px-4 py-2">
          Save grade
        </Button>
      </form>
    </div>
  );
}
