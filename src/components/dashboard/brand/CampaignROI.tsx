interface VideoData {
  views: number | null
  likes: number | null
  comments: number | null
  engagement_rate: number | null
  title: string | null
  thumbnail_url: string | null
}

interface CampaignROIProps {
  budget: number
  videos: VideoData[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${value}`
}

export default function CampaignROI({ budget, videos }: CampaignROIProps) {
  const totalViews = videos.reduce((sum, v) => sum + (v.views ?? 0), 0)
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes ?? 0), 0)
  const totalComments = videos.reduce((sum, v) => sum + (v.comments ?? 0), 0)
  const totalEngagements = totalLikes + totalComments

  const avgEngagement = videos.length > 0
    ? videos.reduce((sum, v) => sum + (v.engagement_rate ?? 0), 0) / videos.length
    : 0

  const cpv = totalViews > 0 ? budget / totalViews : 0
  const cpe = totalEngagements > 0 ? budget / totalEngagements : 0

  const cpvColor = cpv === 0 ? 'text-gray-400' : cpv <= 0.05 ? 'text-green-600' : cpv <= 0.15 ? 'text-yellow-600' : 'text-red-600'
  const cpeColor = cpe === 0 ? 'text-gray-400' : cpe <= 0.50 ? 'text-green-600' : cpe <= 1.50 ? 'text-yellow-600' : 'text-red-600'
  const engColor = avgEngagement === 0 ? 'text-gray-400' : avgEngagement >= 5 ? 'text-green-600' : avgEngagement >= 2 ? 'text-yellow-600' : 'text-red-600'

  const cards = [
    {
      label: 'Total Reach',
      value: totalViews > 0 ? formatCompact(totalViews) : '—',
      sub: `${videos.length} video${videos.length !== 1 ? 's' : ''} submitted`,
      color: 'text-gray-900',
    },
    {
      label: 'Cost per View',
      value: cpv > 0 ? formatCurrency(cpv) : '—',
      sub: cpv > 0 ? (cpv <= 0.05 ? 'Excellent' : cpv <= 0.15 ? 'Average' : 'High') : 'No views yet',
      color: cpvColor,
    },
    {
      label: 'Avg Engagement',
      value: avgEngagement > 0 ? `${avgEngagement.toFixed(1)}%` : '—',
      sub: `${formatCompact(totalEngagements)} total engagements`,
      color: engColor,
    },
    {
      label: 'Cost per Engagement',
      value: cpe > 0 ? formatCurrency(cpe) : '—',
      sub: cpe > 0 ? (cpe <= 0.50 ? 'Excellent' : cpe <= 1.50 ? 'Average' : 'High') : 'No engagements yet',
      color: cpeColor,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-100 p-5 gradient-top-accent card-glow"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
          <p className={`text-2xl font-semibold mt-1 ${card.color}`}>{card.value}</p>
          <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
