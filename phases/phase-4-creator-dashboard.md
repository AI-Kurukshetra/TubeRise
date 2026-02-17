# Phase 4 — Creator Dashboard

**Status:** 🔜
**Depends on:** Phase 3 (seed data must be present)

---

## Goal
Replace the generic placeholder dashboard with a creator-specific experience. Creators see their channel stats, a 30-day subscriber/views trend chart, their top videos, and their YouTube account connection status — all powered by the seed data from Phase 3.

---

## Existing Code to Modify

### `src/app/(dashboard)/dashboard/page.tsx`
**Current state:** Generic placeholder with four hardcoded stat cards ("Total Users", "Active Today", "Revenue", "Conversion") and an empty "Recent Activity" panel.

**Replace entirely** with a server component that:
1. Reads `user.id` from `supabase.auth.getUser()`
2. Reads `role` from `profiles` table (added in Phase 2)
3. If `role === 'creator'` → renders `<CreatorDashboard userId={user.id} />`
4. If `role === 'brand'` → renders `<BrandDashboard userId={user.id} />` (Phase 5 adds this)
5. Falls back to a "Set up your account" prompt if no role

### `src/app/(dashboard)/loading.tsx`
**Current state:** Skeleton with 2 sidebar items, 4 stat cards, 1 content block.

**Update to match creator dashboard layout:**
- 4 stat card skeletons (unchanged count)
- 1 tall chart area skeleton (~h-64)
- 1 videos table skeleton (5 rows)

### `src/components/layout/Sidebar.tsx`
**Current state:** Static navItems array — Dashboard, Settings, Profile. No role awareness.

**Add role-aware nav items.** Pass `role` prop alongside `email`:

```tsx
// Creator nav additions
{ label: 'Analytics',    href: '/dashboard/analytics' }
{ label: 'My Videos',    href: '/dashboard/videos' }
{ label: 'Connect',      href: '/dashboard/connect' }
{ label: 'Invitations',  href: '/dashboard/invitations' }
```

Only render these when `role === 'creator'`. Brand nav comes in Phase 5.

### `src/app/(dashboard)/layout.tsx`
**Current state:** Fetches `user` from `supabase.auth.getUser()`, passes `email` to Sidebar.

**Add:** fetch `profile.role` from `profiles` table and pass as `role` prop to `<Sidebar>`.

```tsx
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

// Then:
<Sidebar email={user?.email} role={profile?.role} />
```

---

## New Files

### `src/components/dashboard/creator/CreatorDashboard.tsx`
Server component. Receives `userId: string`.

**Data fetches:**
```ts
// 1. Creator profile (channel stats)
const { data: creatorProfile } = await supabase
  .from('creator_profiles')
  .select('channel_name, channel_handle, subscribers, avg_views, avg_engagement_rate, total_videos')
  .eq('user_id', userId)
  .single()

// 2. Last 30 analytics snapshots (for chart)
const { data: snapshots } = await supabase
  .from('analytics_snapshots')
  .select('snapshot_date, subscribers, total_views, avg_engagement_rate')
  .eq('user_id', userId)
  .order('snapshot_date', { ascending: true })
  .limit(30)

// 3. Top 6 videos by views
const { data: videos } = await supabase
  .from('video_snapshots')
  .select('title, thumbnail_url, views, likes, comments, engagement_rate, published_at')
  .eq('user_id', userId)
  .order('views', { ascending: false })
  .limit(6)
```

**Renders:**
- `<StatCards>` — 4 cards: Subscribers, Avg Views, Engagement Rate, Total Videos
- `<AnalyticsChart snapshots={snapshots} />` — line chart (client component)
- `<TopVideosTable videos={videos} />`

---

### `src/components/dashboard/creator/StatCards.tsx`
Client or server component. Accepts `{ subscribers, avgViews, engagementRate, totalVideos }`.

Four cards matching the existing white-card style:
```tsx
className="bg-white rounded-xl border border-gray-100 p-5"
```

Format numbers: `124000 → "124K"`, `4.2 → "4.2%"`.

---

### `src/components/dashboard/creator/AnalyticsChart.tsx`
**`'use client'`** — requires browser API.

Uses `recharts` (install: `npm install recharts`).

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
```

Displays two lines: Subscribers (blue) + Total Views (gray). X-axis: date label (`Jan 18`). Tooltip shows exact values.

```tsx
<ResponsiveContainer width="100%" height={240}>
  <LineChart data={snapshots}>
    <XAxis dataKey="snapshot_date" tickFormatter={(d) => formatDate(d)} />
    <YAxis tickFormatter={(v) => formatK(v)} />
    <Tooltip />
    <Line type="monotone" dataKey="subscribers" stroke="#2563eb" dot={false} />
    <Line type="monotone" dataKey="total_views" stroke="#9ca3af" dot={false} />
  </LineChart>
