import { createClient } from '@/lib/supabase/server'
import DiscoverFilters from '@/components/dashboard/brand/DiscoverFilters'
import CreatorGrid from '@/components/dashboard/brand/CreatorGrid'

export const metadata = { title: 'Discover Creators | TubeRise' }
export const dynamic = 'force-dynamic'

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  const nicheParam = typeof params.niche === 'string' ? params.niche : null
  const minSubsParam = typeof params.min_subs === 'string' ? Number(params.min_subs) : 0
  const maxSubsParam = typeof params.max_subs === 'string' ? Number(params.max_subs) : 999_000_000
  const minEngParam = typeof params.min_eng === 'string' ? Number(params.min_eng) : 0

  let creators: Array<{
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
  }> = []

  if (isConfigured) {
    const supabase = await createClient()
    let query = supabase
      .from('creator_profiles')
      .select('id, user_id, channel_name, channel_handle, channel_avatar_url, subscribers, avg_views, avg_engagement_rate, niche, location')
      .eq('is_public', true)
      .gte('subscribers', minSubsParam)
      .lte('subscribers', maxSubsParam)
      .gte('avg_engagement_rate', minEngParam)
      .order('subscribers', { ascending: false })

    if (nicheParam) {
      query = query.contains('niche', [nicheParam])
    }

    const { data } = await query.limit(20)
    creators = data ?? []
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Discover Creators</h2>
        <p className="text-sm text-gray-500 mt-1">Browse creators that match your campaign goals.</p>
      </div>

      <DiscoverFilters />
      <CreatorGrid creators={creators} />
    </div>
  )
}
