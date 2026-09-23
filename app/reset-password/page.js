import { KeyRound } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ResetPasswordGate } from "@/components/auth/ResetPasswordGate";

export const metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage() {
  const supabase = isSupabaseConfigured ? await getSupabaseServerClient() : null;
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="w-full max-w-[420px] animate-slide-up rounded-2xl border border-line bg-paper px-8 py-9 shadow-[0_2px_24px_rgb(31_58_95_/_8%)] dark:shadow-[0_2px_24px_rgb(0_0_0_/_35%)]">
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-gold-light">
          <KeyRound size={20} strokeWidth={2} />
        </span>
        <h1 className="mb-[22px] text-2xl">Reset your password</h1>
        <ResetPasswordGate initialHasSession={Boolean(user)} />
      </div>
    </div>
  );
}
