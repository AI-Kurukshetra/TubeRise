'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function respondToInvitation(invitationId: string, status: 'accepted' | 'declined') {
  const supabase = await createClient()
  await supabase
    .from('campaign_invitations')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', invitationId)

  revalidatePath('/dashboard/invitations')
}

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id || null
    }
    if (host.endsWith('youtube.com')) {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v')
      }
      const parts = parsed.pathname.split('/').filter(Boolean)
      if (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live') {
        return parts[1] || null
      }
    }
    return null
  } catch {
    return null
  }
}

export async function submitVideo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const invitationId = formData.get('invitationId') as string
  const campaignId = formData.get('campaignId') as string
  const youtubeUrl = (formData.get('youtubeUrl') as string)?.trim()
  const title = (formData.get('title') as string)?.trim()
  const thumbnailUrl = (formData.get('thumbnailUrl') as string)?.trim() || null
  const views = Number(formData.get('views')) || 0
  const likes = Number(formData.get('likes')) || 0
  const comments = Number(formData.get('comments')) || 0

  if (!youtubeUrl || !title) {
    return { error: 'YouTube URL and title are required.' }
  }

  const videoId = extractVideoId(youtubeUrl)
  if (!videoId) {
    return { error: 'Invalid YouTube URL. Use youtube.com/watch?v= or youtu.be/ format.' }
  }

  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0

  const { error } = await supabase.from('campaign_videos').insert({
    campaign_id: campaignId,
    invitation_id: invitationId,
    creator_user_id: user.id,
    video_id: videoId,
    youtube_url: youtubeUrl,
    title,
    thumbnail_url: thumbnailUrl,
    views,
    likes,
    comments,
    engagement_rate: Math.round(engagementRate * 100) / 100,
    submitted_at: new Date().toISOString(),
  })

  if (error) {
    return { error: 'Failed to submit video. Please try again.' }
  }

  revalidatePath('/dashboard/invitations')
  revalidatePath(`/dashboard/campaigns/${campaignId}`)
  return { success: true }
}
