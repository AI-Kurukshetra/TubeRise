# Phase 3 — Database + Seed Data

**Status:** 🔜
**Depends on:** Phase 2

---

## Goal
Create all remaining Supabase tables with RLS policies. Populate the database with realistic mock data so every page looks live during the demo — before real YouTube OAuth is connected.

---

## Tables to Create (Run in Supabase SQL Editor)

> `profiles` table is created in Phase 2. The 8 tables below are new.

```sql
-- 1. Creator public profile (one per creator user)
create table creator_profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid unique references profiles(id) on delete cascade,
  bio                 text,
  niche               text[],  -- e.g. '{tech_gaming,fitness_health}'
  location            text,
  contact_email       text,
  is_public           boolean default true,
  -- Denormalised from YouTube sync (fast discovery queries)
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

-- 2. Brand profile (one per brand user)
create table brand_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references profiles(id) on delete cascade,
  company_name  text,
  website       text,
  niche         text,
  description   text,
  created_at    timestamptz default now()
);

-- 3. YouTube OAuth tokens
create table social_accounts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  platform          text default 'youtube',
  platform_user_id  text,
  channel_name      text,
  channel_handle    text,
  avatar_url        text,
  access_token      text,   -- encrypted in production
  refresh_token     text,   -- encrypted in production
  token_expires_at  timestamptz,
  connected_at      timestamptz default now(),
  last_synced_at    timestamptz
);

-- 4. Daily channel metrics cache
create table analytics_snapshots (
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

-- 5. Per-video metrics cache
create table video_snapshots (
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

-- 6. Brand campaigns
create table campaigns (
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

-- 7. Campaign invitations (brand → creator)
create table campaign_invitations (
  id               uuid primary key default gen_random_uuid(),
  campaign_id      uuid references campaigns(id) on delete cascade,
  creator_user_id  uuid references profiles(id) on delete cascade,
  status           text default 'pending' check (status in ('pending','accepted','declined')),
  message          text,
  invited_at       timestamptz default now(),
  responded_at     timestamptz,
  unique(campaign_id, creator_user_id)
);

-- 8. Campaign submitted videos (creator → campaign)
create table campaign_videos (
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
```

---

## RLS Policies

```sql
-- creator_profiles
alter table creator_profiles enable row level security;
create policy "Public read" on creator_profiles for select using (is_public = true);
create policy "Owner write" on creator_profiles for all using (auth.uid() = user_id);

-- brand_profiles
alter table brand_profiles enable row level security;
create policy "Auth read" on brand_profiles for select to authenticated using (true);
create policy "Owner write" on brand_profiles for all using (auth.uid() = user_id);

-- social_accounts
alter table social_accounts enable row level security;
create policy "Owner only" on social_accounts for all using (auth.uid() = user_id);

-- analytics_snapshots
alter table analytics_snapshots enable row level security;
create policy "Owner only" on analytics_snapshots for all using (auth.uid() = user_id);

-- video_snapshots
alter table video_snapshots enable row level security;
create policy "Owner only" on video_snapshots for all using (auth.uid() = user_id);

-- campaigns
alter table campaigns enable row level security;
create policy "Owner write" on campaigns for all using (auth.uid() = brand_user_id);
create policy "Invited creator read" on campaigns for select using (
  exists (select 1 from campaign_invitations where campaign_id = campaigns.id and creator_user_id = auth.uid())
);

-- campaign_invitations
alter table campaign_invitations enable row level security;
create policy "Brand write" on campaign_invitations for all using (
  exists (select 1 from campaigns where id = campaign_id and brand_user_id = auth.uid())
);
create policy "Creator read" on campaign_invitations for select using (auth.uid() = creator_user_id);
create policy "Creator update" on campaign_invitations for update using (auth.uid() = creator_user_id);

-- campaign_videos
alter table campaign_videos enable row level security;
create policy "Creator write" on campaign_videos for all using (auth.uid() = creator_user_id);
create policy "Brand read" on campaign_videos for select using (
  exists (select 1 from campaigns where id = campaign_id and brand_user_id = auth.uid())
);
```

---

## Seed Data

**File:** `scripts/seed.ts`
Uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS).

### 10 Creator Accounts
| Handle | Niche | Subs | Avg Views | Eng % |
|---|---|---|---|---|
| @TechWithAlex | tech_gaming | 124K | 45K | 4.2 |
| @FitLifeSarah | fitness_health | 89K | 32K | 6.1 |
| @GlowWithMia | beauty_fashion | 210K | 78K | 5.8 |
| @WealthBuilderJay | finance_business | 56K | 18K | 3.9 |
| @GameZoneKai | tech_gaming | 445K | 120K | 7.3 |
| @RunWithRena | fitness_health | 34K | 12K | 5.4 |
| @StyleByZoe | beauty_fashion | 178K | 62K | 6.7 |
| @CryptoWithDan | finance_business | 92K | 28K | 4.5 |
| @PixelPro | tech_gaming | 67K | 22K | 5.1 |
| @NutritionNadia | fitness_health | 115K | 38K | 5.9 |

### 3 Brand Accounts
| Company | Niche | Budget |
|---|---|---|
| NovaTech | tech_gaming | $5,000 |
| PureGlow Skincare | beauty_fashion | $8,000 |
| FinEdge App | finance_business | $3,000 |

### 3 Campaigns + Invitations + Submitted Videos
| Campaign | Brand | Status | Invited | Accepted | Submitted |
|---|---|---|---|---|---|
| Q1 Product Launch | NovaTech | active | 4 | 2 | 2 |
| Spring Glow | PureGlow | active | 3 | 2 | 1 |
| Invest Smarter | FinEdge | completed | 2 | 2 | 2 |

### Analytics Snapshots
- 30 days of daily data per creator (for line chart in Phase 4)

### Video Snapshots
- 6 videos per creator with realistic metrics

---

## New Files

| File | Description |
|---|---|
| `scripts/seed.ts` | Inserts all mock data via service role |
| `scripts/tsconfig.json` | TypeScript config for scripts folder |

## Env Vars to Add
```
SUPABASE_SERVICE_ROLE_KEY=   ← for seed script only, never expose to browser
```

## Run Seed
```bash
npx ts-node scripts/seed.ts
```

---

## Definition of Done
- [ ] All 8 new tables created in Supabase (plus `profiles` from Phase 2 = 9 total)
- [ ] RLS enabled on all 9 tables
- [ ] Seed runs without errors
- [ ] 10 creator rows in `creator_profiles` with channel stats
- [ ] 3 brand rows in `brand_profiles`
- [ ] 3 campaigns, invitations, and submitted videos present
- [ ] 30 days of analytics snapshots per creator
- [ ] 6 video snapshots per creator
