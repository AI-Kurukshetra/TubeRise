'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCampaign(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const payload = {
    brand_user_id: user.id,
    title: (formData.get('title') as string)?.trim(),
    description: (formData.get('description') as string)?.trim(),
    niche: (formData.get('niche') as string)?.trim(),
    budget: Number(formData.get('budget')),
    deliverables: (formData.get('deliverables') as string)?.trim(),
    deadline: (formData.get('deadline') as string) ?? null,
    status: 'active',
  }

  const { error } = await supabase.from('campaigns').insert(payload)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/campaigns')
  return { success: true }
}

export async function inviteCreator(campaignId: string, creatorUserId: string, message: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('campaign_invitations').insert({
    campaign_id: campaignId,
    creator_user_id: creatorUserId,
    message,
  })
  if (error) return { error: error.message }

  revalidatePath(`/dashboard/creators/${creatorUserId}`)
  revalidatePath('/dashboard/campaigns')
  return { success: true }
}

export async function closeCampaign(campaignId: string): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('campaigns')
    .update({ status: 'completed' })
    .eq('id', campaignId)

  revalidatePath('/dashboard/campaigns')
  revalidatePath(`/dashboard/campaigns/${campaignId}`)
}
