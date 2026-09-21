import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { claimTeacherSchema } from "@/schemas/auth";

// This route exists so the teacher setup code is checked ONLY on the
// server, never in browser code where it could be read or bypassed. It
// uses the Supabase service role key, which is powerful (it ignores all
// Row Level Security) and must never be exposed to the browser - that's
// why it's read here from a non-NEXT_PUBLIC_ environment variable.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const parsed = claimTeacherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Bad request." }, { status: 400 });
  }

  const teacherCode = process.env.TEACHER_SETUP_CODE;
  if (!teacherCode || teacherCode.includes("choose-a-code")) {
    return NextResponse.json({ error: "Teacher sign-up isn't configured yet." }, { status: 500 });
  }
  if (parsed.data.code !== teacherCode) {
    return NextResponse.json({ error: "That teacher setup code isn't right." }, { status: 403 });
  }

  // Identify the caller from their session cookie, the server-side source
  // of truth for "who is making this request" - never trust a user id the
  // browser could send in the request body.
  const supabase = await getSupabaseServerClient();
  const { data: userData, error: userErr } = supabase ? await supabase.auth.getUser() : { data: null, error: true };
  if (!supabase || userErr || !userData?.user) {
    return NextResponse.json({ error: "You need to be signed in first." }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server isn't fully configured (missing service role key)." }, { status: 500 });
  }

  const { error: updateErr } = await admin.from("profiles").update({ role: "teacher" }).eq("id", userData.user.id);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
