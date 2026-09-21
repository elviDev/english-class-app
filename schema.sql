-- ============================================================
-- Classroom app schema (security-hardened), run once in the
-- Supabase SQL editor. If you already ran an earlier version of
-- this file, see the note at the bottom before running this.
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('teacher', 'student')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Auto-create a profile row the moment an account is created -
-- run by the database itself, not the browser, so it works
-- immediately even before someone has confirmed their email
-- (which is when the browser has no permission yet to write
-- anything as that new user).
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table group_messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table direct_messages (
  id bigint generated always as identity primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table assignments (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  due_date date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table submissions (
  id bigint generated always as identity primary key,
  assignment_id bigint not null references assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  content text not null,
  submitted_at timestamptz not null default now(),
  grade text,
  feedback text,
  graded_at timestamptz,
  unique (assignment_id, student_id)
);

-- Written only by the server (via the service role key), never by the
-- browser directly, see the note on study_buddy_logs policies below.
create table study_buddy_logs (
  id bigint generated always as identity primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Trigger: always fill in sender_name / student_name from the
-- person's real profile, ignoring whatever the browser sent.
-- This stops someone from typing messages that appear to be
-- from a different person.
-- ============================================================
create or replace function public.set_sender_name_from_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  select name into new.sender_name from profiles where id = new.sender_id;
  return new;
end;
$$;

create trigger trg_group_messages_sender_name
  before insert on group_messages
  for each row execute function public.set_sender_name_from_profile();

create trigger trg_direct_messages_sender_name
  before insert on direct_messages
  for each row execute function public.set_sender_name_from_profile();

create or replace function public.set_student_name_from_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  select name into new.student_name from profiles where id = new.student_id;
  return new;
end;
$$;

create trigger trg_submissions_student_name
  before insert on submissions
  for each row execute function public.set_student_name_from_profile();

create trigger trg_logs_student_name
  before insert on study_buddy_logs
  for each row execute function public.set_student_name_from_profile();

-- ============================================================
-- Row Level Security, who can read/write what
-- ============================================================

alter table profiles enable row level security;
alter table group_messages enable row level security;
alter table direct_messages enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table study_buddy_logs enable row level security;

-- profiles ---------------------------------------------------
-- Everyone signed in can see names/roles (needed to show the class list).
-- New accounts can only ever insert themselves as 'student', becoming a
-- teacher requires the server-side /api/claim-teacher route, which checks
-- the secret code on the server and uses the service role key to make the
-- change. This is what actually stops someone from just editing the
-- request in their browser to grant themselves teacher access.
create policy profiles_select on profiles for select using (auth.role() = 'authenticated');
create policy profiles_insert on profiles for insert with check (id = auth.uid() and role = 'student');
create policy profiles_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Extra lock: even the "own row" update policy above only ever lets a
-- signed-in user change their own NAME. The database itself refuses to
-- let a regular user's request touch the "role" column at all, not just
-- the app's UI, the actual database column privilege.
revoke update on profiles from authenticated;
grant update (name) on profiles to authenticated;

-- group_messages -----------------------------------------------
create policy group_select on group_messages for select using (auth.role() = 'authenticated');
create policy group_insert on group_messages for insert with check (sender_id = auth.uid());

-- direct_messages ------------------------------------------------
create policy dm_select on direct_messages for select using (
  student_id = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy dm_insert on direct_messages for insert with check (
  sender_id = auth.uid()
  and (
    student_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
  )
);

-- assignments ------------------------------------------------
create policy assignments_select on assignments for select using (auth.role() = 'authenticated');
create policy assignments_insert on assignments for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy assignments_update on assignments for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy assignments_delete on assignments for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);

-- submissions ------------------------------------------------
create policy submissions_select on submissions for select using (
  student_id = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy submissions_insert on submissions for insert with check (student_id = auth.uid());
create policy submissions_student_update on submissions for update
  using (student_id = auth.uid() and grade is null)
  with check (student_id = auth.uid());
create policy submissions_teacher_update on submissions for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'teacher'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'teacher'));

-- study_buddy_logs ---------------------------------------------
-- Read access: a student sees their own questions, the teacher sees all.
-- Deliberately NO insert policy for regular users here, only the
-- service role (used exclusively by the trusted /api/study-buddy server
-- route, never exposed to the browser) can write a log row. This stops
-- someone from forging fake "Study Buddy said..." entries by calling the
-- database directly.
create policy logs_select on study_buddy_logs for select using (
  student_id = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);

-- ============================================================
-- Realtime, so chat and messages update live for everyone
-- ============================================================
alter publication supabase_realtime add table group_messages;
alter publication supabase_realtime add table direct_messages;
alter publication supabase_realtime add table submissions;

-- ============================================================
-- Upgrading from the earlier (non-hardened) version of this schema?
-- Run this first, in a fresh SQL query, then run the rest of this file:
--
--   drop table if exists study_buddy_logs cascade;
--   drop table if exists submissions cascade;
--   drop table if exists assignments cascade;
--   drop table if exists direct_messages cascade;
--   drop table if exists group_messages cascade;
--   drop table if exists profiles cascade;
--
-- This deletes all existing test data. If real students have already
-- signed up and you need to keep their accounts, stop here and ask for
-- a migration script instead of a full drop.
-- ============================================================

-- ============================================================
-- Already have all your tables set up correctly, and just need the
-- new auto-profile trigger (added to fix signup with email confirmation
-- turned on)? You don't need to drop anything, just run this on its
-- own in a new query:
--
--   create or replace function public.handle_new_user()
--   returns trigger
--   language plpgsql
--   security definer set search_path = public
--   as $$
--   begin
--     insert into public.profiles (id, name, role)
--     values (
--       new.id,
--       coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
--       'student'
--     );
--     return new;
--   end;
--   $$;
--
--   create trigger on_auth_user_created
--     after insert on auth.users
--     for each row execute function public.handle_new_user();
--
-- Then, in Authentication -> Users, delete any half-created test
-- accounts that got stuck before this fix (ones with no matching row
-- in the profiles table), and sign up again.
-- ============================================================
