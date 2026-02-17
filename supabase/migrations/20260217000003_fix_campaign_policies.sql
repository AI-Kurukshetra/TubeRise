-- Fix RLS recursion on campaigns by removing cross-table policy dependency

-- campaigns
alter table campaigns enable row level security;
drop policy if exists "Invited creator read" on campaigns;
drop policy if exists "Owner write" on campaigns;

create policy "Brand write" on campaigns
  for all using (auth.uid() = brand_user_id)
  with check (auth.uid() = brand_user_id);

create policy "Authenticated read" on campaigns
  for select to authenticated using (true);
