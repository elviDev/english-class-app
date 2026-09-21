"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRequestPasswordReset } from "@/hooks/auth/useRequestPasswordReset";
import { forgotPasswordSchema } from "@/schemas/auth";

export function ForgotPasswordForm({ onError, onSent }) {
  const [email, setEmail] = useState("");
  const requestReset = useRequestPasswordReset();

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      onError(parsed.error.issues[0]?.message || "Enter a valid email address");
      return;
    }
    onError("");
    try {
      await requestReset.mutateAsync(parsed.data.email);
      onSent(parsed.data.email);
    } catch (err) {
      onError(err.message || "Couldn't send that email. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Email">
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Button type="submit" disabled={requestReset.isPending}>
        Send reset link
      </Button>
    </form>
  );
}
