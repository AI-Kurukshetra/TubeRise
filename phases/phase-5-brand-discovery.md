# Phase 5 — Brand Discovery (Creator Search)

**Status:** 🔜
**Depends on:** Phase 4 (role-aware layout and sidebar must be in place)

---

## Goal
Give brand users the ability to discover, filter, and view creator profiles. This is the core "marketplace" feature — brands browse creators by niche and stats, then visit individual creator public profiles to see channel metrics and top videos.

---

## Existing Code to Modify

### `src/components/layout/Sidebar.tsx`
**Current state after Phase 4:** Renders creator-specific nav when `role === 'creator'`. No brand nav items yet.

**Add brand nav block:**
```tsx
// Brand nav items (render when role === 'brand')
{ label: 'Discover',   href: '/dashboard/discover' }
{ label: 'Campaigns',  href: '/dashboard/campaigns' }
```

Full conditional in the nav render:
```tsx
{role === 'creator' && creatorNavItems.map(...)}
{role === 'brand'   && brandNavItems.map(...)}
```

Keep shared items (Dashboard, Profile, Settings) always visible.

### `src/app/(dashboard)/dashboard/page.tsx`
**Current state after Phase 4:** Branches on `role === 'creator'` → `<CreatorDashboard>`, else generic fallback.

**Add:** When `role === 'brand'` → render `<BrandDashboard userId={user.id} />`.

`<BrandDashboard>` shows:
- Summary cards: Active Campaigns, Total Invitations Sent, Pending Responses, Accepted
- Quick link: "Browse Creators →" pointing to `/dashboard/discover`

---

## New Files

### `src/app/(dashboard)/dashboard/discover/page.tsx`
**Server component.** Creator discovery page for brand users.

```tsx
export const metadata = { title: 'Discover Creators | TubeRise' }
```

**Filtering via URL search params:**
```ts
// URL: /dashboard/discover?niche=tech_gaming&min_subs=50000
const niche    = searchParams.niche    ?? null
const minSubs  = Number(searchParams.min_subs ?? 0)
const maxSubs  = Number(searchParams.max_subs ?? 999_000_000)
const minEng   = Number(searchParams.min_eng  ?? 0)
```

**Data fetch:**
```ts
let query = supabase
  .from('creator_profiles')
  .select('id, user_id, channel_name, channel_handle, channel_avatar_url, subscribers, avg_views, avg_engagement_rate, niche, location')
  .eq('is_public', true)
  .gte('subscribers', minSubs)
  .lte('subscribers', maxSubs)
  .gte('avg_engagement_rate', minEng)
  .order('subscribers', { ascending: false })

if (niche) query = query.contains('niche', [niche])

const { data: creators } = await query.limit(20)
```

**Renders:**
- `<DiscoverFilters />` — filter bar (client component with form)
- `<CreatorGrid creators={creators} />`

---

### `src/components/dashboard/brand/DiscoverFilters.tsx`
**`'use client'`** — handles form state and URL push.

Filter inputs:
- Niche dropdown: All / tech_gaming / fitness_health / beauty_fashion / finance_business
- Min subscribers: select (10K / 50K / 100K / 500K)
- Min engagement rate: select (0% / 3% / 5% / 7%)

On change, calls `router.push('/dashboard/discover?' + params.toString())`.

---

### `src/components/dashboard/brand/CreatorGrid.tsx`
Server-safe. Renders a responsive grid of `<CreatorCard>` components.

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {creators.map((c) => <CreatorCard key={c.id} creator={c} />)}
</div>
```

If `creators.length === 0`:
```tsx
<div className="text-center py-16">
  <p className="text-gray-500">No creators match your filters.</p>
