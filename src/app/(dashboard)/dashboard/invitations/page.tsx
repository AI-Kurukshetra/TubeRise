import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { respondToInvitation } from './actions'

export const metadata = { title: 'Invitations | TubeRise' }
export const dynamic = 'force-dynamic'

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

export default async function InvitationsPage() {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  let invitations: Array<{
    id: string
    status: 'pending' | 'accepted' | 'declined'
    message: string | null
    invited_at: string | null
    responded_at: string | null
    campaigns: {
      id: string
      title: string | null
      description: string | null
      budget: number | null
      deadline: string | null
      brand_user_id: string | null
    } | null
  }> = []

  const brandMap = new Map<string, string>()

  if (isConfigured) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('campaign_invitations')
        .select('id, status, message, invited_at, responded_at, campaigns ( id, title, description, budget, deadline, brand_user_id )')
        .eq('creator_user_id', user.id)
        .order('invited_at', { ascending: false })
      invitations = ((data ?? []) as unknown) as typeof invitations

      const brandIds = Array.from(
        new Set(
          invitations
            .map((inv) => inv.campaigns?.brand_user_id)
            .filter((id): id is string => Boolean(id))
        )
      )

      if (brandIds.length > 0) {
        const { data: brands } = await supabase
          .from('brand_profiles')
          .select('user_id, company_name')
          .in('user_id', brandIds)
        ;(brands ?? []).forEach((b) => brandMap.set(b.user_id, b.company_name))
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Invitations</h2>
        <p className="text-sm text-gray-500 mt-1">Review and respond to brand campaign invites.</p>
      </div>

      <div className="space-y-4">
        {invitations.map((inv) => {
          const brandName = inv.campaigns?.brand_user_id
            ? brandMap.get(inv.campaigns.brand_user_id) ?? 'Brand'
            : 'Brand'
          return (
            <div key={inv.id} className="bg-white rounded-xl border border-gray-100 p-6 card-glow gradient-top-accent">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {inv.campaigns?.title ?? 'Campaign'}
                    </span>
                    <span className="text-xs text-gray-500">• {brandName}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Budget: {formatCurrency(inv.campaigns?.budget)} • Deadline: {formatDate(inv.campaigns?.deadline)}
                  </p>
                  {inv.message && (
                    <p className="text-sm text-gray-700">{inv.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    inv.status === 'accepted'
                      ? 'bg-green-50 text-green-700'
                      : inv.status === 'declined'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {inv.status === 'pending' ? 'Pending' : inv.status === 'accepted' ? 'Accepted' : 'Declined'}
                  </span>

                  {inv.status === 'accepted' && (
                    <Link
                      href={`/dashboard/invitations/${inv.id}/submit`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:opacity-90 transition-all shadow-sm shadow-emerald-500/25"
                    >
                      Submit Video
                    </Link>
                  )}

                  {inv.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <form action={respondToInvitation.bind(null, inv.id, 'accepted')}>
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:opacity-90 transition-all shadow-sm shadow-emerald-500/25"
                        >
                          Accept
                        </button>
                      </form>
                      <form action={respondToInvitation.bind(null, inv.id, 'declined')}>
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Decline
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {invitations.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
            No invitations yet.
          </div>
        )}
      </div>
    </div>
  )
}
