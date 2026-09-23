# English Class

A small, free web app for running a private English class online: class chat, private
teacher↔student messaging, assignments with grading, and an AI "Study Buddy" tutor students can
practice with between classes.

Built with [Next.js](https://nextjs.org) (App Router) and [Supabase](https://supabase.com)
(auth + database + realtime), with [Gemini](https://aistudio.google.com) powering the AI tutor.
Runs free on Vercel's and Supabase's free tiers for a small class.

## Features

- **Accounts**, email/password signup and login, plus a self-serve "forgot password" flow. New
  accounts are students by default; becoming the teacher requires a private setup code, checked
  only on the server.
- **Class chat**, one shared, realtime group chat for the whole class. Messages can carry emoji
  (a built-in picker, no separate keyboard needed) and anyone can react to a message with an
  emoji, visible live to everyone.
- **Messages**, private threads between the teacher and each student individually, with the same
  emoji and reactions support.
- **Assignments**, the teacher posts assignments with instructions, an optional due date, and
  optional file attachments (PDFs, images, documents, audio); students submit answers and
  download any attached files; the teacher grades submissions with a grade and optional feedback.
  Grades and new submissions appear live, without a page reload.
- **Study Buddy**, an AI tutor (Gemini) students can chat with in English, Spanish, or a mix of
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
  page.js                    Server Component entry point: resolves the session, renders AuthScreen or AppShell.
  layout.js                  Root layout, fonts, page metadata, JSON-LD.
  globals.css                Tailwind CSS v4 entry point + design tokens (colors, fonts).
  robots.js, sitemap.js      SEO metadata routes.
  api/
    claim-teacher/route.js   Verifies the teacher setup code server-side, promotes the account.
    study-buddy/route.js     Calls the Gemini API server-side and logs the exchange.
public/
  llms.txt                   Plain-language app description for LLM crawlers/agents.
src/
  components/                UI grouped by feature (auth, chat, messages, assignments, study-buddy,
                              layout) plus a small shared `ui/` primitives folder (Button, Input, Panel, ...).
  hooks/                     One React Query hook per data operation, grouped by feature. Realtime
                              subscriptions (see hooks/useRealtimeSync.js) feed straight into the
                              query cache instead of polling.
  providers/                 QueryProvider (React Query) and SessionProvider (Supabase session, see below).
  stores/                    Zustand store for the signed-in user's session/profile.
  schemas/                   Zod validation schemas, shared by client forms and API routes.
  lib/                       Supabase client factories (browser/server/admin), query keys, utils, SEO.
middleware.js                 Refreshes the Supabase auth cookie on every request.
schema.sql                    Full database schema + Row Level Security policies. Run once in
                               the Supabase SQL editor when setting up a new project.
```

Session management uses `@supabase/ssr`: the session lives in cookies (kept fresh by
`middleware.js`), `app/page.js` reads it server-side with zero loading flash, and
`src/providers/SessionProvider.js` keeps a per-request Zustand store in sync on the client
afterwards.

## Security model

- Passwords are handled entirely by Supabase (industry-standard hashing), this app's own code
  never sees them.
- Becoming a teacher is checked only on the server (`/api/claim-teacher`), using a private code
  and Supabase's service-role key; the database itself refuses to let a normal account touch its
  own `role` column, so this can't be bypassed by editing requests in the browser.
- All data access is enforced by Postgres Row Level Security (see `schema.sql`), not just by
  what the app's screens choose to show, a student can only ever read their own private
  messages and submissions; the teacher can read everyone's.
- Message and submission authorship is always looked up server-side from the sender's real
  account, never taken from what the browser claims.
- The Study Buddy endpoint requires a valid, signed-in session for every request, and the
  Gemini API key is only ever used server-side.

Full detail, plus what this app is and isn't designed to withstand, is in the "Security" section
of [SETUP.md](./SETUP.md).

## Known limitations

- Built for a small class the teacher knows personally, not hardened against a dedicated,
  skilled attacker. Don't have students share sensitive personal data (ID numbers, financial or
  health information) inside it.
- No rate limiting on the teacher-code check or the AI tutor endpoint beyond requiring a signed-in
  account, acceptable for a small trusted class, not for a large or public deployment.
- The assignments list itself doesn't update live when the teacher posts a new one (submissions
  and grades do); students see new assignments on their next reload or tab switch.

## Updating a live deployment

Make your changes, then run `npx vercel --prod` again from this folder (see Step 5 of
[SETUP.md](./SETUP.md) if Vercel isn't set up yet).
