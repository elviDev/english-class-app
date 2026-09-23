"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const ERROR_MESSAGES = {
  otp_expired: "This password reset link has expired. Request a new one below.",
  access_denied: "This password reset link is invalid or has already been used.",
};

function describeHashError(hash) {
  const params = new URLSearchParams(hash.slice(1));
  const code = params.get("error_code");
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  const description = params.get("error_description");
  return description ? description.replace(/\+/g, " ") : "This password reset link is invalid or has expired.";
}

/**
 * Supabase's built-in (non-custom) email template - the only option on the
 * free tier once template editing is locked - lands recovery tokens (or an
 * error) in the URL hash fragment, e.g. #access_token=...&type=recovery.
 * The server never sees a hash fragment, so this has to be resolved
 * client-side: supabase-js parses it automatically as soon as the browser
 * client is created and fires a PASSWORD_RECOVERY auth event, we just wait
 * for that instead of trusting the server-rendered session check alone.
 */
export function ResetPasswordGate({ initialHasSession }) {
  const [status, setStatus] = useState(initialHasSession ? "ready" : "checking");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialHasSession) return undefined;

    const hash = window.location.hash;
    if (hash.includes("error=")) {
      setError(describeHashError(hash));
      setStatus("error");
      return undefined;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus("error");
      return undefined;
    }

    let settled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (settled) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        settled = true;
        setStatus("ready");
      }
    });

    // Fallback in case the event already fired before this listener was
    // attached (e.g. a fast client init), or there was never a hash to
    // process at all.
    const timeout = setTimeout(async () => {
      if (settled) return;
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        settled = true;
        setStatus("ready");
      } else {
        setStatus("error");
      }
    }, 2500);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [initialHasSession]);

  if (status === "checking") {
    return <p className="text-[0.98rem] text-muted">Checking your link…</p>;
  }

  if (status === "error") {
    return (
      <>
        <p className="mb-[22px] text-[0.98rem] text-muted">
          {error ||
            "This password reset link is invalid or has expired. Go back and request a new one from the sign-in page."}
        </p>
        <a href="/" className="font-bold text-heading underline underline-offset-2">
          Back to sign in
        </a>
      </>
    );
  }

  return <ResetPasswordForm />;
}
