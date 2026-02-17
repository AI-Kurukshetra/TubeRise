# Phase 8 — Landing Page, Polish & YouTube OAuth

**Status:** 🔜
**Depends on:** Phase 7 (all core product features complete)

---

## Goal
Ship a production-ready landing page branded as TubeRise. Replace all "AppName" placeholders. Wire up real YouTube OAuth so creators can connect their actual channel and sync live metrics. Final polish pass: metadata, OG images, accessibility, mobile responsiveness.

---

## Part A — Branding Finalisation

### All "AppName" Occurrences to Replace with "TubeRise"

| File | Line | Change |
|---|---|---|
| `src/app/layout.tsx` | metadata title | `"TubeRise"` |
| `src/app/layout.tsx` | metadata description | `"The YouTube influencer platform"` |
| `src/app/page.tsx` | nav logo span | `"TubeRise"` |
| `src/components/layout/Sidebar.tsx` | logo span | `"TubeRise"` |

> **Logo icon:** Replace the `"A"` initial in the blue square with a `"T"` or a YouTube-style play icon SVG. Keep the same `w-7 h-7 bg-blue-600 rounded-lg` container.

---

## Part B — Landing Page Rewrite

### `src/app/page.tsx` — Full Rewrite

**Current state:** Generic hero with "Build something amazing" copy, two CTA buttons, no features or social proof.

**New structure (5 sections):**

#### 1. Nav
```tsx
<nav> TubeRise logo | Features | How It Works | Pricing (link) | Sign In | Get Started </nav>
```

#### 2. Hero
```
Headline:  "The smarter way to run YouTube influencer campaigns"
Sub:       "TubeRise connects brands with verified YouTube creators. Track ROI in real-time — CPV, engagement rate, and reach — all in one dashboard."
CTAs:      [Get started free →]  [See how it works ↓]
Social proof: "Trusted by 10+ creators · 3 active campaigns · $16,000 in tracked budgets"
```
(Numbers pulled from seed data for the demo)

#### 3. Features Section
Three feature cards in a grid:

| Feature | Icon | Copy |
|---|---|---|
| Creator Discovery | Search icon | "Filter 10K+ YouTube creators by niche, subscriber count, and engagement rate." |
| Campaign Management | Clipboard icon | "Create campaigns, invite creators, and track deliverables — all from one place." |
| ROI Tracking | Chart icon | "See CPV, cost per engagement, and total reach per campaign video automatically." |

#### 4. How It Works
Numbered steps — two columns (Brand / Creator):

**For Brands:**
1. Post a campaign with your budget and niche
2. Browse creators and send invitations
3. Receive submitted videos and track ROI

**For Creators:**
1. Connect your YouTube channel
2. Receive campaign invitations from brands
3. Submit your video and see your analytics

#### 5. CTA Footer Banner
```
"Ready to grow?"
[Start as a Creator]  [Start as a Brand]
```
Both link to `/signup`.

---

## Part C — YouTube OAuth (Real Channel Connect)

### OAuth Flow Overview
```
Creator → /dashboard/connect → "Connect YouTube" →
→ /api/auth/youtube  (GET — redirects to Google OAuth consent)
→ Google OAuth consent screen
→ /api/auth/youtube/callback  (GET — exchanges code for tokens)
→ Fetch YouTube channel data
→ Upsert social_accounts + creator_profiles
→ Redirect → /dashboard (now shows real channel data)
```

### Environment Variables to Add
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/youtube/callback
YOUTUBE_API_KEY=        ← for public data fetching (optional if using OAuth)
```

> Store these in `.env.local` for development. Add to Vercel environment variables for production.

---

### `src/app/api/auth/youtube/route.ts`
Initiates OAuth. Redirects to Google's authorization endpoint.

```ts
import { NextResponse } from 'next/server'

