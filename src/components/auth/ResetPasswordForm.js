"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useUpdatePassword } from "@/hooks/auth/useUpdatePassword";
import { resetPasswordSchema } from "@/schemas/auth";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const updatePassword = useUpdatePassword();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check your details.");
      return;
    }
    setError("");
    try {
      await updatePassword.mutateAsync(parsed.data.password);
      setDone(true);
      setTimeout(() => router.replace("/"), 1500);
    } catch (err) {
      setError(err.message || "Couldn't update your password. Try again.");
    }
  }

  if (done) {
    return <p className="text-[0.98rem] text-muted">Password updated. Taking you back to the app…</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label="New password (at least 8 characters)">
        <PasswordInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Field label="Confirm new password">
        <PasswordInput
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Field>
      <ErrorBanner>{error}</ErrorBanner>
      <Button type="submit" disabled={updatePassword.isPending}>
        Update password
      </Button>
    </form>
  );
}
