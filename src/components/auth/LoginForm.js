"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/hooks/auth/useLogin";
import { loginSchema } from "@/schemas/auth";

export function LoginForm({ onError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      onError(parsed.error.issues[0]?.message || "Check your details.");
      return;
    }
    onError("");
    try {
      await login.mutateAsync(parsed.data);
    } catch (err) {
      onError(err.message || "Couldn't log in.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Email">
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password">
        <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Button type="submit" disabled={login.isPending}>
        Log in
      </Button>
    </form>
  );
}
