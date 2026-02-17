'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

type Snapshot = {
  snapshot_date: string
  subscribers: number
  total_views: number
}

interface AnalyticsChartProps {
  snapshots: Snapshot[]
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${value}`
}

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AnalyticsChart({ snapshots }: AnalyticsChartProps) {
  const data = (snapshots ?? []).map((s) => ({
    ...s,
    subscribers: Number(s.subscribers ?? 0),
    total_views: Number(s.total_views ?? 0),
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">30-Day Channel Trend</h3>
          <p className="text-sm text-slate-500 mt-1">Subscribers and total views over time</p>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="snapshot_date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompact}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value: number) => formatCompact(value)}
              labelFormatter={formatDate}
            />
            <Line type="monotone" dataKey="subscribers" stroke="#2563eb" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="total_views" stroke="#9ca3af" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
