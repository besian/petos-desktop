-- PetOS Desktop — read receipts (run after migration-002-chat.sql)
--
-- Adds a read_at timestamp to messages, plus the UPDATE policies each
-- side needs to mark the other's messages as read.

alter table messages add column if not exists read_at timestamptz;

create policy "Owner updates own threads" on messages
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Client marks own thread read" on messages
  for update using (
    thread_type = 'client' and exists (
      select 1 from clients c
      where c.owner_id = messages.owner_id and c.id = messages.thread_id and c.auth_user_id = auth.uid()
    )
  ) with check (
    thread_type = 'client' and exists (
      select 1 from clients c
      where c.owner_id = messages.owner_id and c.id = messages.thread_id and c.auth_user_id = auth.uid()
    )
  );

create policy "Team marks own thread read" on messages
  for update using (
    thread_type = 'team' and exists (
      select 1 from team_members t
      where t.owner_id = messages.owner_id and t.id = messages.thread_id and t.auth_user_id = auth.uid()
    )
  ) with check (
    thread_type = 'team' and exists (
      select 1 from team_members t
      where t.owner_id = messages.owner_id and t.id = messages.thread_id and t.auth_user_id = auth.uid()
    )
  );
