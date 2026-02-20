import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnalyticsChart from '@/components/dashboard/creator/AnalyticsChart'
import TopVideosTable from '@/components/dashboard/creator/TopVideosTable'
import InviteModal from '@/components/dashboard/brand/InviteModal'
import { NICHE_LABELS } from '@/lib/constants'

export const metadata = { title: 'Creator Profile | TubeRise' }
export const dynamic = 'force-dynamic'

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${value}`
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Creator Profile</h2>
        <p className="text-sm text-gray-500">Connect Supabase to load creator data.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .single()

  if (!creator) notFound()

  const { data: videos } = await supabase
    .from('video_snapshots')
    .select('title, thumbnail_url, views, likes, comments, engagement_rate, published_at')
    .eq('user_id', userId)
    .order('views', { ascending: false })
    .limit(6)

  const { data: snapshots } = await supabase
    .from('analytics_snapshots')
    .select('snapshot_date, subscribers, total_views')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: true })
    .limit(30)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            {creator.channel_avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creator.channel_avatar_url}
                alt={creator.channel_name ?? 'Creator avatar'}
                className="w-16 h-16 rounded-full object-cover border border-gray-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-gray-100" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {creator.channel_name ?? 'Creator'}
              </h2>
              {creator.channel_handle && (
                <p className="text-sm text-gray-500">{creator.channel_handle}</p>
              )}
              {creator.bio && (
                <p className="text-sm text-gray-600 mt-2 max-w-xl">{creator.bio}</p>
              )}
              {creator.location && (
                <p className="text-xs text-gray-400 mt-2">{creator.location}</p>
              )}
            </div>
          </div>
          <InviteModal creatorUserId={userId} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {(creator.niche ?? []).map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              {NICHE_LABELS[tag as keyof typeof NICHE_LABELS] ?? tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Subscribers</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {formatCompact(creator.subscribers ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Avg Views</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {formatCompact(creator.avg_views ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Engagement</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {(creator.avg_engagement_rate ?? 0).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Videos</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {formatCompact(creator.total_videos ?? 0)}
          </p>
        </div>
      </div>

      <AnalyticsChart snapshots={snapshots ?? []} />
      <TopVideosTable videos={videos ?? []} />
    </div>
  )
}
