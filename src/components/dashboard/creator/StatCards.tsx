interface StatCardsProps {
  subscribers?: number | null
  avgViews?: number | null
  engagementRate?: number | null
  totalVideos?: number | null
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${value}`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

const gradients = [
  'from-blue-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-orange-600',
]

const shadows = [
  'shadow-blue-500/20',
  'shadow-violet-500/20',
  'shadow-pink-500/20',
  'shadow-amber-500/20',
]

export default function StatCards({
  subscribers,
  avgViews,
  engagementRate,
  totalVideos,
}: StatCardsProps) {
  const stats = [
    { label: 'Subscribers', value: formatCompact(subscribers ?? 0) },
    { label: 'Avg Views', value: formatCompact(avgViews ?? 0) },
    { label: 'Engagement Rate', value: formatPercent(engagementRate ?? 0) },
    { label: 'Total Videos', value: formatCompact(totalVideos ?? 0) },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-slate-100 p-5 card-glow gradient-top-accent"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradients[i]} shadow-sm ${shadows[i]}`} />
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
              {stat.label}
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
