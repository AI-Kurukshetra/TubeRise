import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  CAMPAIGN_STATUS_ACTIVE,
  INVITATION_STATUS_ACCEPTED,
  INVITATION_STATUS_PENDING,
} from '@/lib/constants'

interface BrandDashboardProps {
  userId: string
}

function statCard(label: string, value: number) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-2 tracking-tight tabular-nums">{value}</p>
    </div>
  )
}

export default async function BrandDashboard({ userId }: BrandDashboardProps) {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  let activeCampaigns = 0
  let totalInvites = 0
  let pendingInvites = 0
  let acceptedInvites = 0

  if (isConfigured) {
    const supabase = await createClient()
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('brand_user_id', userId)

    const campaignIds = (campaigns ?? []).map((c) => c.id)
    activeCampaigns = (campaigns ?? []).filter((c) => c.status === CAMPAIGN_STATUS_ACTIVE).length

    if (campaignIds.length > 0) {
      const { data: invites } = await supabase
        .from('campaign_invitations')
        .select('id, status, campaign_id')
        .in('campaign_id', campaignIds)

      totalInvites = invites?.length ?? 0
      pendingInvites = (invites ?? []).filter((i) => i.status === INVITATION_STATUS_PENDING).length
      acceptedInvites = (invites ?? []).filter((i) => i.status === INVITATION_STATUS_ACCEPTED).length
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Brand Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Track your active campaigns and creator responses.</p>
        </div>
        <Link
          href="/dashboard/discover"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Browse Creators →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCard('Active Campaigns', activeCampaigns)}
        {statCard('Invitations Sent', totalInvites)}
        {statCard('Pending Responses', pendingInvites)}
        {statCard('Accepted', acceptedInvites)}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Find your next creator</h3>
          <p className="text-sm text-slate-500 mt-1">Filter by niche, subscribers, and engagement.</p>
        </div>
        <Link
          href="/dashboard/discover"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Discover Creators
        </Link>
      </div>
    </div>
  )
}
