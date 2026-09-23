"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { LinkButton } from "@/components/ui/LinkButton";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

const SUBTITLES = {
  login: "Sign in to join your class.",
  signup: "Create your account to join the class.",
  forgot: "We'll email you a link to reset your password.",
};

export function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [error, setError] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSentEmail("");
  }

  function handleNeedsConfirmation(isTeacher) {
    setError(
      isTeacher
        ? 'Account created, check your email, click the confirmation link, then log in and use the "I\'m the teacher" button in the app to finish setup.'
        : "Account created, check your email and click the confirmation link, then log in."
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="w-full max-w-[420px] animate-slide-up rounded-2xl border border-line bg-paper px-8 py-9 shadow-[0_2px_24px_rgb(31_58_95_/_8%)] dark:shadow-[0_2px_24px_rgb(0_0_0_/_35%)]">
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-gold-light">
          <GraduationCap size={22} strokeWidth={2} />
        </span>
        <h1 className="mb-1 text-2xl">English Class</h1>
        <p className="mb-[22px] text-[0.98rem] text-muted">{SUBTITLES[mode]}</p>
        <ErrorBanner>{error}</ErrorBanner>

        {mode === "login" && (
          <>
            <LoginForm onError={setError} />
            <div className="mt-3 text-right text-sm">
              <LinkButton onClick={() => switchMode("forgot")}>Forgot password?</LinkButton>
            </div>
          </>
        )}

        {mode === "signup" && <SignupForm onError={setError} onNeedsConfirmation={handleNeedsConfirmation} />}

        {mode === "forgot" &&
          (sentEmail ? (
            <p className="text-[0.98rem] text-muted">
              If an account exists for <strong className="text-ink">{sentEmail}</strong>, a password reset link
              is on its way. Check your email.
            </p>
          ) : (
            <ForgotPasswordForm onError={setError} onSent={setSentEmail} />
          ))}

        <div className="mt-[18px] text-center text-sm text-muted">
          {mode === "login" && (
            <>
              New here? <LinkButton onClick={() => switchMode("signup")}>Create an account</LinkButton>
            </>
          )}
          {mode === "signup" && (
            <>
              Already have an account? <LinkButton onClick={() => switchMode("login")}>Log in</LinkButton>
            </>
          )}
          {mode === "forgot" && <LinkButton onClick={() => switchMode("login")}>Back to log in</LinkButton>}
        </div>
      </div>
    </div>
  );
}
