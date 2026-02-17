# Phase 6 — Campaign Management

**Status:** 🔜
**Depends on:** Phase 5 (brand discovery and brand sidebar nav must exist)

---

## Goal
Brands can create and manage sponsorship campaigns. Brands invite creators directly from a creator's profile. Creators see and respond to invitations. Accepted creators can then submit their video in Phase 7.

---

## Existing Code to Use

### `src/app/(dashboard)/dashboard/invitations/page.tsx` (Phase 4)
Creator invitation list — already built. Phase 6 adds the brand-side campaign pages.

### `src/app/(dashboard)/dashboard/invitations/actions.ts` (Phase 4)
`respondToInvitation()` server action — already built.

### `src/app/(dashboard)/dashboard/creators/[userId]/page.tsx` (Phase 5)
"Invite to Campaign" button — stub was added. Phase 6 wires up the `<InviteModal>`.

---

## New Files

### `src/app/(dashboard)/dashboard/campaigns/page.tsx`
**Brand campaigns list.** Server component.

```tsx
export const metadata = { title: 'Campaigns | TubeRise' }
```

**Data fetch:**
```ts
const { data: campaigns } = await supabase
  .from('campaigns')
  .select(`
    id, title, niche, budget, deadline, status, created_at,
    campaign_invitations(id, status)
  `)
  .eq('brand_user_id', userId)
  .order('created_at', { ascending: false })
```

**Renders:**
- "Create Campaign" button → `/dashboard/campaigns/new`
- List of `<CampaignCard>` components
- Each card shows: title, niche badge, budget, deadline, status badge, invitation counts (pending / accepted)

---

### `src/app/(dashboard)/dashboard/campaigns/new/page.tsx`
Campaign creation form page.

```tsx
export const metadata = { title: 'New Campaign | TubeRise' }
```

Renders `<CampaignForm />`.

---

### `src/components/dashboard/brand/CampaignForm.tsx`
**`'use client'`** — controlled form.

Fields:
| Field | Type | Validation |
|---|---|---|
| Title | text input | required, max 100 chars |
| Description | textarea | required |
| Niche | select (4 niches) | required |
| Budget (USD) | number input | > 0 |
| Deliverables | textarea | e.g. "1 video, 60-90 seconds" |
| Deadline | date picker | must be in future |

On submit → calls `createCampaign()` server action → redirects to `/dashboard/campaigns`.

---

### `src/app/(dashboard)/dashboard/campaigns/actions.ts`
Server actions for campaign CRUD and invitations.

```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCampaign(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase.from('campaigns').insert({
    brand_user_id: user.id,
    title:         formData.get('title') as string,
    description:   formData.get('description') as string,
    niche:         formData.get('niche') as string,
    budget:        Number(formData.get('budget')),
    deliverables:  formData.get('deliverables') as string,
    deadline:      formData.get('deadline') as string,
    status:        'active',
  })

  if (error) throw error
  revalidatePath('/dashboard/campaigns')
  redirect('/dashboard/campaigns')
}

export async function inviteCreator(campaignId: string, creatorUserId: string, message: string) {
  const supabase = await createClient()
  await supabase.from('campaign_invitations').insert({
    campaign_id:     campaignId,
    creator_user_id: creatorUserId,
    message,
  })
  revalidatePath(`/dashboard/creators/${creatorUserId}`)
}

export async function closeCampaign(campaignId: string) {
  const supabase = await createClient()
  await supabase
    .from('campaigns')
    .update({ status: 'completed' })
    .eq('id', campaignId)
  revalidatePath('/dashboard/campaigns')
}
```

---

### `src/app/(dashboard)/dashboard/campaigns/[id]/page.tsx`
Campaign detail page — brand view.

```tsx
export const metadata = { title: 'Campaign Detail | TubeRise' }
```

**Data fetch:**
```ts
const { data: campaign } = await supabase
  .from('campaigns')
  .select(`
    *,
    campaign_invitations(
      id, status, message, invited_at, responded_at,
      creator_profiles!campaign_invitations_creator_user_id_fkey(
        channel_name, channel_handle, subscribers, avg_engagement_rate
      )
    )
  `)
  .eq('id', campaignId)
  .eq('brand_user_id', userId)
  .single()
```

If `campaign` is null → `notFound()`.

**Renders:**
- Campaign header: title, status badge, budget, deadline, niche, description, deliverables
- "Close Campaign" button → calls `closeCampaign()`
- Invitations table: creator name, status badge, invite date, response date
- Submitted videos section (Phase 7 adds this tab)

---

### `src/components/dashboard/brand/CampaignCard.tsx`
Single campaign card for the list page.

Shows:
- Title, niche badge, status badge
- Budget formatted as `$5,000`
- Deadline formatted as `Mar 15, 2025`
- Invitation count chips: `4 invited · 2 accepted · 2 pending`
- "View →" link to `/dashboard/campaigns/[id]`

---

### `src/components/dashboard/brand/InviteModal.tsx`
**`'use client'`** — modal dialog.

Used on the creator public profile page (`/dashboard/creators/[userId]`).

State:
- `isOpen: boolean`
- `selectedCampaignId: string`
- `message: string`

On mount: fetches brand's active campaigns via `supabase.from('campaigns').select('id, title').eq('brand_user_id', ...)`.

```tsx
// Trigger button on creator profile page:
<button onClick={() => setIsOpen(true)}>
  Invite to Campaign
</button>

// Modal content:
<select> {/* campaign dropdown */} </select>
<textarea placeholder="Personalised message (optional)" />
<button onClick={handleInvite}>Send Invitation</button>
```

On confirm → calls `inviteCreator(selectedCampaignId, creatorUserId, message)` server action → shows toast "Invitation sent!" → closes modal.

---

## Modified Files

### `src/app/(dashboard)/dashboard/creators/[userId]/page.tsx`
Replace the stub "Invite to Campaign" button with the real `<InviteModal creatorUserId={userId} />`.

Since InviteModal is a client component, import it directly. The page itself remains a server component (InviteModal is a leaf).

---

## New Files Summary

| File | Description |
|---|---|
| `src/app/(dashboard)/dashboard/campaigns/page.tsx` | Brand campaigns list |
| `src/app/(dashboard)/dashboard/campaigns/new/page.tsx` | Create campaign page |
| `src/components/dashboard/brand/CampaignForm.tsx` | Campaign creation form |
| `src/app/(dashboard)/dashboard/campaigns/actions.ts` | Server actions (create, invite, close) |
| `src/app/(dashboard)/dashboard/campaigns/[id]/page.tsx` | Campaign detail page |
| `src/components/dashboard/brand/CampaignCard.tsx` | Campaign list card |
| `src/components/dashboard/brand/InviteModal.tsx` | Invite creator modal |

## Modified Files Summary

| File | Change |
|---|---|
| `src/app/(dashboard)/dashboard/creators/[userId]/page.tsx` | Wire up `<InviteModal>` replacing stub button |

---

## Definition of Done
- [ ] Brand can create a campaign via `/dashboard/campaigns/new`
- [ ] Campaign appears in `/dashboard/campaigns` list
- [ ] Campaign detail page (`/dashboard/campaigns/[id]`) shows invitation list
- [ ] Brand can invite a creator from their profile page (InviteModal)
- [ ] Invitation appears in creator's `/dashboard/invitations`
- [ ] Creator can accept/decline (Phase 4 server action)
- [ ] "Close Campaign" marks campaign as completed
- [ ] Seed campaigns (Q1 Product Launch, Spring Glow, Invest Smarter) visible in brand's campaign list
