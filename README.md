# TubeRise

TubeRise is a YouTube influencer campaign platform that connects brands with creators and tracks ROI in one place.

## What It Does

TubeRise supports the full campaign lifecycle for both sides of the marketplace:
- Brands can discover creators, launch campaigns, invite creators, and measure ROI (CPV, engagement rate, reach).
- Creators can connect their channel, view analytics, manage invitations, and submit campaign videos.

## Key Features

- Creator discovery with niche and performance filters
- Campaign creation, invitations, and status tracking
- Creator analytics snapshots and top videos
- Campaign ROI dashboard with CPV and engagement metrics
- Creator submissions with performance tracking

## Tech Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Supabase (Auth, Postgres, RLS)
- Vercel deployment

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

```bash
cp .env.example .env.local
```

Set the Supabase values in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

3. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Database (Supabase)

Schema and seed data live in `supabase/migrations`.

If you use the Supabase CLI locally:

```bash
supabase start
supabase db reset
```

This applies the schema in `supabase/migrations/20260217000000_initial_schema.sql` and optional seed data in `supabase/migrations/20260217000001_seed_data.sql`.

## Demo Accounts (Seed Data)

The seed script creates mock users with password `Password123!`. Examples:
- `techwithAlex@tuberise.dev` (creator)
- `novatech@tuberise.dev` (brand)

## Project Structure

```
src/
app/
(auth)/               # Login & signup
(dashboard)/          # Authenticated dashboard routes
onboarding/           # Role selection + profile setup
auth/callback/        # Supabase auth callback
page.tsx              # Marketing landing page
components/
auth/                 # Login, signup, forgot password
dashboard/            # Creator + brand dashboard UI
layout/               # Sidebar, header, shell
lib/
supabase/             # Browser + server clients
middleware.ts         # Route protection
```

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm run start` - run the production server
- `npm run lint` - lint the codebase
