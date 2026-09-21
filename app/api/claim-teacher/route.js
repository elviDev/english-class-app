import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This route exists so the teacher setup code is checked ONLY on the
// server, never in browser code where it could be read or bypassed.
// It uses the Supabase service role key, which is powerful (it ignores
// all Row Level Security) and must never be exposed to the browser —
// that's why it's read here from a non-NEXT_PUBLIC_ environment variable.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const { code } = body || {};
  const teacherCode = process.env.TEACHER_SETUP_CODE;
  if (!teacherCode || teacherCode.includes("choose-a-code")) {
    return NextResponse.json({ error: "Teacher sign-up isn't configured yet." }, { status: 500 });
  }
  if (typeof code !== "string" || code !== teacherCode) {
    return NextResponse.json({ error: "That teacher setup code isn't right." }, { status: 403 });
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "You need to be signed in first." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || serviceKey.includes("YOUR_")) {
    return NextResponse.json({ error: "Server isn't fully configured (missing service role key)." }, { status: 500 });
  }
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  // Verify the token actually belongs to a real, currently signed-in user —
  // this is what confirms "who is making this request" server-side.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Could not verify your session — try logging in again." }, { status: 401 });
  }

  const { error: updateErr } = await admin.from("profiles").update({ role: "teacher" }).eq("id", userData.user.id);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
