-- ============================================================
-- Budgli database migrations
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to run multiple times (all statements are idempotent)
-- ============================================================


-- ── user_goals (original migration) ──────────────────────────

create table if not exists user_goals (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users(id) on delete cascade not null unique,
  primary_goal         text,
  biggest_challenge    text,
  preferred_help_type  text,
  savings_goal         text,
  savings_intensity    text,
  onboarding_completed boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

alter table user_goals enable row level security;

drop policy if exists "Users manage own goals" on user_goals;
create policy "Users manage own goals"
  on user_goals for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_goals_updated_at on user_goals;
create trigger user_goals_updated_at
  before update on user_goals
  for each row execute function update_updated_at();


-- ============================================================
-- RLS for all user-specific tables
-- ============================================================


-- ── transactions ─────────────────────────────────────────────
alter table transactions enable row level security;

drop policy if exists "Users select own transactions" on transactions;
drop policy if exists "Users insert own transactions" on transactions;
drop policy if exists "Users update own transactions" on transactions;
drop policy if exists "Users delete own transactions" on transactions;

create policy "Users select own transactions"
  on transactions for select using (auth.uid() = user_id);
create policy "Users insert own transactions"
  on transactions for insert with check (auth.uid() = user_id);
create policy "Users update own transactions"
  on transactions for update
  using     (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own transactions"
  on transactions for delete using (auth.uid() = user_id);


-- ── fixed_costs (also stores savings entries) ────────────────
alter table fixed_costs enable row level security;

drop policy if exists "Users select own fixed costs" on fixed_costs;
drop policy if exists "Users insert own fixed costs" on fixed_costs;
drop policy if exists "Users update own fixed costs" on fixed_costs;
drop policy if exists "Users delete own fixed costs" on fixed_costs;

create policy "Users select own fixed costs"
  on fixed_costs for select using (auth.uid() = user_id);
create policy "Users insert own fixed costs"
  on fixed_costs for insert with check (auth.uid() = user_id);
create policy "Users update own fixed costs"
  on fixed_costs for update
  using     (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own fixed costs"
  on fixed_costs for delete using (auth.uid() = user_id);


-- ── salary_settings ──────────────────────────────────────────
alter table salary_settings enable row level security;

drop policy if exists "Users select own salary" on salary_settings;
drop policy if exists "Users insert own salary" on salary_settings;
drop policy if exists "Users update own salary" on salary_settings;
drop policy if exists "Users delete own salary" on salary_settings;

create policy "Users select own salary"
  on salary_settings for select using (auth.uid() = user_id);
create policy "Users insert own salary"
  on salary_settings for insert with check (auth.uid() = user_id);
create policy "Users update own salary"
  on salary_settings for update
  using     (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own salary"
  on salary_settings for delete using (auth.uid() = user_id);


-- ── category_memory ───────────────────────────────────────────
alter table category_memory enable row level security;

drop policy if exists "Users select own category memory" on category_memory;
drop policy if exists "Users insert own category memory" on category_memory;
drop policy if exists "Users update own category memory" on category_memory;
drop policy if exists "Users delete own category memory" on category_memory;

create policy "Users select own category memory"
  on category_memory for select using (auth.uid() = user_id);
create policy "Users insert own category memory"
  on category_memory for insert with check (auth.uid() = user_id);
create policy "Users update own category memory"
  on category_memory for update
  using     (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own category memory"
  on category_memory for delete using (auth.uid() = user_id);


-- ── custom_tags ───────────────────────────────────────────────
alter table custom_tags enable row level security;

drop policy if exists "Users select own tags" on custom_tags;
drop policy if exists "Users insert own tags" on custom_tags;
drop policy if exists "Users update own tags" on custom_tags;
drop policy if exists "Users delete own tags" on custom_tags;

create policy "Users select own tags"
  on custom_tags for select using (auth.uid() = user_id);
create policy "Users insert own tags"
  on custom_tags for insert with check (auth.uid() = user_id);
create policy "Users update own tags"
  on custom_tags for update
  using     (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own tags"
  on custom_tags for delete using (auth.uid() = user_id);


-- ── beta_feedback ─────────────────────────────────────────────
-- Authenticated users may only INSERT their own feedback row.
-- SELECT / UPDATE / DELETE are admin-only (service role key).
alter table beta_feedback enable row level security;

drop policy if exists "Users submit own feedback" on beta_feedback;
create policy "Users submit own feedback"
  on beta_feedback for insert with check (auth.uid() = user_id);


-- ── user_preferences ──────────────────────────────────────────
-- Stores per-user app preferences (e.g. savings forecast state).
-- Run this BEFORE adding RLS if the table doesn't exist yet.
create table if not exists user_preferences (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  forecast_state jsonb not null default '{}',
  updated_at     timestamptz default now()
);

alter table user_preferences enable row level security;

drop policy if exists "Users manage own preferences" on user_preferences;
create policy "Users manage own preferences"
  on user_preferences for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists user_preferences_updated_at on user_preferences;
create trigger user_preferences_updated_at
  before update on user_preferences
  for each row execute function update_updated_at();


-- ── salary_settings: add year column + unique constraint ───────
-- The app stores one salary row per user per year.
-- This migration ensures the year column exists and adds a unique
-- constraint so future upserts (if needed) work correctly.
-- If this fails with "could not create unique index", you have
-- duplicate rows for the same user+year — delete them first via
-- the Supabase dashboard, then re-run.
alter table salary_settings add column if not exists year integer;

alter table salary_settings
  drop constraint if exists salary_settings_user_id_year_key;
alter table salary_settings
  add constraint salary_settings_user_id_year_key unique (user_id, year);


-- ── delete_user() — hardened self-deletion RPC ────────────────
-- Allows an authenticated user to permanently delete their own account
-- and all associated data in a single atomic operation.
--
-- Security properties:
--   SECURITY DEFINER  — runs as the function owner (postgres) so it can
--                       DELETE from auth.users and bypass RLS where needed
--   SET search_path   — prevents search_path injection attacks that could
--                       shadow auth.uid() with a malicious function
--   NULL guard        — rejects calls made without a valid session
--   REVOKE / GRANT    — only the 'authenticated' role can execute this;
--                       the default PUBLIC grant is removed
--
-- Table coverage (all user-specific tables as of this migration):
--   transactions, category_memory, fixed_costs, salary_settings,
--   custom_tags, user_goals, user_preferences
--   beta_feedback rows are anonymized (user_id → NULL) rather than deleted
--   to preserve product analytics without retaining personal linkage.
--
-- user_goals and user_preferences also have ON DELETE CASCADE on auth.users,
-- but explicit deletes here run first to ensure no orphaned data.

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  _uid uuid := auth.uid();
begin
  if _uid is null then
    raise exception 'delete_user: caller is not authenticated';
  end if;

  delete from public.transactions    where user_id = _uid;
  delete from public.category_memory where user_id = _uid;
  delete from public.fixed_costs      where user_id = _uid;
  delete from public.salary_settings  where user_id = _uid;
  delete from public.custom_tags       where user_id = _uid;
  delete from public.user_preferences  where user_id = _uid;
  delete from public.user_goals        where user_id = _uid;

  -- Anonymize feedback rather than delete — severs PII linkage, keeps analytics
  update public.beta_feedback set user_id = null where user_id = _uid;

  -- Delete the auth record last; CASCADE cleans up any remaining FK references
  delete from auth.users where id = _uid;
end;
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;
