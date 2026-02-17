type VideoRow = {
  title: string | null
  thumbnail_url: string | null
  views: number | null
  likes: number | null
  comments: number | null
  engagement_rate: number | null
  published_at?: string | null
  duration?: string | null
}

interface TopVideosTableProps {
  videos: VideoRow[]
  showPublished?: boolean
  showDuration?: boolean
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${value}`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TopVideosTable({
  videos,
  showPublished,
  showDuration,
}: TopVideosTableProps) {
  const rows = videos ?? []
  const extraCols = (showPublished ? 1 : 0) + (showDuration ? 1 : 0)
  const colSpan = 5 + extraCols

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Top Videos</h3>
          <p className="text-xs text-gray-500 mt-1">Highest performing content by views</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-xs uppercase text-gray-400 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Video</th>
              {showPublished && <th className="text-left px-4 py-3 font-medium">Published</th>}
              {showDuration && <th className="text-left px-4 py-3 font-medium">Duration</th>}
              <th className="text-right px-4 py-3 font-medium">Views</th>
              <th className="text-right px-4 py-3 font-medium">Likes</th>
              <th className="text-right px-4 py-3 font-medium">Comments</th>
              <th className="text-right px-6 py-3 font-medium">Eng %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((video, idx) => (
              <tr key={`${video.title ?? 'video'}-${idx}`} className="border-b border-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title ?? 'Video thumbnail'}
                        className="w-16 h-9 rounded-md object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-9 rounded-md bg-gray-100 border border-gray-100" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {video.title ?? 'Untitled video'}
                      </p>
                    </div>
                  </div>
                </td>
                {showPublished && (
                  <td className="px-4 py-4 text-gray-500">{formatDate(video.published_at)}</td>
                )}
                {showDuration && (
                  <td className="px-4 py-4 text-gray-500">{video.duration ?? '—'}</td>
                )}
                <td className="px-4 py-4 text-right text-gray-700">
                  {formatCompact(video.views ?? 0)}
                </td>
                <td className="px-4 py-4 text-right text-gray-700">
                  {formatCompact(video.likes ?? 0)}
                </td>
                <td className="px-4 py-4 text-right text-gray-700">
                  {formatCompact(video.comments ?? 0)}
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatPercent(video.engagement_rate ?? 0)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center text-gray-500">
                  No videos found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
