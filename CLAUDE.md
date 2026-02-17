# TubeRise — Claude Code Rules

## Project
YouTube creator-brand collaboration platform. Creators connect their YouTube channel, receive brand campaign invitations, and track ROI. Brands discover creators, run campaigns, and measure performance.

## Tech Stack
- **Framework:** Next.js 16, App Router only (no Pages Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 — no CSS modules, no inline styles
- **UI Components:** shadcn/ui (New York style, Slate base) — components live in `src/components/ui/`
- **Animations:** Framer Motion — for page transitions and micro-interactions only
- **Auth + DB:** Supabase via `@supabase/ssr`
- **React:** 19 — Server Components by default, `'use client'` only when needed
- **Icons:** Inline SVGs only in our code — shadcn components may use lucide internally (acceptable)
- **Toasts:** `useToast()` from `@/components/ui/Toaster` — no external toast library
- **Do NOT add:** Aceternity UI, Magic UI, MUI, Mantine, or any other UI library beyond shadcn/ui

## User Roles
Two roles: `'creator'` | `'brand'` — stored in `profiles.role`, set during onboarding.
- Creator: analytics, videos, YouTube connect, invitations
- Brand: discover creators, manage campaigns

## Auth Flow
```
/signup → email confirmation → /auth/callback?next=/onboarding
→ /onboarding (role select → upsert profiles table)
→ /dashboard (role-aware sidebar)
```
- No profile → redirect to `/onboarding` (not `/login`)
- Not authenticated → redirect to `/login`

## Supabase Rules
- **Always use `getUser()`** — never `getSession()` (getSession() doesn't validate JWT server-side)
- `src/lib/supabase/server.ts` → Server Components, layouts, API route handlers
- `src/lib/supabase/client.ts` → `'use client'` components only
- Always check `isConfigured` before calling Supabase (pattern in `page.tsx` and `layout.tsx`)
- All new DB tables must have RLS enabled

## Key DB Tables
| Table | Key Columns |
|---|---|
| `profiles` | `id` (= auth user id), `role` |
| `social_accounts` | `user_id`, `platform`, `access_token`, `refresh_token` |
| `creator_profiles` | `user_id`, `channel_name`, `subscribers`, `total_videos` |
| `campaigns` | brand campaigns |
| `invitations` | campaign invitations to creators |

## File Structure
```
src/app/(auth)/              → login, signup, forgot-password
src/app/(dashboard)/         → all protected dashboard pages
src/app/onboarding/          → role selection (outside dashboard group)
src/app/auth/callback/       → Supabase email confirmation handler
src/app/api/                 → Route handlers (e.g. YouTube OAuth)
src/components/auth/         → LoginForm, SignupForm, ForgotPasswordForm
src/components/layout/       → Sidebar, Header
src/components/dashboard/    → dashboard-specific components
src/components/ui/           → Toaster (shared UI)
src/lib/supabase/            → server.ts, client.ts
phases/                      → phase spec docs — READ ONLY, never modify
```

## Adding New Pages
- Dashboard pages → `src/app/(dashboard)/dashboard/<feature>/page.tsx`
- New components → `src/components/<category>/ComponentName.tsx`
- API routes → `src/app/api/<resource>/route.ts`
- Keep pages as Server Components; extract interactive parts to `'use client'` components

## `'use client'` — Current Usage
Add only when using: hooks, event handlers, browser APIs, context consumers.
Currently client components: Header, Sidebar, all auth forms, Toaster, onboarding page.

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
- Add `'use client'` to page.tsx files — keep them Server Components
- Export `metadata` from `'use client'` files — metadata only works in Server Components
- Modify files in `phases/` folder
- Commit `.env.local`
- Create new files unless strictly necessary

## Environment Variables
```
# Required (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # seed scripts only

# Phase 8 (YouTube OAuth)
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

## Phases
8 phases planned. Specs in `phases/phase-N-*.md`. Current work follows phase order.
Do not implement features from later phases unless explicitly asked.
