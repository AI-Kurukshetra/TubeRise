# Phase 2 — Branding + Onboarding

**Status:** 🔜 NEXT
**Depends on:** Phase 1 ✅

---

## Goal
Replace all "AppName" placeholder text with **TubeRise**. Add a role-selection onboarding page after signup. Make the sidebar and dashboard layout role-aware.

---

## What Needs Changing (Checked Against Existing Code)

### 2.1 — Rename AppName → TubeRise

| File | Current State | Change Needed |
|---|---|---|
| `src/app/layout.tsx` | metadata title `"AppName"` template | → `"TubeRise"` |
| `src/app/page.tsx` | Nav shows `"AppName"` + `"A"` initial | → `"TubeRise"` + `"T"` initial |
| `src/components/layout/Sidebar.tsx` | Logo shows `"AppName"` + `"A"` initial | → `"TubeRise"` + `"T"` initial |
| `PLAN.md` | All `AppName` / `TubePact` references | → `TubeRise` |
| `README.md` | Product name section | → `TubeRise` |

---

### 2.2 — Create `profiles` Table in Supabase

```sql
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('creator', 'brand')),
  display_name  text,
  avatar_url    text,
  created_at    timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users manage own profile"
  on profiles for all using (auth.uid() = id);
```

---

### 2.3 — Onboarding Page (Role Selection) — NEW FILE

**File:** `src/app/onboarding/page.tsx`

- Two large role cards: "I'm a Creator" and "I'm a Brand"
- On selection → insert row into `profiles` (id = current user id, role = selected)
- On success → redirect to `/dashboard`
- If user already has a `profiles` row → skip straight to `/dashboard`

**Trigger:** After email verification, the `auth/callback` route uses the `next` param.
Update `SignupForm.tsx` to pass `emailRedirectTo` with `?next=/onboarding`.

**Current `SignupForm.tsx` line 31:**
```ts
emailRedirectTo: `${window.location.origin}/auth/callback`,
```
**Change to:**
```ts
emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
```

> `auth/callback/route.ts` already reads the `next` param (line 7). No change needed there.

---

### 2.4 — Update Dashboard Layout to Fetch Role

**File:** `src/app/(dashboard)/layout.tsx`

Currently fetches user (line 17–21) and passes `email` to Sidebar.

**Add:**
1. After fetching user, query `profiles` table for `role`
2. If no `profiles` row → redirect to `/onboarding`
3. Pass `role` as prop to `<Sidebar>`

**Current signature:**
```tsx
<Sidebar email={user?.email} />
```
**New signature:**
```tsx
<Sidebar email={user?.email} role={role} />
```

---

### 2.5 — Role-Aware Sidebar

**File:** `src/components/layout/Sidebar.tsx`

Currently: static `navItems` array with Dashboard, Settings, Profile.

**Changes:**
1. Add `role?: 'creator' | 'brand' | null` to `SidebarProps`
2. Replace static `navItems` with two role-specific arrays
3. Render correct nav based on `role` prop

**Creator nav items:**
```
Dashboard         /dashboard
Analytics         /dashboard/analytics
My Videos         /dashboard/videos
Connect YouTube   /dashboard/accounts
Creator Profile   /dashboard/creator-profile
Invitations       /dashboard/invitations
Settings          /dashboard/settings
Profile           /dashboard/profile
```

**Brand nav items:**
```
Dashboard         /dashboard
Discover          /discover
My Campaigns      /dashboard/campaigns
Settings          /dashboard/settings
Profile           /dashboard/profile
```

---

### 2.6 — Update ProfileForm (Add display_name + role)

**File:** `src/components/dashboard/ProfileForm.tsx`

Currently has: email (read-only), change password form.

**Add:**
- `display_name` input (editable) — reads/writes to `profiles` table
- `role` badge (read-only display) — "Creator" or "Brand"

**File:** `src/app/(dashboard)/dashboard/profile/page.tsx`

Currently fetches only `user.email`.

**Add:** also fetch `display_name` and `role` from `profiles` table and pass to `ProfileForm`.

---

## New Files

| File | Description |
|---|---|
| `src/app/onboarding/page.tsx` | Role selection — inserts profiles row → redirect to /dashboard |

## Modified Files

| File | What Changes |
|---|---|
| `src/app/layout.tsx` | metadata title "AppName" → "TubeRise" |
| `src/app/page.tsx` | Logo "AppName"/"A" → "TubeRise"/"T" |
| `src/components/layout/Sidebar.tsx` | Logo + role-aware navItems |
| `src/app/(dashboard)/layout.tsx` | Fetch role from profiles, pass to Sidebar, redirect if no profile |
| `src/app/(dashboard)/dashboard/profile/page.tsx` | Fetch display_name + role |
| `src/components/dashboard/ProfileForm.tsx` | Add display_name field + role badge |
| `src/components/auth/SignupForm.tsx` | emailRedirectTo → add `?next=/onboarding` |
| `PLAN.md` | TubePact → TubeRise |
| `README.md` | Product name update |

---

## Definition of Done
- [ ] No "AppName" text anywhere in the UI
- [ ] New user: signup → email verify → `/onboarding` → picks role → `/dashboard`
- [ ] Returning user without profile row → `/onboarding` redirect
- [ ] Creator sidebar nav shows Creator-specific links
- [ ] Brand sidebar nav shows Brand-specific links
- [ ] Profile page shows display_name field and role badge
