"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useSignup } from "@/hooks/auth/useSignup";
import { signupSchema } from "@/schemas/auth";

export function SignupForm({ onError, onNeedsConfirmation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [code, setCode] = useState("");
  const signup = useSignup();

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ name, email, password, isTeacher, code });
    if (!parsed.success) {
      onError(parsed.error.issues[0]?.message || "Check your details.");
      return;
    }
    onError("");
    try {
      const result = await signup.mutateAsync(parsed.data);
      if (result.status === "needs-confirmation") {
        onNeedsConfirmation(result.isTeacher);
        return;
      }
      if (result.claimedTeacher) {
        // Full reload guarantees the newly-claimed "teacher" role is picked
        // up everywhere (session, profile cache) in one consistent pass.
        window.location.reload();
        return;
      }
      // Non-teacher sign-up with an immediate session: the auth listener in
      // SessionProvider already picked up the new session, so AuthScreen
      // unmounts on its own once the store updates.
    } catch (err) {
      onError(err.message || "Something went wrong creating your account. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Your name">
        <Input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Email">
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password (at least 8 characters)">
        <PasswordInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <label className="mb-4 flex items-center gap-2 text-sm font-semibold text-navy">
        <input type="checkbox" checked={isTeacher} onChange={(e) => setIsTeacher(e.target.checked)} />
        I&apos;m the teacher
      </label>
      {isTeacher && (
        <Field label="Teacher setup code">
          <PasswordInput autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
        </Field>
      )}
      <Button type="submit" disabled={signup.isPending}>
        Create account
      </Button>
    </form>
  );
}