export async function GET() {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID!,
    redirect_uri:  process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ].join(' '),
    access_type:   'offline',
    prompt:        'consent',
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  )
}
```

---

### `src/app/api/auth/youtube/callback/route.ts`
Exchanges the auth `code` for tokens, fetches channel data, stores in DB.

```ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  if (!code) return NextResponse.redirect('/dashboard/connect?error=no_code')

  // 1. Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI!,
      grant_type:    'authorization_code',
    }),
  })
  const tokens = await tokenRes.json()

  // 2. Fetch channel info from YouTube Data API
  const channelRes = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  )
  const channelData = await channelRes.json()
  const channel = channelData.items?.[0]
  if (!channel) return NextResponse.redirect('/dashboard/connect?error=no_channel')

  // 3. Upsert social_accounts
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('social_accounts').upsert({
    user_id:          user!.id,
    platform:         'youtube',
    platform_user_id: channel.id,
    channel_name:     channel.snippet.title,
    channel_handle:   channel.snippet.customUrl,
    avatar_url:       channel.snippet.thumbnails.default.url,
    access_token:     tokens.access_token,
    refresh_token:    tokens.refresh_token,
    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    last_synced_at:   new Date().toISOString(),
  }, { onConflict: 'user_id, platform' })

  // 4. Update creator_profiles with real channel stats
  const stats = channel.statistics
  await supabase.from('creator_profiles').upsert({
    user_id:            user!.id,
    channel_name:       channel.snippet.title,
    channel_handle:     channel.snippet.customUrl,
    channel_avatar_url: channel.snippet.thumbnails.default.url,
    subscribers:        Number(stats.subscriberCount),
    total_videos:       Number(stats.videoCount),
    last_synced_at:     new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return NextResponse.redirect('/dashboard')
}
```

> **Security note:** In production, encrypt `access_token` and `refresh_token` at rest before storing in Supabase. For the hackathon demo, plain text is acceptable.

---

## Part D — Metadata & SEO

### `src/app/layout.tsx`
Update root metadata:
```ts
export const metadata: Metadata = {
  title: {
    template: '%s | TubeRise',
    default:  'TubeRise — YouTube Influencer Platform',
  },
  description: 'Connect brands with YouTube creators. Track campaign ROI in real-time.',
  openGraph: {
    title:       'TubeRise',
    description: 'The smarter YouTube influencer platform',
    type:        'website',
  },
}
```

### Per-page titles (confirm all pages have these)
| Page | Title |
|---|---|
| Landing | `TubeRise — YouTube Influencer Platform` |
| Dashboard | `Dashboard \| TubeRise` |
| Analytics | `Analytics \| TubeRise` |
| Discover | `Discover Creators \| TubeRise` |
| Campaigns | `Campaigns \| TubeRise` |
| Profile | `Profile \| TubeRise` |

---

## Part E — Mobile Responsiveness Pass

### `src/components/layout/Sidebar.tsx`
Current sidebar is `w-60 h-screen sticky` — invisible on mobile.

Add a hamburger toggle for small screens:
```tsx
// Mobile: hidden sidebar + hamburger button in header
// Desktop: always-visible sidebar
```

Simplest implementation: `hidden md:flex` on sidebar, `md:hidden` hamburger button in Header.

### `src/components/layout/Header.tsx`
Add `onMenuClick` prop for mobile menu toggle (optional — can be deferred post-demo).

---

## Part F — Toast Position & Styling Finalisation

Flagged in `src/components/ui/Toaster.tsx` with `TODO (UI finalisation)` comment.

Current: bottom-right, basic styling.

Final: confirm position is appropriate, add slide-in animation.

```tsx
// Replace inline style with Tailwind animation class:
// Add to tailwind.config: animate-slide-in
// Or use: transition-all duration-300 translate-y-0
```

---

## New Files Summary

| File | Description |
|---|---|
| `src/app/api/auth/youtube/route.ts` | Initiates YouTube OAuth redirect |
| `src/app/api/auth/youtube/callback/route.ts` | Handles OAuth callback, stores tokens |

## Modified Files Summary

| File | Change |
|---|---|
| `src/app/page.tsx` | Full landing page rewrite (TubeRise branding, 5 sections) |
| `src/app/layout.tsx` | Update metadata: title, description, OG tags |
| `src/components/layout/Sidebar.tsx` | Replace "AppName"/"A" with "TubeRise"/"T", mobile responsive |
| `src/components/layout/Header.tsx` | Add mobile hamburger support |
| `src/components/ui/Toaster.tsx` | Finalise toast animation and position |
| `src/app/(dashboard)/dashboard/connect/page.tsx` | Wire up real OAuth button |

---

## Env Vars Checklist

```
# Phase 2 (already present)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Phase 3 (seed only)
SUPABASE_SERVICE_ROLE_KEY=

# Phase 8 (YouTube OAuth)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

---

## Definition of Done
- [ ] All "AppName" replaced with "TubeRise" throughout the codebase
- [ ] Landing page has hero, features, how-it-works, and dual CTA sections
- [ ] YouTube OAuth flow completes and updates `social_accounts` + `creator_profiles`
- [ ] Creator's real channel stats appear on dashboard after OAuth
- [ ] All pages have correct `<title>` metadata
- [ ] OG tags set on root layout
- [ ] Sidebar and dashboard responsive on mobile (at minimum: sidebar hidden on small screens)
- [ ] Toast notifications have final animation
- [ ] App ready to demo at `localhost:3000` with no placeholder text visible
