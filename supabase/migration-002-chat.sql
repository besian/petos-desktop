-- PetOS Desktop — live chat (run after schema.sql)
--
-- Adds:
--  * auth_user_id links so a clients/team_members row can be claimed by a
--    real Supabase Auth account (a "portal" login, separate from the
--    business owner's).
--  * a messages table for live owner<->client and owner<->team chat,
--    with realtime enabled.
--  * claim_portal_identity(): called once right after a portal signup.
--    Runs as SECURITY DEFINER so it can bypass RLS just long enough to
--    link auth.uid() to any clients/team_members row whose stored email
--    matches the now-authenticated (Supabase-verified) email — the
--    verified email is the only thing trusted here, never anything the
--    client could edit themselves (like user_metadata).

create extension if not exists pgcrypto;

-- ── portal identity links ──────────────────────────────────────────────
alter table clients add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
create unique index if not exists clients_auth_user_id_key on clients(auth_user_id) where auth_user_id is not null;

alter table team_members add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
create unique index if not exists team_members_auth_user_id_key on team_members(auth_user_id) where auth_user_id is not null;

-- A portal user needs to find their own row post-login — the existing
-- "owns clients"/"owns team_members" policies only match the business
-- owner, so add a narrow read-only policy for the linked portal account.
create policy "Client can view own row" on clients
  for select using (auth_user_id = auth.uid());
create policy "Team member can view own row" on team_members
  for select using (auth_user_id = auth.uid());

-- A portal user also needs to see their business's display name for the
-- chat header — the existing "profiles" policy only matches the owner.
create policy "Portal users can view their business's profile" on profiles
  for select using (
    id in (select owner_id from clients where auth_user_id = auth.uid())
    or id in (select owner_id from team_members where auth_user_id = auth.uid())
  );

-- ── messages ────────────────────────────────────────────────────────────
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  thread_type text not null check (thread_type in ('client', 'team')),
  thread_id text not null,
  sender text not null check (sender in ('owner', 'client', 'team')),
  body text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

-- Owner: full access to every thread on their own business.
create policy "Owner reads own threads" on messages
  for select using (owner_id = auth.uid());
create policy "Owner writes own threads" on messages
  for insert with check (owner_id = auth.uid() and sender = 'owner');

-- Client portal: only their own thread.
create policy "Client reads own thread" on messages
  for select using (
    thread_type = 'client' and exists (
      select 1 from clients c
      where c.owner_id = messages.owner_id and c.id = messages.thread_id and c.auth_user_id = auth.uid()
    )
  );
create policy "Client writes own thread" on messages
  for insert with check (
    thread_type = 'client' and sender = 'client' and exists (
      select 1 from clients c
      where c.owner_id = messages.owner_id and c.id = messages.thread_id and c.auth_user_id = auth.uid()
    )
  );

-- Team portal: only their own thread.
create policy "Team reads own thread" on messages
  for select using (
    thread_type = 'team' and exists (
      select 1 from team_members t
      where t.owner_id = messages.owner_id and t.id = messages.thread_id and t.auth_user_id = auth.uid()
    )
  );
create policy "Team writes own thread" on messages
  for insert with check (
    thread_type = 'team' and sender = 'team' and exists (
      select 1 from team_members t
      where t.owner_id = messages.owner_id and t.id = messages.thread_id and t.auth_user_id = auth.uid()
    )
  );

-- Live updates for the chat UI.
alter publication supabase_realtime add table messages;

-- ── claim function ──────────────────────────────────────────────────────
create or replace function claim_portal_identity()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  my_email text := (select email from auth.users where id = auth.uid());
begin
  if my_email is null then
    return;
  end if;

  update clients set auth_user_id = auth.uid()
    where lower(email) = lower(my_email) and auth_user_id is null;

  update team_members set auth_user_id = auth.uid()
    where lower(email) = lower(my_email) and auth_user_id is null;
end;
$$;

revoke all on function claim_portal_identity() from public;
grant execute on function claim_portal_identity() to authenticated;
