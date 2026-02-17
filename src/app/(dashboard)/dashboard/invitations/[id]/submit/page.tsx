import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VideoSubmissionForm from '@/components/dashboard/creator/VideoSubmissionForm'

export const metadata = { title: 'Submit Video | TubeRise' }
export const dynamic = 'force-dynamic'

export default async function SubmitVideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  if (!isConfigured) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: invitation } = await supabase
    .from('campaign_invitations')
    .select('id, status, creator_user_id, campaign_id, campaigns ( id, title, budget, deadline, deliverables )')
    .eq('id', id)
    .single()

  if (!invitation) notFound()
  if (invitation.creator_user_id !== user.id) notFound()
  if (invitation.status !== 'accepted') notFound()

  const rawCampaign = invitation.campaigns
  const campaign = (Array.isArray(rawCampaign) ? rawCampaign[0] : rawCampaign) as {
    id: string
    title: string | null
    budget: number | null
    deadline: string | null
    deliverables: string | null
  } | null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Submit Video</h2>
        <p className="text-sm text-gray-500 mt-1">
          Submit your video for <span className="font-medium text-gray-700">{campaign?.title ?? 'this campaign'}</span>
        </p>
      </div>

      {campaign && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 max-w-2xl">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
            {campaign.budget && (
              <span>Budget: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(campaign.budget)}</span>
            )}
            {campaign.deadline && (
              <span>Deadline: {new Date(campaign.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            )}
            {campaign.deliverables && (
              <span>Deliverables: {campaign.deliverables}</span>
            )}
          </div>
        </div>
      )}

      <VideoSubmissionForm invitationId={id} campaignId={campaign?.id ?? invitation.campaign_id} />
    </div>
  )
}
