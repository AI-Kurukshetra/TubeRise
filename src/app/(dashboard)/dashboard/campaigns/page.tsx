import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CampaignCard from '@/components/dashboard/brand/CampaignCard'

export const metadata = { title: 'Campaigns | TubeRise' }
export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  let campaigns: Array<{
    id: string
    title: string | null
    niche: string | null
    budget: number | null
    deadline: string | null
    status: 'draft' | 'active' | 'completed' | null
    created_at: string | null
  }> = []
  let invitationsByCampaign = new Map<string, Array<{ status: 'pending' | 'accepted' | 'declined' }>>()
  let errorMessage: string | null = null

  if (isConfigured) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title, niche, budget, deadline, status, created_at')
        .eq('brand_user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) {
        errorMessage = error.message
      } else {
        campaigns = (data ?? []) as typeof campaigns
      }

      const campaignIds = campaigns.map((c) => c.id)
      if (campaignIds.length > 0) {
        const { data: invitations } = await supabase
          .from('campaign_invitations')
          .select('campaign_id, status')
          .in('campaign_id', campaignIds)

        ;(invitations ?? []).forEach((inv) => {
          const list = invitationsByCampaign.get(inv.campaign_id) ?? []
          list.push({ status: inv.status })
          invitationsByCampaign.set(inv.campaign_id, list)
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Campaigns</h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage your brand campaigns.</p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Create Campaign
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-white rounded-xl border border-red-100 p-4 text-sm text-red-600">
          Failed to load campaigns: {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            id={campaign.id}
            title={campaign.title}
            niche={campaign.niche}
            budget={campaign.budget}
            deadline={campaign.deadline}
            status={campaign.status}
            invitations={invitationsByCampaign.get(campaign.id) ?? []}
          />
        ))}
        {campaigns.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
            No campaigns yet. Create your first campaign to invite creators.
          </div>
        )}
      </div>
    </div>
  )
}
