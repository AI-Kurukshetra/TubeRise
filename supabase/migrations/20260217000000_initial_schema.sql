-- ============================================================
-- TubeRise -- Full Schema Migration
-- Phase 2: profiles | Phase 3: 8 tables + RLS
-- ============================================================

-- 0. profiles (Phase 2)
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('creator', 'brand')),
  display_name  text,
  avatar_url    text,
  created_at    timestamptz default now()
);
alter table profiles enable row level security;
drop policy if exists "Users manage own profile" on profiles;
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);

-- 1. creator_profiles
create table if not exists creator_profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid unique references profiles(id) on delete cascade,
  bio                 text,
  niche               text[],
  location            text,
  contact_email       text,
  is_public           boolean default true,
  channel_name        text,
  channel_handle      text,
  channel_avatar_url  text,
  subscribers         bigint default 0,
  avg_views           bigint default 0,
  avg_engagement_rate decimal(5,2) default 0,
  total_videos        int default 0,
  last_synced_at      timestamptz,
  created_at          timestamptz default now()
);
alter table creator_profiles enable row level security;
drop policy if exists "Public read" on creator_profiles;
drop policy if exists "Owner write" on creator_profiles;
create policy "Public read" on creator_profiles for select using (is_public = true);
create policy "Owner write" on creator_profiles for all using (auth.uid() = user_id);

-- 2. brand_profiles
create table if not exists brand_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references profiles(id) on delete cascade,
  company_name  text,
  website       text,
  niche         text,
  description   text,
  created_at    timestamptz default now()
);
alter table brand_profiles enable row level security;
drop policy if exists "Auth read" on brand_profiles;
drop policy if exists "Owner write" on brand_profiles;
create policy "Auth read" on brand_profiles for select to authenticated using (true);
create policy "Owner write" on brand_profiles for all using (auth.uid() = user_id);

-- 3. social_accounts
create table if not exists social_accounts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  platform          text default 'youtube',
  platform_user_id  text,
  channel_name      text,
  channel_handle    text,
  avatar_url        text,
  access_token      text,
  refresh_token     text,
  token_expires_at  timestamptz,
  connected_at      timestamptz default now(),
  last_synced_at    timestamptz
);
alter table social_accounts enable row level security;
drop policy if exists "Owner only" on social_accounts;
create policy "Owner only" on social_accounts for all using (auth.uid() = user_id);

-- 4. analytics_snapshots
create table if not exists analytics_snapshots (
  id                  uuid primary key default gen_random_uuid(),
  account_id          uuid references social_accounts(id) on delete cascade,
  user_id             uuid references profiles(id) on delete cascade,
  snapshot_date       date not null,
  subscribers         bigint default 0,
  total_views         bigint default 0,
  video_count         int default 0,
  avg_engagement_rate decimal(5,2) default 0,
  raw_data            jsonb,
  created_at          timestamptz default now(),
  unique(account_id, snapshot_date)
);
alter table analytics_snapshots enable row level security;
drop policy if exists "Owner only" on analytics_snapshots;
create policy "Owner only" on analytics_snapshots for all using (auth.uid() = user_id);

-- 5. video_snapshots
create table if not exists video_snapshots (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid references social_accounts(id) on delete cascade,
  user_id         uuid references profiles(id) on delete cascade,
  video_id        text not null,
  title           text,
  thumbnail_url   text,
  published_at    timestamptz,
  views           bigint default 0,
  likes           bigint default 0,
  comments        bigint default 0,
  duration        text,
  engagement_rate decimal(5,2) default 0,
  synced_at       timestamptz default now(),
  unique(account_id, video_id)
);
alter table video_snapshots enable row level security;
drop policy if exists "Owner only" on video_snapshots;
create policy "Owner only" on video_snapshots for all using (auth.uid() = user_id);

-- 6. campaigns
create table if not exists campaigns (
  id            uuid primary key default gen_random_uuid(),
  brand_user_id uuid references profiles(id) on delete cascade,
  title         text not null,
  description   text,
  niche         text,
  budget        decimal(10,2),
  deliverables  text,
  deadline      date,
  status        text default 'active' check (status in ('draft','active','completed')),
  created_at    timestamptz default now()
);
alter table campaigns enable row level security;
drop policy if exists "Owner write" on campaigns;
drop policy if exists "Invited creator read" on campaigns;
create policy "Owner write" on campaigns for all using (auth.uid() = brand_user_id);
-- "Invited creator read" added after campaign_invitations is created below

-- 7. campaign_invitations
create table if not exists campaign_invitations (
  id               uuid primary key default gen_random_uuid(),
  campaign_id      uuid references campaigns(id) on delete cascade,
  creator_user_id  uuid references profiles(id) on delete cascade,
  status           text default 'pending' check (status in ('pending','accepted','declined')),
  message          text,
  invited_at       timestamptz default now(),
  responded_at     timestamptz,
  unique(campaign_id, creator_user_id)
);
alter table campaign_invitations enable row level security;
drop policy if exists "Brand write" on campaign_invitations;
drop policy if exists "Creator read" on campaign_invitations;
drop policy if exists "Creator update" on campaign_invitations;
create policy "Brand write" on campaign_invitations for all using (
  exists (select 1 from campaigns where id = campaign_id and brand_user_id = auth.uid())
);
create policy "Creator read" on campaign_invitations for select using (auth.uid() = creator_user_id);
create policy "Creator update" on campaign_invitations for update using (auth.uid() = creator_user_id);

-- campaigns "Invited creator read" policy (deferred until campaign_invitations exists)
create policy "Invited creator read" on campaigns for select using (
  exists (select 1 from campaign_invitations where campaign_id = campaigns.id and creator_user_id = auth.uid())
);

-- 8. campaign_videos
create table if not exists campaign_videos (
  id               uuid primary key default gen_random_uuid(),
  campaign_id      uuid references campaigns(id) on delete cascade,
  invitation_id    uuid references campaign_invitations(id),
  creator_user_id  uuid references profiles(id) on delete cascade,
  video_id         text,
  video_url        text,
  title            text,
  thumbnail_url    text,
  views            bigint default 0,
  likes            bigint default 0,
  comments         bigint default 0,
  engagement_rate  decimal(5,2) default 0,
  submitted_at     timestamptz default now()
);
alter table campaign_videos enable row level security;
drop policy if exists "Creator write" on campaign_videos;
drop policy if exists "Brand read" on campaign_videos;
create policy "Creator write" on campaign_videos for all using (auth.uid() = creator_user_id);
create policy "Brand read" on campaign_videos for select using (
  exists (select 1 from campaigns where id = campaign_id and brand_user_id = auth.uid())
);

select 'Migration complete -- 9 tables created with RLS' as status;
