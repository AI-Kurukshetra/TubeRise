# Phase 7 — ROI Tracking & Video Submission

**Status:** 🔜
**Depends on:** Phase 6 (campaigns and invitations must exist)

---

## Goal
This phase closes the campaign loop. Creators submit a YouTube video URL against an accepted invitation. The platform calculates and displays ROI metrics (CPV, engagement rate, cost per engagement) for the brand. This is TubeRise's key differentiator — making campaign ROI transparent and measurable.

---

## Existing Code to Use

### `src/app/(dashboard)/dashboard/invitations/page.tsx` (Phase 4)
After accepting an invitation, creators need a "Submit Video" button that takes them to the submission flow. Add this button to accepted invitations only.

### `src/app/(dashboard)/dashboard/campaigns/[id]/page.tsx` (Phase 6)
"Submitted Videos" section is already stubbed. Phase 7 adds the real data and ROI cards.

---

## New Files

### `src/app/(dashboard)/dashboard/invitations/[id]/submit/page.tsx`
Creator video submission page.

```tsx
export const metadata = { title: 'Submit Video | TubeRise' }
```

Route param: `id` = invitation ID.

**Guard:** Fetch the invitation, verify `creator_user_id === user.id` and `status === 'accepted'`. If not → `notFound()`.

Also fetch the campaign for context (title, brand, deadline, deliverables).

Renders `<VideoSubmissionForm invitationId={id} campaignId={campaign.id} />`.

---

### `src/components/dashboard/creator/VideoSubmissionForm.tsx`
**`'use client'`**

Fields:
| Field | Type | Notes |
|---|---|---|
| YouTube Video URL | text input | must match `youtube.com/watch?v=` or `youtu.be/` |
| Video Title | text input | pre-fill if URL parsed |
| Thumbnail URL | text input | optional, YouTube's default thumbnail pattern |
| Views | number | creator self-reports for demo |
| Likes | number | creator self-reports for demo |
| Comments | number | creator self-reports for demo |

> **Demo note:** In Phase 8 (real OAuth), these metrics are fetched automatically from YouTube Data API. For the demo, creator enters them manually.

On submit → calls `submitVideo()` server action → redirects to `/dashboard/invitations`.

---

### `src/app/(dashboard)/dashboard/invitations/actions.ts` — add `submitVideo`
Add to the existing actions file (alongside `respondToInvitation` from Phase 4):

```ts
export async function submitVideo(
  invitationId: string,
  campaignId: string,
  data: {
    videoUrl: string
    title: string
    thumbnailUrl: string
    views: number
    likes: number
    comments: number
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const engagementRate = data.views > 0
    ? Number((((data.likes + data.comments) / data.views) * 100).toFixed(2))
    : 0

  // Extract video_id from URL
  const url = new URL(data.videoUrl)
  const videoId = url.searchParams.get('v') ?? url.pathname.replace('/', '')

  await supabase.from('campaign_videos').insert({
    campaign_id:     campaignId,
    invitation_id:   invitationId,
    creator_user_id: user.id,
    video_id:        videoId,
    video_url:       data.videoUrl,
    title:           data.title,
    thumbnail_url:   data.thumbnailUrl,
    views:           data.views,
    likes:           data.likes,
    comments:        data.comments,
    engagement_rate: engagementRate,
  })

  revalidatePath('/dashboard/invitations')
  revalidatePath(`/dashboard/campaigns/${campaignId}`)
  redirect('/dashboard/invitations')
}
```

---

### `src/components/dashboard/brand/CampaignROI.tsx`
ROI summary component — used on `/dashboard/campaigns/[id]` page.

**Props:**
```ts
interface CampaignROIProps {
  budget: number
  videos: Array<{
    views: number
    likes: number
    comments: number
    engagement_rate: number
    title: string
    thumbnail_url: string
    creator_profiles: { channel_name: string }
  }>
}
```

