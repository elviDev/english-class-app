"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Field } from "@/components/ui/Field";
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useCreateAssignment } from "@/hooks/assignments/useCreateAssignment";
import { newAssignmentSchema } from "@/schemas/assignments";

export function NewAssignmentForm({ meId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const createAssignment = useCreateAssignment(meId);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = newAssignmentSchema.safeParse({ title, description, dueDate });
    if (!parsed.success) return;
    setError("");
    try {
      await createAssignment.mutateAsync(parsed.data);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch {
      setError("Couldn't post that assignment. Try again.");
    }
  }

  return (
    <Panel>
      <h2>Post a new assignment</h2>
      <form onSubmit={handleSubmit}>
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Instructions">
          <TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </Field>
        <Field label="Due date (optional)">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <ErrorBanner>{error}</ErrorBanner>
        <Button type="submit" disabled={createAssignment.isPending} className="w-auto px-5 py-2.5">
          Post assignment
        </Button>
      </form>
    </Panel>
  );
}
