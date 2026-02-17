import { createClient } from '@/lib/supabase/server'
import AnalyticsChart from '@/components/dashboard/creator/AnalyticsChart'

export const metadata = { title: 'Analytics | TubeRise' }
export const dynamic = 'force-dynamic'

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${value}`
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AnalyticsPage() {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  let snapshots: Array<{
    snapshot_date: string
    subscribers: number
    total_views: number
    avg_engagement_rate?: number | null
  }> = []

  if (isConfigured) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('analytics_snapshots')
        .select('snapshot_date, subscribers, total_views, avg_engagement_rate')
        .eq('user_id', user.id)
        .order('snapshot_date', { ascending: true })
        .limit(30)
      snapshots = data ?? []
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Your channel performance over the last 30 days.</p>
      </div>

      <AnalyticsChart snapshots={snapshots} />

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Daily Snapshots</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase text-gray-400 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Subscribers</th>
                <th className="text-right px-4 py-3 font-medium">Total Views</th>
                <th className="text-right px-6 py-3 font-medium">Eng %</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((row) => (
                <tr key={row.snapshot_date} className="border-b border-gray-50">
                  <td className="px-6 py-4 text-gray-700">{formatDate(row.snapshot_date)}</td>
                  <td className="px-4 py-4 text-right text-gray-700">
                    {formatCompact(row.subscribers ?? 0)}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-700">
                    {formatCompact(row.total_views ?? 0)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {(row.avg_engagement_rate ?? 0).toFixed(1)}%
                  </td>
                </tr>
              ))}
              {snapshots.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No analytics data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
