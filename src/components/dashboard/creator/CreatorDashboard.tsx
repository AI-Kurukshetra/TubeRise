import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatCards from '@/components/dashboard/creator/StatCards'
import AnalyticsChart from '@/components/dashboard/creator/AnalyticsChart'
import TopVideosTable from '@/components/dashboard/creator/TopVideosTable'

interface CreatorDashboardProps {
  userId: string
}

export default async function CreatorDashboard({ userId }: CreatorDashboardProps) {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Creator Dashboard</h2>
        <p className="text-sm text-gray-500">Connect Supabase to load your analytics.</p>
      </div>
    )
  }

  const supabase = await createClient()

  const { data: creatorProfile } = await supabase
    .from('creator_profiles')
    .select('channel_name, channel_handle, subscribers, avg_views, avg_engagement_rate, total_videos')
    .eq('user_id', userId)
    .single()

  const { data: snapshots } = await supabase
    .from('analytics_snapshots')
    .select('snapshot_date, subscribers, total_views')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: true })
    .limit(30)

  const { data: videos } = await supabase
    .from('video_snapshots')
    .select('title, thumbnail_url, views, likes, comments, engagement_rate, published_at')
    .eq('user_id', userId)
    .order('views', { ascending: false })
    .limit(6)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Creator Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            {creatorProfile?.channel_name
              ? `${creatorProfile.channel_name} ${creatorProfile.channel_handle ?? ''}`.trim()
              : 'Your channel performance overview'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/analytics"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Analytics
          </Link>
          <Link
            href="/dashboard/videos"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            View Videos
          </Link>
        </div>
      </div>

      <StatCards
        subscribers={creatorProfile?.subscribers ?? 0}
        avgViews={creatorProfile?.avg_views ?? 0}
        engagementRate={creatorProfile?.avg_engagement_rate ?? 0}
        totalVideos={creatorProfile?.total_videos ?? 0}
      />

      <AnalyticsChart snapshots={snapshots ?? []} />

      <TopVideosTable videos={videos ?? []} />
    </div>
  )
}
