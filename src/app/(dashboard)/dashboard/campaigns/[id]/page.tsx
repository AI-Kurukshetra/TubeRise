import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { closeCampaign } from '@/app/(dashboard)/dashboard/campaigns/actions'
import CampaignROI from '@/components/dashboard/brand/CampaignROI'
import SubmittedVideosTable from '@/components/dashboard/brand/SubmittedVideosTable'

export const metadata = { title: 'Campaign Detail | TubeRise' }

const nicheLabels: Record<string, string> = {
  tech_gaming: 'Tech & Gaming',
  fitness_health: 'Fitness & Health',
  beauty_fashion: 'Beauty & Fashion',
  finance_business: 'Finance & Business',
}

function formatCurrency(value?: number | null) {
  if (!value) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Campaign Detail</h2>
        <p className="text-sm text-gray-500">Connect Supabase to load campaign data.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('brand_user_id', user.id)
    .single()

  if (!campaign) notFound()

  const { data: invitations } = await supabase
    .from('campaign_invitations')
    .select('id, status, message, invited_at, responded_at, creator_user_id')
    .eq('campaign_id', campaign.id)
    .order('invited_at', { ascending: false })

  const creatorIds = Array.from(
    new Set((invitations ?? []).map((inv) => inv.creator_user_id).filter(Boolean))
  ) as string[]

  const creatorMap = new Map<string, {
    channel_name: string | null
    channel_handle: string | null
    subscribers: number | null
    avg_engagement_rate: number | null
  }>()

  if (creatorIds.length > 0) {
    const { data: creators } = await supabase
      .from('creator_profiles')
      .select('user_id, channel_name, channel_handle, subscribers, avg_engagement_rate')
      .in('user_id', creatorIds)
    ;(creators ?? []).forEach((c) => creatorMap.set(c.user_id, c))
  }

  const { data: campaignVideos } = await supabase
    .from('campaign_videos')
    .select('title, thumbnail_url, views, likes, comments, engagement_rate, submitted_at, creator_user_id, creator_profiles ( channel_name )')
    .eq('campaign_id', campaign.id)
    .order('submitted_at', { ascending: false })

  const videos = (campaignVideos ?? []).map((v) => ({
    ...v,
    creator_profiles: Array.isArray(v.creator_profiles)
      ? (v.creator_profiles[0] as { channel_name: string | null } | undefined) ?? null
      : v.creator_profiles as { channel_name: string | null } | null,
  }))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6 gradient-top-accent">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">{campaign.title}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                campaign.status === 'completed'
                  ? 'bg-gray-100 text-gray-600'
                  : campaign.status === 'active'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
              }`}>
                {campaign.status === 'active'
                  ? 'Active'
                  : campaign.status === 'completed'
                    ? 'Completed'
                    : 'Draft'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {campaign.niche && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {nicheLabels[campaign.niche] ?? campaign.niche}
                </span>
              )}
              <span className="text-xs text-gray-500">Budget: {formatCurrency(campaign.budget)}</span>
              <span className="text-xs text-gray-500">Deadline: {formatDate(campaign.deadline)}</span>
            </div>
            {campaign.description && (
              <p className="text-sm text-gray-600 mt-3 max-w-2xl">{campaign.description}</p>
            )}
            {campaign.deliverables && (
              <p className="text-sm text-gray-500 mt-2">Deliverables: {campaign.deliverables}</p>
            )}
          </div>

          {campaign.status !== 'completed' && (
            <form action={closeCampaign.bind(null, campaign.id)}>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close Campaign
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Invitations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase text-gray-400 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Creator</th>
                <th className="text-right px-4 py-3 font-medium">Subs</th>
                <th className="text-right px-4 py-3 font-medium">Eng %</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Invited</th>
                <th className="text-left px-6 py-3 font-medium">Responded</th>
              </tr>
            </thead>
            <tbody>
              {(invitations ?? []).map((inv) => {
                const creator = inv.creator_user_id ? creatorMap.get(inv.creator_user_id) : null
                return (
                  <tr key={inv.id} className="border-b border-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {creator?.channel_name ?? 'Creator'}
                        </p>
                        {creator?.channel_handle && (
                          <p className="text-xs text-gray-500">{creator.channel_handle}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-700">
                      {creator?.subscribers ?? '—'}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-700">
                      {creator?.avg_engagement_rate ? `${creator.avg_engagement_rate.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        inv.status === 'accepted'
                          ? 'bg-green-50 text-green-700'
                          : inv.status === 'declined'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {inv.status === 'pending' ? 'Pending' : inv.status === 'accepted' ? 'Accepted' : 'Declined'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{formatDate(inv.invited_at)}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(inv.responded_at)}</td>
                  </tr>
                )
              })}
              {(!invitations || invitations.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No invitations yet. Invite creators from the discovery page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {videos.length > 0 && (
        <>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">ROI Metrics</h3>
            <CampaignROI budget={campaign.budget ?? 0} videos={videos} />
          </div>

          <SubmittedVideosTable videos={videos} />
        </>
      )}
    </div>
  )
}