**Calculations:**
```ts
const totalViews       = videos.reduce((s, v) => s + v.views, 0)
const totalEngagements = videos.reduce((s, v) => s + v.likes + v.comments, 0)
const avgEngagement    = videos.reduce((s, v) => s + v.engagement_rate, 0) / videos.length
const cpv              = totalViews > 0 ? budget / totalViews : 0           // Cost per view
const cpe              = totalEngagements > 0 ? budget / totalEngagements : 0  // Cost per engagement
```

**Renders four ROI cards:**
| Card | Value | Format |
|---|---|---|
| Total Reach | `totalViews` | `"245K views"` |
| Avg Engagement Rate | `avgEngagement` | `"5.4%"` |
| Cost Per View | `cpv` | `"$0.018"` |
| Cost Per Engagement | `cpe` | `"$0.42"` |

Card style: accent border-top (blue) to visually distinguish from regular stat cards.

---

### `src/components/dashboard/brand/SubmittedVideosTable.tsx`
Table of submitted campaign videos for the brand.

Columns:
- Thumbnail (48×27 img)
- Title + creator channel name
- Views (formatted K)
- Likes / Comments
- Engagement %
- Submitted date

Reuses the same `<table>` markup pattern as `TopVideosTable` from Phase 4.

---

## Modified Files

### `src/app/(dashboard)/dashboard/campaigns/[id]/page.tsx`
Add two new sections below the invitations table:

1. **ROI Summary** — renders `<CampaignROI budget={campaign.budget} videos={submittedVideos} />` if any videos exist
2. **Submitted Videos** — renders `<SubmittedVideosTable videos={submittedVideos} />`

**Additional data fetch needed:**
```ts
const { data: submittedVideos } = await supabase
  .from('campaign_videos')
  .select(`
    id, title, thumbnail_url, views, likes, comments, engagement_rate, submitted_at,
    creator_profiles!campaign_videos_creator_user_id_fkey(channel_name, channel_handle)
  `)
  .eq('campaign_id', campaignId)
  .order('submitted_at', { ascending: false })
```

### `src/app/(dashboard)/dashboard/invitations/page.tsx`
Add "Submit Video →" button to invitations where `status === 'accepted'`:

```tsx
{invitation.status === 'accepted' && (
  <Link href={`/dashboard/invitations/${invitation.id}/submit`}>
    Submit Video →
  </Link>
)}
```

---

## ROI Metrics — Reference

| Metric | Formula | Good benchmark |
|---|---|---|
| CPV (Cost Per View) | `budget ÷ total_views` | < $0.05 |
| CPE (Cost Per Engagement) | `budget ÷ (likes + comments)` | < $1.00 |
| Avg Engagement Rate | `avg(likes + comments / views × 100)` | > 4% = good |
| Total Reach | `sum(views)` | higher = better |

These are displayed with color hints:
- Green: metric is above/below threshold (good)
- Red: metric outside good range
- Gray: not enough data yet

---

## New Files Summary

| File | Description |
|---|---|
| `src/app/(dashboard)/dashboard/invitations/[id]/submit/page.tsx` | Video submission page |
| `src/components/dashboard/creator/VideoSubmissionForm.tsx` | Video submission form |
| `src/components/dashboard/brand/CampaignROI.tsx` | ROI metric cards |
| `src/components/dashboard/brand/SubmittedVideosTable.tsx` | Submitted videos table |

## Modified Files Summary

| File | Change |
|---|---|
| `src/app/(dashboard)/dashboard/invitations/actions.ts` | Add `submitVideo()` server action |
| `src/app/(dashboard)/dashboard/campaigns/[id]/page.tsx` | Add ROI + submitted videos sections |
| `src/app/(dashboard)/dashboard/invitations/page.tsx` | Add "Submit Video" button on accepted invitations |

---

## Definition of Done
- [ ] Creator can submit a video from an accepted invitation
- [ ] `campaign_videos` row inserted with engagement_rate calculated server-side
- [ ] Brand sees submitted videos on campaign detail page
- [ ] CampaignROI component shows CPV, CPE, avg engagement, total reach
- [ ] Color hints applied to ROI cards (green/red/gray)
- [ ] Seed campaign videos (from Phase 3) visible in brand view
- [ ] "Submit Video" button only appears for accepted invitations