</ResponsiveContainer>
```

---

### `src/components/dashboard/creator/TopVideosTable.tsx`
Server-safe. Renders an `<table>` of top videos with columns:
- Thumbnail (32×18 `<img>` from `thumbnail_url`)
- Title
- Views (formatted K)
- Likes
- Comments
- Engagement %

---

### `src/app/(dashboard)/dashboard/analytics/page.tsx`
Full-page analytics view. Fetches all 30 snapshots and renders the `<AnalyticsChart>` at full width plus a data table of all rows.

```tsx
export const metadata = { title: 'Analytics | TubeRise' }
```

---

### `src/app/(dashboard)/dashboard/videos/page.tsx`
Shows all video snapshots for the creator. Reuses `<TopVideosTable>` but with all 6 videos and additional columns (published_at, duration).

```tsx
export const metadata = { title: 'My Videos | TubeRise' }
```

---

### `src/app/(dashboard)/dashboard/connect/page.tsx`
YouTube account connection status page.

- If `social_accounts` row exists for user → shows "Connected" badge + channel info
- If not → shows a button "Connect YouTube" (non-functional in Phase 4 — real OAuth in Phase 8)
- Button href: `/api/auth/youtube` (stub route, returns 501 until Phase 8)

```tsx
export const metadata = { title: 'Connect YouTube | TubeRise' }
```

---

### `src/app/(dashboard)/dashboard/invitations/page.tsx`
Lists `campaign_invitations` for the creator.

```ts
const { data: invitations } = await supabase
  .from('campaign_invitations')
  .select('id, status, message, invited_at, campaigns(title, description, budget, deadline, brand_profiles(company_name))')
  .eq('creator_user_id', userId)
  .order('invited_at', { ascending: false })
```

Renders a list of invitation cards showing campaign name, brand, budget, deadline, and status badge (pending/accepted/declined). Accept/Decline buttons update status via a Server Action.

---

## Server Action (Invitations)

### `src/app/(dashboard)/dashboard/invitations/actions.ts`
```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function respondToInvitation(invitationId: string, status: 'accepted' | 'declined') {
  const supabase = await createClient()
  await supabase
    .from('campaign_invitations')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', invitationId)
  revalidatePath('/dashboard/invitations')
}
```

---

## Package to Install

```bash
npm install recharts
```

Only one new dependency. `recharts` is React-first, tree-shakeable, and works well with Next.js App Router.

---

## New Files Summary

| File | Description |
|---|---|
| `src/components/dashboard/creator/CreatorDashboard.tsx` | Root creator dashboard component |
| `src/components/dashboard/creator/StatCards.tsx` | 4-stat card grid |
| `src/components/dashboard/creator/AnalyticsChart.tsx` | Line chart (recharts, client) |
| `src/components/dashboard/creator/TopVideosTable.tsx` | Top videos table |
| `src/app/(dashboard)/dashboard/analytics/page.tsx` | Full analytics page |
| `src/app/(dashboard)/dashboard/videos/page.tsx` | All videos page |
| `src/app/(dashboard)/dashboard/connect/page.tsx` | YouTube connect status |
| `src/app/(dashboard)/dashboard/invitations/page.tsx` | Invitations list |
| `src/app/(dashboard)/dashboard/invitations/actions.ts` | Accept/decline server action |

## Modified Files Summary

| File | Change |
|---|---|
| `src/app/(dashboard)/dashboard/page.tsx` | Full rewrite — role-branching |
| `src/app/(dashboard)/loading.tsx` | Update skeleton to match new layout |
| `src/components/layout/Sidebar.tsx` | Add `role` prop + creator nav items |
| `src/app/(dashboard)/layout.tsx` | Fetch `role` from `profiles`, pass to Sidebar |

---

## Definition of Done
- [ ] Creator dashboard shows channel stats from `creator_profiles` seed data
- [ ] Analytics chart renders 30-day line with recharts
- [ ] Top 6 videos table populated from `video_snapshots`
- [ ] Sidebar shows creator-specific nav links when `role === 'creator'`
- [ ] Analytics page (`/dashboard/analytics`) loads full chart
- [ ] Videos page (`/dashboard/videos`) loads all video snapshots
- [ ] Connect page (`/dashboard/connect`) shows connection status
- [ ] Invitations page lists pending invitations from seed data
- [ ] Accept/Decline buttons update `campaign_invitations.status`
