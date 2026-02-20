# TubeRise — Claude Code Rules

## Project
YouTube creator-brand collaboration platform. Creators connect their YouTube channel, receive brand campaign invitations, submit videos, and track ROI. Brands discover creators, run campaigns, and measure performance.

## Tech Stack
- **Framework:** Next.js 16, App Router only (no Pages Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 — no CSS modules, no inline styles
- **UI Components:** shadcn/ui (New York style, Slate base) — components live in `src/components/ui/`
- **Animations:** Framer Motion — for page transitions and micro-interactions only
- **Auth + DB:** Supabase via `@supabase/ssr`
- **React:** 19 — Server Components by default, `'use client'` only when needed
- **Charts:** Recharts — for analytics and ROI data visualization
- **Icons:** Inline SVGs only in our code — shadcn components may use lucide internally (acceptable)
- **Toasts:** `useToast()` from `@/components/ui/Toaster` — no external toast library
- **Do NOT add:** Aceternity UI, Magic UI, MUI, Mantine, or any other UI library beyond shadcn/ui

## User Roles
Two roles: `'creator'` | `'brand'` — stored in `profiles.role`, set during onboarding.

**Creator features:** Dashboard stats, analytics charts, top videos, YouTube connect status, campaign invitations (accept/decline), video submission for campaigns.

**Brand features:** Creator discovery with filters, campaign CRUD (create/close), creator invitations, ROI tracking with CPV/engagement/reach, submitted videos table.

## Auth Flow
```
/signup → email confirmation → /auth/callback?next=/onboarding
→ /onboarding (role select → upsert profiles + role-specific profile table)
→ /dashboard (role-aware sidebar)
```
- No profile → redirect to `/onboarding` (not `/login`)
- Not authenticated → redirect to `/login`
- Dashboard layout auto-creates role-specific profile row if missing (backfill)

## Supabase Rules
- **Always use `getUser()`** — never `getSession()` (getSession() doesn't validate JWT server-side)
- `src/lib/supabase/server.ts` → Server Components, layouts, API route handlers
- `src/lib/supabase/client.ts` → `'use client'` components only
- Always check `isConfigured` before calling Supabase (pattern in `page.tsx` and `layout.tsx`)
- All new DB tables must have RLS enabled
- Server actions call `revalidatePath()` after mutations to refresh page data

## Database Schema (9 Tables, all with RLS)

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | `id` (= auth user uuid), `role` (creator\|brand), `display_name`, `avatar_url` | One per user |
| `creator_profiles` | `user_id`, `channel_name`, `channel_handle`, `subscribers`, `avg_views`, `avg_engagement_rate`, `total_videos`, `niche` (text[]), `bio`, `location`, `is_public` | One per creator |
| `brand_profiles` | `user_id`, `company_name`, `website`, `niche`, `description` | One per brand |
| `social_accounts` | `user_id`, `platform` (youtube), `platform_user_id`, `access_token`, `refresh_token`, `token_expires_at` | YouTube OAuth tokens |
| `analytics_snapshots` | `user_id`, `snapshot_date`, `subscribers`, `total_views`, `video_count`, `avg_engagement_rate`, `raw_data` (jsonb) | Daily channel stats |
| `video_snapshots` | `user_id`, `video_id`, `title`, `views`, `likes`, `comments`, `engagement_rate`, `synced_at` | Per-video metadata |
| `campaigns` | `brand_user_id`, `title`, `description`, `budget`, `niche`, `deliverables`, `deadline`, `status` (draft\|active\|completed) | Brand campaigns |
| `campaign_invitations` | `campaign_id`, `creator_user_id`, `status` (pending\|accepted\|declined), `message`, `invited_at`, `responded_at` | Invites to creators |
| `campaign_videos` | `campaign_id`, `invitation_id`, `creator_user_id`, `video_id`, `video_url`, `title`, `views`, `likes`, `comments`, `engagement_rate` | Submitted videos |

**Migrations:** `supabase/migrations/` — schema, seed data, extra video seeds, RLS policy fixes.

## Constants (`src/lib/constants.ts`)
```ts
// Niches (used by creator_profiles & campaigns)
NICHE_VALUES = ['tech_gaming', 'fitness_health', 'beauty_fashion', 'finance_business']

// Campaign statuses
CAMPAIGN_STATUS_DRAFT | CAMPAIGN_STATUS_ACTIVE | CAMPAIGN_STATUS_COMPLETED

// Invitation statuses
INVITATION_STATUS_PENDING | INVITATION_STATUS_ACCEPTED | INVITATION_STATUS_DECLINED
InvitationResponseStatus = 'accepted' | 'declined'  // excludes 'pending'
```
Always use these constants — never hardcode status strings.

## Server Actions
| File | Actions | Purpose |
|---|---|---|
| `src/app/(dashboard)/dashboard/invitations/actions.ts` | `respondToInvitation()`, `submitVideo()` | Accept/decline invites, submit video URLs |
| `src/app/(dashboard)/dashboard/campaigns/actions.ts` | `createCampaign()`, `inviteCreator()`, `closeCampaign()` | Campaign CRUD + invite management |

## File Structure
```
src/app/
  page.tsx                               → Public landing page
  layout.tsx                             → Root layout (ToastProvider)
  error.tsx                              → Error boundary
  not-found.tsx                          → 404 page
  (auth)/
    login/page.tsx                       → Login
    signup/page.tsx                      → Signup
    forgot-password/page.tsx             → Password reset
  (dashboard)/
    layout.tsx                           → Protected layout (user/role fetch, profile backfill)
    loading.tsx                          → Skeleton loading UI
    dashboard/
      page.tsx                           → Role-aware main dashboard
      analytics/page.tsx                 → Creator: 30-day timeline chart
      videos/page.tsx                    → Creator: top videos table
      connect/page.tsx                   → Creator: YouTube connection status
      invitations/
        page.tsx                         → Creator: invitation list
        actions.ts                       → Server actions (respond, submit)
        [id]/submit/page.tsx             → Creator: video submission form
      discover/page.tsx                  → Brand: creator search with filters
      creators/[userId]/page.tsx         → Brand: creator detail + invite modal
      campaigns/
        page.tsx                         → Brand: campaign list
        actions.ts                       → Server actions (create, invite, close)
        new/page.tsx                     → Brand: campaign creation form
        [id]/page.tsx                    → Brand: campaign detail + ROI stats
      profile/page.tsx                   → Both: email + password change
      settings/page.tsx                  → Both: placeholder ("coming soon")
  onboarding/page.tsx                    → Role selection (outside dashboard group)
  auth/callback/route.ts                 → Supabase email confirmation handler

src/components/
  auth/       → LoginForm, SignupForm, ForgotPasswordForm
  layout/     → DashboardShell, Sidebar (role-aware nav), Header (sign-out)
  dashboard/
    ProfileForm.tsx                      → Email + password change
    creator/
      CreatorDashboard.tsx               → Stats + charts + videos
      StatCards.tsx                      → Subscribers, views, engagement, videos
      AnalyticsChart.tsx                 → 30-day Recharts chart
      TopVideosTable.tsx                 → Top 6 videos by views
      VideoSubmissionForm.tsx            → YouTube URL submission form
    brand/
      BrandDashboard.tsx                 → Welcome + quick links
      CreatorGrid.tsx, CreatorCard.tsx    → Discovery grid + card
      CampaignCard.tsx                   → Campaign status display
      CampaignForm.tsx                   → Campaign creation form
      CampaignROI.tsx                    → ROI stats (CPV, engagement, reach)
      InviteModal.tsx                    → Invite creator to campaign
      DiscoverFilters.tsx                → Niche, subscriber, engagement filters
      SubmittedVideosTable.tsx           → Campaign submitted videos table
  ui/         → shadcn components (button, card, input, dialog, badge, etc.) + custom Toaster

src/lib/
  supabase/server.ts                     → createServerClient (cookie-based, Server Components)
  supabase/client.ts                     → createBrowserClient ('use client' only)
  constants.ts                           → Niche values, campaign/invitation status constants
  utils.ts                               → Utility helpers (cn, etc.)

middleware.ts                            → Route protection (re-exports proxy)
src/proxy.ts                             → Auth guard logic

supabase/migrations/                     → Schema + seed data SQL files
phases/                                  → Phase spec docs (READ ONLY)
```

## Key Patterns
- **Server Components by default:** All `page.tsx` files are Server Components; extract interactive parts to `'use client'` child components
- **Role-aware rendering:** Dashboard page and Sidebar render different UI based on `profiles.role`
- **Data fetching in pages:** All Supabase queries happen in `page.tsx` / `layout.tsx` (server-side)
- **Form handling:** Server Actions for mutations, `'use client'` components for interaction
- **Engagement rate formula:** `(likes + comments) / views * 100` (rounded 2 decimals)
- **Niche as array:** PostgreSQL `text[]` — creators can have multiple niches
- **YouTube URL extraction:** Helper in `invitations/actions.ts` handles `/watch?v=` and short URL forms

## Adding New Pages
- Dashboard pages → `src/app/(dashboard)/dashboard/<feature>/page.tsx`
- New components → `src/components/<category>/ComponentName.tsx`
- API routes → `src/app/api/<resource>/route.ts`
- Keep pages as Server Components; extract interactive parts to `'use client'` components

## `'use client'` — When to Use
Add only when using: hooks, event handlers, browser APIs, context consumers.
Currently client components: Header, Sidebar, all auth forms, all dashboard interactive components (charts, forms, modals, filters), Toaster, onboarding page.

## Middleware Rule (Critical)
`middleware.ts` re-exports `proxy` from `@/proxy` but `config` **must be defined inline** in `middleware.ts` — Next.js cannot statically parse a re-exported config.
```ts
// CORRECT
export { proxy as middleware } from '@/proxy'
export const config = { matcher: [...] }

// WRONG — breaks the app
export { proxy as middleware, config } from '@/proxy'
```

## Do NOT
- Use `getSession()` — always `getUser()`
- Add icon libraries directly in our code — use inline SVGs (shadcn's internal lucide usage is fine)
- Add Redux, Zustand, or any state manager — use React state + context
- Use CSS modules or inline styles — Tailwind only
- Add UI libraries beyond shadcn/ui + Framer Motion (no Aceternity, Magic UI, MUI, etc.)
- Add `'use client'` to `page.tsx` files — keep them Server Components
- Export `metadata` from `'use client'` files — metadata only works in Server Components
- Modify files in `phases/` folder
- Commit `.env.local`
- Create new files unless strictly necessary
- Hardcode status strings — always use constants from `src/lib/constants.ts`
- Use `getSession()` for auth checks — always `getUser()`
- Skip RLS on new tables — all tables must have RLS policies

## Environment Variables
```
# Required (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # seed scripts only

# Phase 8 (YouTube OAuth — not yet wired)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

## Commands
```bash
npm run dev    # localhost:3000
npm run build  # production build check
npm run lint   # ESLint
```

## Seed Data (for Development)
- **Demo password:** `Password123!`
- **10 creators** (various niches, 34K–445K subscribers)
- **3 brands** (NovaTech, PureGlow Skincare, FinEdge App)
- **3 campaigns** (active/draft with invitations and video submissions)
- **30 days** of analytics snapshots per creator
- Seed files in `supabase/migrations/`

## Phases
8 phases planned. Specs in `phases/phase-N-*.md`.

| Phase | Focus | Status |
|---|---|---|
| 1 | Auth, Supabase clients, dashboard shell, middleware | Done |
| 2 | Profiles table, role selection, branding | Done |
| 3 | 8 additional tables, RLS policies, seed data | Done |
| 4 | Creator dashboard (stats, analytics, top videos) | Done |
| 5 | Creator discovery (filters, grid, creator detail) | Done |
| 6 | Campaign CRUD, invitations, status tracking | Done |
| 7 | Video submission, ROI calculation & display | Done |
| 8 | Landing page polish, YouTube OAuth integration | Pending |

Do not implement features from later phases unless explicitly asked.
