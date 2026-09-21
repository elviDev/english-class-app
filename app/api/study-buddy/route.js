import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { studyBuddyRequestSchema } from "@/schemas/study-buddy";

const SYSTEM_INSTRUCTION = `You are "Study Buddy," a patient, encouraging English tutor inside a
small English class app for adult students in Spain. Every student here is a native Spanish
speaker. Many are over 60 and some are complete beginners; others have more experience. You are
here to help them practice ON THEIR OWN, between classes.

Language handling, this matters a lot:
- Assume the student may write to you in Spanish, English, or a mix of both, and understand
  Spanish fully and naturally either way.
- If they write in Spanish, understand exactly what they mean and reply in a way that teaches
  them how to say it in English: give the English version clearly, then a short explanation
  (you can explain in Spanish if the point is tricky), so they leave with something usable in
  English, not just a Spanish conversation.
- If they ask "how do you say X in English?" or explain something in Spanish, answer with the
  English phrase first, prominently, then a one-line note on usage or pronunciation if useful.
- If they write in English, stay in English so they get the practice, but you may drop in a
  short Spanish clarification in parentheses if a word or idiom is likely to confuse them.
- Never make a student feel bad for using Spanish, it's expected and welcome here. The goal is
  always to leave them a little more confident in English, not to police which language they use.

How to respond:
- Keep answers SHORT: a few sentences, not an essay. This is a chat, not a lecture.
- Use simple, everyday words and short sentences yourself, so your own English is easy to read.
- If they make a mistake in English, don't just correct it, show the corrected sentence AND
  explain why, in one short line.
- Be warm and patient. Praise effort. Never sound impatient or robotic.
- When it fits, end with ONE small follow-up question or a tiny practice task in English, so the
  conversation keeps them practicing rather than just answering.
- If asked something totally unrelated to learning English, gently steer back to English
  practice.`;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const parsed = studyBuddyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Missing message." }, { status: 400 });
  }
  const { message, history } = parsed.data;

  // Require a real, currently signed-in account (via the session cookie),
  // this keeps the endpoint (and your free Gemini quota) restricted to
  // your actual class, not open to anyone on the internet who finds the URL.
  const supabase = await getSupabaseServerClient();
  const { data: userData, error: userErr } = supabase ? await supabase.auth.getUser() : { data: null, error: true };
  if (!supabase || userErr || !userData?.user) {
    return NextResponse.json({ error: "You need to be signed in to use Study Buddy." }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server isn't fully configured (missing service role key)." }, { status: 500 });
  }

  // Look up the student's real name from their profile, never trust a
  // name the browser sends, so nobody can spoof "asking as" someone else.
  const { data: profile } = await admin.from("profiles").select("name").eq("id", userData.user.id).single();
  const studentName = profile?.name || "Student";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("YOUR_")) {
    return NextResponse.json(
      { error: "The Study Buddy isn't set up yet, the teacher needs to add a Gemini API key." },
      { status: 500 }
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [];
  for (const turn of history.slice(-10)) {
    if (!turn?.text) continue;
    contents.push({
      role: turn.role === "ai" ? "model" : "user",
      parts: [{ text: turn.text }],
    });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  let reply;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION + `\n\nThe student's name is ${studentName}.` }],
        },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
      }),
    });

    if (res.status === 429) {
      return NextResponse.json(
        { error: "Study Buddy is a little busy right now (free daily limit reached). Try again in a few minutes." },
        { status: 429 }
      );
    }
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Gemini API error:", res.status, errText);
      return NextResponse.json({ error: "Study Buddy couldn't answer that just now. Please try again." }, { status: 502 });
    }

    const data = await res.json();
    reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    if (!reply) {
      return NextResponse.json({ error: "Study Buddy didn't understand that. Try rephrasing?" }, { status: 502 });
    }
  } catch (err) {
    console.error("Study Buddy request failed:", err);
    return NextResponse.json({ error: "Couldn't reach Study Buddy. Check your connection and try again." }, { status: 502 });
  }

  // Log the exchange server-side, using the real verified student id/name
  // and the real reply, never data the browser could have made up. If
  // this fails, the student still gets their answer; we just skip the log.
  admin
    .from("study_buddy_logs")
    .insert({ student_id: userData.user.id, student_name: studentName, question: message, answer: reply })
    .then(({ error }) => {
      if (error) console.error("Failed to log Study Buddy exchange:", error);
    });

  return NextResponse.json({ reply });
}
