# AppName

> **[Product name TBD]** — A better alternative to [competing tool TBD]

<!-- Update this section once the product idea is finalized -->

## What it does

_Description coming soon. This is a placeholder until the product idea is finalized._

## Alternative to

_[Tool name] — Will be updated once the product is defined._

---

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Backend / Auth / DB**: Supabase
- **Deployment**: Vercel

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from: [Supabase Dashboard](https://supabase.com) → Your Project → Settings → API

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/         # Login & signup pages
│   ├── (dashboard)/    # Protected dashboard pages
│   ├── auth/callback/  # Supabase auth callback handler
│   └── page.tsx        # Landing page
├── components/
│   ├── auth/           # LoginForm, SignupForm
│   └── layout/         # Sidebar, Header
├── lib/
│   └── supabase/       # Browser + server clients
└── middleware.ts        # Route protection
```

## Deploy on Vercel

1. Push to GitHub
2. Import repo on [Vercel](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy
