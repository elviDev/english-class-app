"use client";

import { useState } from "react";
import { UserCog } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useClaimTeacher } from "@/hooks/auth/useClaimTeacher";
import { claimTeacherSchema } from "@/schemas/auth";

export function ClaimTeacherBar({ onClose }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const claimTeacher = useClaimTeacher();

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = claimTeacherSchema.safeParse({ code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Enter the teacher setup code");
      return;
    }
    setError("");
    try {
      await claimTeacher.mutateAsync(parsed.data);
      onClose();
    } catch (err) {
      setError(err.message || "Couldn't verify that code.");
    }
  }

  return (
    <Panel className="animate-slide-down">
      <form className="flex flex-wrap items-center gap-2.5" onSubmit={handleSubmit}>
        <strong className="flex items-center gap-1.5 text-heading">
          <UserCog size={16} strokeWidth={2} />
          Teacher setup code:
        </strong>
        <PasswordInput
          autoFocus
          autoComplete="off"
          className="min-w-[200px] flex-1"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button type="submit" disabled={claimTeacher.isPending} className="w-auto px-5 py-2">
          Confirm
        </Button>
        <LinkButton onClick={onClose}>Cancel</LinkButton>
      </form>
      <ErrorBanner className="mt-2.5">{error}</ErrorBanner>
    </Panel>
  );
}
