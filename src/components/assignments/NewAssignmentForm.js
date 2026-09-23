"use client";

import { useRef, useState } from "react";
import { Paperclip, PenSquare, X } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Field } from "@/components/ui/Field";
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useCreateAssignment } from "@/hooks/assignments/useCreateAssignment";
import { newAssignmentSchema } from "@/schemas/assignments";
import { assignmentFiles } from "@/lib/config";
import { formatFileSize } from "@/lib/utils";

export function NewAssignmentForm({ meId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const createAssignment = useCreateAssignment(meId);

  function handleFilesChosen(e) {
    const chosen = Array.from(e.target.files || []);
    e.target.value = "";
    const tooBig = chosen.filter((f) => f.size > assignmentFiles.maxSizeBytes);
    if (tooBig.length > 0) {
      setError(`${tooBig.map((f) => f.name).join(", ")} is larger than 15 MB and won't be attached.`);
    }
    setFiles((prev) => [...prev, ...chosen.filter((f) => f.size <= assignmentFiles.maxSizeBytes)]);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = newAssignmentSchema.safeParse({ title, description, dueDate });
    if (!parsed.success) return;
    setError("");
    try {
      await createAssignment.mutateAsync({ ...parsed.data, files });
      setTitle("");
      setDescription("");
      setDueDate("");
      setFiles([]);
    } catch (err) {
      setError(err.message || "Couldn't post that assignment. Try again.");
    }
  }

  return (
    <Panel>
      <h2 className="flex items-center gap-2">
        <PenSquare size={18} strokeWidth={2} />
        Post a new assignment
      </h2>
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

        <Field label="Files (optional)">
          <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilesChosen} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-dashed border-line px-3.5 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-hover"
          >
            <Paperclip size={16} strokeWidth={2} />
            Attach files
          </button>
          {files.length > 0 && (
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-cream px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="shrink-0 text-xs text-muted">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${file.name}`}
                    className="shrink-0 text-muted transition-colors hover:text-danger"
                  >
                    <X size={15} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>

        <ErrorBanner>{error}</ErrorBanner>
        <Button type="submit" disabled={createAssignment.isPending} className="w-auto px-5 py-2.5">
          Post assignment
        </Button>
      </form>
    </Panel>
  );
}
