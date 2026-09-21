import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage() {
  const supabase = isSupabaseConfigured ? await getSupabaseServerClient() : null;
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[420px] rounded-2xl border border-line bg-paper px-8 py-9 shadow-[0_2px_18px_rgba(31,58,95,0.08)]">
        <h1 className="mb-[22px] text-2xl">Reset your password</h1>
        {user ? (
          <ResetPasswordForm />
        ) : (
          <>
            <p className="mb-[22px] text-[0.98rem] text-muted">
              This password reset link is invalid or has expired. Go back and request a new one from the sign-in
              page.
            </p>
            <a href="/" className="font-bold text-navy underline">
              Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}
