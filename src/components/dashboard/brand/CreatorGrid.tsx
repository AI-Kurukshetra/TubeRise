import CreatorCard from '@/components/dashboard/brand/CreatorCard'

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

interface CreatorGridProps {
  creators: Creator[]
}

export default function CreatorGrid({ creators }: CreatorGridProps) {
  if (!creators || creators.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No creators match your filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} />
      ))}
    </div>
  )
}
