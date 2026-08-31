-- PetOS Desktop — Supabase schema
--
-- Run this whole file once in your project's SQL Editor
-- (Supabase dashboard → SQL Editor → New query → paste → Run).
--
-- Design notes:
--  * Every table is scoped by owner_id (the signed-in business's auth uid)
--    with row-level security, so each business only ever sees its own data.
--  * Entity ids stay plain, client-generated opaque strings (e.g.
--    "pet-m3x1a2-9fz") — the app already generates ids this way, so
--    tables use a composite primary key (owner_id, id) instead of forcing
--    everything onto server-generated uuids. This also lets foreign keys
--    be scoped per-owner, which blocks a row from ever referencing
--    another business's data.
--  * "profiles" holds the one row of business info per account (name,
--    email, plan, invoice counter) — auth.users already handles the
--    actual login credentials.

-- ── profiles ────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  owner_name text not null,
  email text not null,
  plan text not null default 'Pro plan',
  invoice_counter int not null default 1000,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Individuals can view their own profile" on profiles
  for select using (id = auth.uid());
create policy "Individuals can insert their own profile" on profiles
  for insert with check (id = auth.uid());
create policy "Individuals can update their own profile" on profiles
  for update using (id = auth.uid());

-- ── clients ─────────────────────────────────────────────────────────────
create table if not exists clients (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  address_line1 text not null default '',
  address_line2 text not null default '',
  email text not null default '',
  phone text,
  member_since text not null default '',
  key_safe text,
  emergency_contact text,
  vet text,
  created_at timestamptz not null default now(),
  primary key (owner_id, id)
);

alter table clients enable row level security;
create policy "Owns clients" on clients for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ── pets ────────────────────────────────────────────────────────────────
create table if not exists pets (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  breed text not null default '',
  client_id text not null,
  plan text not null default 'Weekly',
  alert text,
  color text not null default '#888888',
  photo text,
  age_years int,
  notes text,
  created_at timestamptz not null default now(),
  primary key (owner_id, id),
  foreign key (owner_id, client_id) references clients(owner_id, id) on delete cascade
);

alter table pets enable row level security;
create policy "Owns pets" on pets for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ── team_members ────────────────────────────────────────────────────────
create table if not exists team_members (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  role text not null default 'Walker',
  area text not null default '',
  color text not null default '#888888',
  phone text not null default '',
  email text not null default '',
  joined text not null default '',
  bio text not null default '',
  skills text[] not null default '{}',
  status text not null default 'Available',
  created_at timestamptz not null default now(),
  primary key (owner_id, id)
);

alter table team_members enable row level security;
create policy "Owns team_members" on team_members for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ── walks ───────────────────────────────────────────────────────────────
create table if not exists walks (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  pet_id text not null,
  walker_id text not null default '',
  date date not null,
  time text not null,
  duration_min int not null,
  price numeric not null default 0,
  route text not null default '',
  status text not null default 'scheduled',
  repeat_weekly boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (owner_id, id),
  foreign key (owner_id, pet_id) references pets(owner_id, id) on delete cascade
);

alter table walks enable row level security;
create policy "Owns walks" on walks for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ── invoices ────────────────────────────────────────────────────────────
create table if not exists invoices (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null, -- friendly label, e.g. "CDC-1048"
  client_id text,
  pet_id text,
  issued text,
  due text,
  status text not null default 'draft',
  paid_on text,
  method text,
  reminder_on text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (owner_id, id)
);

alter table invoices enable row level security;
create policy "Owns invoices" on invoices for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ── reports ─────────────────────────────────────────────────────────────
create table if not exists reports (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  pet_id text not null,
  walker_id text not null default '',
  route text not null default '',
  when_text text not null default '',
  distance text not null default '',
  duration text not null default '',
  status text not null default 'pending',
  summary text not null default '',
  tones jsonb,
  logs jsonb not null default '[]'::jsonb,
  include jsonb not null default '{"photos":false,"map":false,"behaviour":false,"water":false}'::jsonb,
  photos text[],
  created_at timestamptz not null default now(),
  primary key (owner_id, id),
  foreign key (owner_id, pet_id) references pets(owner_id, id) on delete cascade
);

alter table reports enable row level security;
create policy "Owns reports" on reports for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ── recs ────────────────────────────────────────────────────────────────
create table if not exists recs (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  title text not null,
  sub text not null default '',
  cta text not null default '',
  dismissed boolean not null default false,
  primary key (owner_id, id)
);

alter table recs enable row level security;
create policy "Owns recs" on recs for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ── notes ───────────────────────────────────────────────────────────────
create table if not exists notes (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  text text not null,
  created_at timestamptz not null default now(),
  primary key (owner_id, id)
);

alter table notes enable row level security;
create policy "Owns notes" on notes for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ── settings (one row per business) ────────────────────────────────────
create table if not exists settings (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  rate_solo60 numeric not null default 24,
  rate_solo30 numeric not null default 16,
  rate_group numeric not null default 13,
  weekday_hours text not null default '08:00 – 17:00',
  weekend_hours text not null default 'Mornings only',
  auto_decline boolean not null default true,
  auto_draft boolean not null default true,
  require_approval boolean not null default true,
  auto_charge boolean not null default true,
  overdue_reminders boolean not null default true,
  report_tone text not null default 'warm',
  payout_account text not null default ''
);

alter table settings enable row level security;
create policy "Owns settings" on settings for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ── storage: pet & report photos ───────────────────────────────────────
-- Public bucket (read) so <img src> works with no auth header; writes are
-- restricted to the signed-in user's own folder, i.e. paths under
-- "<their-user-id>/...".
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "Public read access to photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Users upload photos into their own folder"
  on storage.objects for insert
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users update photos in their own folder"
  on storage.objects for update
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete photos in their own folder"
  on storage.objects for delete
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
