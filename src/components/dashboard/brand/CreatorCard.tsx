import Link from 'next/link'

type Creator = {
  id: string
  user_id: string
  channel_name: string | null
  channel_handle: string | null
  channel_avatar_url: string | null
  subscribers: number | null
  avg_views: number | null
  avg_engagement_rate: number | null
  niche: string[] | null
  location: string | null
}

interface CreatorCardProps {
  creator: Creator
}

const nicheLabels: Record<string, string> = {
  tech_gaming: 'Tech & Gaming',
  fitness_health: 'Fitness & Health',
  beauty_fashion: 'Beauty & Fashion',
  finance_business: 'Finance & Business',
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${value}`
}

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return 'C'
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'C'
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const displayName = creator.channel_name ?? creator.channel_handle ?? 'Creator'
  const initials = getInitials(displayName)
  const nicheTags = creator.niche ?? []

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 card-glow gradient-top-accent group">
      <div className="flex items-start gap-3">
        {creator.channel_avatar_url ? (
          <img
            src={creator.channel_avatar_url}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500/30 transition-all"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center font-semibold text-sm text-white shadow-md shadow-emerald-500/20">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
          {creator.channel_handle && (
            <p className="text-xs text-gray-500">{creator.channel_handle}</p>
          )}
          {creator.location && (
            <p className="text-xs text-gray-400 mt-1">{creator.location}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {nicheTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-slate-100 to-slate-50 text-gray-700 ring-1 ring-slate-200/60"
          >
            {nicheLabels[tag] ?? tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div className="bg-gradient-to-br from-blue-50/80 to-slate-50 rounded-lg py-2">
          <p className="text-xs text-gray-500">Subs</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCompact(creator.subscribers ?? 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-violet-50/80 to-slate-50 rounded-lg py-2">
          <p className="text-xs text-gray-500">Avg Views</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCompact(creator.avg_views ?? 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-pink-50/80 to-slate-50 rounded-lg py-2">
          <p className="text-xs text-gray-500">Eng %</p>
          <p className="text-sm font-semibold text-gray-900">
            {(creator.avg_engagement_rate ?? 0).toFixed(1)}%
          </p>
        </div>
      </div>

      <Link
        href={`/dashboard/creators/${creator.user_id}`}
        className="mt-4 inline-flex items-center text-sm font-semibold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
      >
        View Profile →
      </Link>
    </div>
  )
}
