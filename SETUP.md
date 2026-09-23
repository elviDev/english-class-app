# Setting up your classroom app (completely free)

You'll need three free accounts:
1. **Supabase**, the database (accounts, messages, assignments, grades).
2. **Google AI Studio**, gives you a free Gemini API key for the AI tutor.
3. **Vercel**, hosts the site (you already have this, at elvidev.vercel.app).

Total cost: **€0**.

---

## Step 0: Install Node.js (one-time, if you don't have it)

Go to [nodejs.org](https://nodejs.org) and download the **LTS** version. Run the installer,
accepting the defaults.

## Step 1: Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up.
2. Click **New project**. Name it e.g. `english-class`, set a database password (save it), and
   pick a region close to Spain.
3. Open **SQL Editor** → **New query**, paste in everything from `schema.sql`, and click **Run**.
   You should see "Success. No rows returned."

   Already have this project set up from before emoji reactions and assignment attachments
   existed? Don't rerun the whole file, it would try to recreate tables you already have. Instead
   scroll to the very bottom of `schema.sql`, to the block titled "Already have the app set up and
   just want emoji reactions on messages and file attachments on assignments?", uncomment it (the
   whole block is a single SQL comment, remove the leading `--` from each line), and run just
   that in a new query.
4. Go to **Authentication → Providers → Email** and turn **off** "Confirm email," so students can
   log in right after signing up.
5. Go to **Authentication → Policies** (or **Auth settings**, depending on the dashboard version)
   and set the **minimum password length to 8**, a small, free hardening step worth doing.
6. Go to **Project Settings → API** and copy three things, all needed in Step 3:
   - **Project URL**
   - **anon public** key
   - **service_role** key, click "Reveal" to see it. This one is powerful and must stay
     completely private (more on this below).
7. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: your live address, e.g. `https://elvidev.vercel.app` (not `localhost`, this is
     the one field every auth email is built from, regardless of where a request came from).
   - **Redirect URLs**: add `http://localhost:3000/**` for local testing, and your live address
     too, e.g. `https://elvidev.vercel.app/**`.
   This is what lets Supabase send someone back into this app after they click a "reset your
   password" email.
8. (Optional) Free Supabase projects can no longer edit auth email templates unless a custom SMTP
   provider is configured (Authentication → Emails), so this app is built to work with the
   default "Reset Password" template as-is, no template edits required. If you do set up your own
   SMTP later and want the reset link to carry your own branding, you can then edit
   **Authentication → Email Templates → Reset Password** and point its link at:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}
   ```

## Step 2: Get a free Gemini API key (for the AI Study Buddy)

1. Go to [aistudio.google.com](https://aistudio.google.com), sign in with any Google account.
2. Click **Get API key → Create API key**. No credit card needed.
3. Copy the key.

## Step 3: Configure the project

1. Make a copy of `.env.local.example`, rename it to `.env.local`, and fill in all six values -
   the two from Supabase's API page, the service_role key, a private teacher code you invent,
   your Gemini key, and the model name (leave as `gemini-flash-lite-latest`, a Google-maintained
   alias that always points at their current stable, free-tier-friendly model, so it won't break
   again when they retire a specific version or when the full flash tier is over capacity).
2. Double-check none of the server-only values (`SUPABASE_SERVICE_ROLE_KEY`, `TEACHER_SETUP_CODE`,
   `GEMINI_API_KEY`) accidentally get a `NEXT_PUBLIC_` prefix, that would make them public.

## Step 4: Try it locally

```
npm install
npm run dev
```
Open **http://localhost:3000**, sign up as the teacher (tick "I'm the teacher," enter your code),
and try the chat, an assignment, and Study Buddy. `Ctrl+C` to stop.

## Step 5: Put it online with Vercel

1. `npx vercel login`, follow the prompts.
2. `npx vercel --prod`, accepting the defaults.
3. On [vercel.com](https://vercel.com), open your project → **Settings → Environment Variables**,
   and add all six values from your `.env.local` there too (Vercel needs its own copy, it
   doesn't read your local file).
4. Run `npx vercel --prod` again so the deployment picks up those variables.
5. Share your live link (e.g. `english-class.vercel.app`) with students.

## Step 6: Invite your students

They click **Create an account**, enter their name/email/password, leave "I'm the teacher"
unticked, and land in the class chat.

---

## Security, what's protecting your students' data

**Passwords:** handled entirely by Supabase using industry-standard hashing. Your code never
sees, stores, or has access to anyone's actual password, not even yours.

**Who can become a teacher:** checked only on the server, using your private `TEACHER_SETUP_CODE`
and Supabase's service_role key. A student cannot make themselves a teacher by editing requests
in their browser, the server independently verifies both the code and their identity before
making the change, and the database itself refuses to let a normal account's request touch the
"role" column at all.

**Who can read what:** enforced by the database itself (Row Level Security), not just by what the
app's screens show you. A student can only ever read their own private messages and their own
submissions; the teacher can read everyone's, because the rules explicitly say so. Nobody else's
account can query around that by calling the database directly.

**Message and submission authorship:** the sender's name is always looked up from their real
account server-side when a message is saved, never taken from whatever the browser claims, so
nobody can send a message that looks like it came from someone else.

**The AI tutor:** requires a valid, currently logged-in account for every request. This stops
outside visitors from finding your app's web address and quietly using up your free daily AI
quota. The Gemini API key itself is stored only on the server and never sent to the browser.

**Data in transit:** everything runs over HTTPS automatically once deployed on Vercel.

**What this app is, and isn't:** this is solid, appropriate security for a small class you know
personally, a teacher and a handful of adult students. It is not built to withstand a dedicated,
skilled attacker, and it doesn't need to be. Treat it accordingly: don't have anyone share
sensitive personal information (ID numbers, financial details, health information) inside it, and
keep your `TEACHER_SETUP_CODE` and `SUPABASE_SERVICE_ROLE_KEY` as private as a master password,
because they effectively are ones.

**If you ever suspect something's wrong:** you can revoke and regenerate the service_role key and
Gemini API key at any time from their respective dashboards, update your `.env.local` and Vercel
environment variables, and redeploy, old keys stop working immediately.

---

## Updating the app later

Make your changes, then run `npx vercel --prod` again from this folder.