</div>
```

---

### `src/components/dashboard/brand/CreatorCard.tsx`
Links to `/dashboard/creators/[userId]`.

Shows:
- Avatar (fallback: colored initials if no `channel_avatar_url`)
- Channel name + handle
- Niche badges (pill per niche tag)
- Three stat chips: Subscribers / Avg Views / Eng %
- "View Profile →" link button

Style matches existing card convention:
```tsx
className="bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 transition-colors"
```

---

### `src/app/(dashboard)/dashboard/creators/[userId]/page.tsx`
**Public creator profile** as seen by a brand.

```tsx
export const metadata = { title: 'Creator Profile | TubeRise' }
```

Route param: `userId` (the creator's auth user ID).

**Data fetches:**
```ts
// Creator profile
const { data: creator } = await supabase
  .from('creator_profiles')
  .select('*')
  .eq('user_id', userId)
  .eq('is_public', true)
  .single()

// Top videos
const { data: videos } = await supabase
  .from('video_snapshots')
  .select('title, thumbnail_url, views, likes, comments, engagement_rate, published_at')
  .eq('user_id', userId)
  .order('views', { ascending: false })
  .limit(6)

// 30-day analytics
const { data: snapshots } = await supabase
  .from('analytics_snapshots')
  .select('snapshot_date, subscribers, total_views')
  .eq('user_id', userId)
  .order('snapshot_date', { ascending: true })
  .limit(30)
```

If `creator` is null (not found or not public) → `notFound()` from `next/navigation`.

**Renders:**
- Profile header: avatar, channel name, handle, bio, location, niche badges
- Stat row: Subscribers / Avg Views / Engagement % / Total Videos
- `<AnalyticsChart snapshots={snapshots} />` (reuse from Phase 4 — imported from `@/components/dashboard/creator/AnalyticsChart`)
- `<TopVideosTable videos={videos} />` (reuse from Phase 4)
- "Invite to Campaign" button → opens `<InviteModal>` (Phase 6)

---

### `src/components/dashboard/brand/BrandDashboard.tsx`
Server component. Summary cards for brand users on the main `/dashboard` page.

**Data fetch:**
```ts
// Count campaigns by brand
const { count: campaignCount } = await supabase
  .from('campaigns')
  .select('*', { count: 'exact', head: true })
  .eq('brand_user_id', userId)

// Count invitations
const { count: invitedCount } = await supabase
  .from('campaign_invitations')
  .select('*', { count: 'exact', head: true })
  .eq('campaigns.brand_user_id', userId)  // via join or RPC
```

Four stat cards: Active Campaigns / Invitations Sent / Pending / Accepted.

Plus a CTA card: "Find Creators" → `/dashboard/discover`.

---

## No New Packages Required
All components use only existing dependencies (Next.js, Supabase, Tailwind). `recharts` imported from Phase 4 for the analytics chart reuse.

---

## New Files Summary

| File | Description |
|---|---|
| `src/app/(dashboard)/dashboard/discover/page.tsx` | Creator discovery listing |
| `src/components/dashboard/brand/DiscoverFilters.tsx` | Filter bar (client component) |
| `src/components/dashboard/brand/CreatorGrid.tsx` | Grid wrapper |
| `src/components/dashboard/brand/CreatorCard.tsx` | Single creator card |
| `src/app/(dashboard)/dashboard/creators/[userId]/page.tsx` | Creator public profile |
| `src/components/dashboard/brand/BrandDashboard.tsx` | Brand home dashboard |

## Modified Files Summary

| File | Change |
|---|---|
| `src/components/layout/Sidebar.tsx` | Add brand nav items (Discover, Campaigns) |
| `src/app/(dashboard)/dashboard/page.tsx` | Add `role === 'brand'` branch → `<BrandDashboard>` |

---

## Definition of Done
- [ ] Brand users see BrandDashboard on `/dashboard`
- [ ] `/dashboard/discover` lists creator cards from `creator_profiles` seed data
- [ ] Niche / subscriber / engagement filters work via URL params
- [ ] Creator cards show avatar, stats, niche badges
- [ ] `/dashboard/creators/[userId]` shows full creator profile with chart + videos
- [ ] "View Profile" links navigate correctly
- [ ] Sidebar shows Discover and Campaigns links for brand role
