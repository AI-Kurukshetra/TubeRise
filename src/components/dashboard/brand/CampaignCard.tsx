import Link from 'next/link'
import {
  CAMPAIGN_STATUS_BADGE_CLASSES,
  CAMPAIGN_STATUS_LABELS,
  CampaignStatus,
  INVITATION_STATUS_ACCEPTED,
  INVITATION_STATUS_PENDING,
  InvitationStatus,
  NICHE_LABELS,
} from '@/lib/constants'

type CampaignCardProps = {
  id: string
  title: string | null
  niche: string | null
  budget: number | null
  deadline: string | null
  status: CampaignStatus | null
  invitations: Array<{ status: InvitationStatus }>
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

export default function CampaignCard({
  id,
  title,
  niche,
  budget,
  deadline,
  status,
  invitations,
}: CampaignCardProps) {
  const invitedCount = invitations.length
  const acceptedCount = invitations.filter((i) => i.status === INVITATION_STATUS_ACCEPTED).length
  const pendingCount = invitations.filter((i) => i.status === INVITATION_STATUS_PENDING).length

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 card-glow gradient-top-accent">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title ?? 'Campaign'}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {niche && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-slate-100 to-slate-50 text-gray-700 ring-1 ring-slate-200/60">
                {NICHE_LABELS[niche as keyof typeof NICHE_LABELS] ?? niche}
              </span>
            )}
            {status && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CAMPAIGN_STATUS_BADGE_CLASSES[status]}`}>
                {CAMPAIGN_STATUS_LABELS[status]}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/dashboard/campaigns/${id}`}
          className="text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-semibold hover:opacity-80 transition-opacity"
        >
          View →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Budget</p>
          <p className="font-medium text-gray-900">{formatCurrency(budget)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Deadline</p>
          <p className="font-medium text-gray-900">{formatDate(deadline)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          {invitedCount} invited
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          {acceptedCount} accepted
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          {pendingCount} pending
        </span>
      </div>
    </div>
  )
}
