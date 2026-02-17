import { createClient } from '@/lib/supabase/server'
import TopVideosTable from '@/components/dashboard/creator/TopVideosTable'

export const metadata = { title: 'My Videos | TubeRise' }
export const dynamic = 'force-dynamic'

export default async function VideosPage() {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  let videos: Array<{
    title: string | null
    thumbnail_url: string | null
    views: number | null
    likes: number | null
    comments: number | null
    engagement_rate: number | null
    published_at: string | null
    duration: string | null
  }> = []

  if (isConfigured) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('campaign_videos')
        .select('title, thumbnail_url, views, likes, comments, engagement_rate, submitted_at')
        .eq('creator_user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(20)
      videos =
        data?.map((row) => ({
          ...row,
          published_at: row.submitted_at,
          duration: null,
        })) ?? []
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">My Videos</h2>
        <p className="text-sm text-gray-500 mt-1">Recent performance across your latest uploads.</p>
      </div>
      <TopVideosTable videos={videos} showPublished showDuration />
    </div>
  )
}
