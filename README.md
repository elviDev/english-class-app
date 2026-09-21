# English Class

A small, free web app for running a private English class online: class chat, private
teacher↔student messaging, assignments with grading, and an AI "Study Buddy" tutor students can
practice with between classes.

Built with [Next.js](https://nextjs.org) (App Router) and [Supabase](https://supabase.com)
(auth + database + realtime), with [Gemini](https://aistudio.google.com) powering the AI tutor.
Runs free on Vercel's and Supabase's free tiers for a small class.

## Features

- **Accounts** — email/password signup and login. New accounts are students by default; becoming
  the teacher requires a private setup code, checked only on the server.
- **Class chat** — one shared, realtime group chat for the whole class.
- **Messages** — private threads between the teacher and each student individually.
- **Assignments** — the teacher posts assignments with instructions and an optional due date;
  students submit answers; the teacher grades them with a grade and optional feedback. Grades
  and new submissions appear live, without a page reload.
- **Study Buddy** — an AI tutor (Gemini) students can chat with in English, Spanish, or a mix of
  both, for extra practice outside class. The teacher gets a read-only log of what students have
  been asking, to spot what to cover in class.

## Getting started

See **[SETUP.md](./SETUP.md)** for the full step-by-step walkthrough (creating a free Supabase
project, a free Gemini API key, configuring `.env.local`, and deploying to Vercel).

Quick reference, once `.env.local` is filled in:

```
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.js                    All UI — auth screen, chat, messages, assignments, Study Buddy.
  layout.js                  Root layout, fonts, page metadata.
  globals.css                Styling.
  api/
    claim-teacher/route.js   Verifies the teacher setup code server-side, promotes the account.
    study-buddy/route.js     Calls the Gemini API server-side and logs the exchange.
lib/
  supabaseClient.js          Browser-side Supabase client.
schema.sql                   Full database schema + Row Level Security policies. Run once in
                              the Supabase SQL editor when setting up a new project.
```

## Security model

- Passwords are handled entirely by Supabase (industry-standard hashing) — this app's own code
  never sees them.
- Becoming a teacher is checked only on the server (`/api/claim-teacher`), using a private code
  and Supabase's service-role key; the database itself refuses to let a normal account touch its
  own `role` column, so this can't be bypassed by editing requests in the browser.
- All data access is enforced by Postgres Row Level Security (see `schema.sql`), not just by
  what the app's screens choose to show — a student can only ever read their own private
  messages and submissions; the teacher can read everyone's.
- Message and submission authorship is always looked up server-side from the sender's real
  account, never taken from what the browser claims.
- The Study Buddy endpoint requires a valid, signed-in session for every request, and the
  Gemini API key is only ever used server-side.

Full detail, plus what this app is and isn't designed to withstand, is in the "Security" section
of [SETUP.md](./SETUP.md).

## Known limitations

- Built for a small class the teacher knows personally — not hardened against a dedicated,
  skilled attacker. Don't have students share sensitive personal data (ID numbers, financial or
  health information) inside it.
- No rate limiting on the teacher-code check or the AI tutor endpoint beyond requiring a signed-in
  account — acceptable for a small trusted class, not for a large or public deployment.
- The assignments list itself doesn't update live when the teacher posts a new one (submissions
  and grades do); students see new assignments on their next reload or tab switch.

## Updating a live deployment

Make your changes, then run `npx vercel --prod` again from this folder (see Step 5 of
[SETUP.md](./SETUP.md) if Vercel isn't set up yet).
