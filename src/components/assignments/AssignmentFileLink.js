"use client";

import { useState } from "react";
import { Loader2, Paperclip } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { assignmentFiles } from "@/lib/config";
import { formatFileSize } from "@/lib/utils";

/** Files live in a private bucket; a signed URL is only generated the
 * moment someone clicks, and expires shortly after, rather than exposing
 * a permanent public link to every attachment. */
export function AssignmentFileLink({ file }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setBusy(true);
    setError(false);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: signError } = await supabase.storage
        .from(assignmentFiles.bucket)
        .createSignedUrl(file.file_path, assignmentFiles.signedUrlTtlSeconds);
      if (signError || !data?.signedUrl) throw signError || new Error("No URL returned");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="flex items-center gap-1.5 rounded-lg border border-line bg-cream px-2.5 py-1.5 text-xs font-semibold text-heading transition-colors hover:bg-hover disabled:opacity-60"
    >
      {busy ? <Loader2 size={13} strokeWidth={2} className="animate-spin" /> : <Paperclip size={13} strokeWidth={2} />}
      <span className="max-w-[160px] truncate">{file.file_name}</span>
      {file.file_size ? <span className="text-muted">{formatFileSize(file.file_size)}</span> : null}
      {error && <span className="text-danger">Failed</span>}
    </button>
  );
}
