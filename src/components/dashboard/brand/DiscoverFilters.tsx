'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const nicheOptions = [
  { value: 'all', label: 'All niches' },
  { value: 'tech_gaming', label: 'Tech & Gaming' },
  { value: 'fitness_health', label: 'Fitness & Health' },
  { value: 'beauty_fashion', label: 'Beauty & Fashion' },
  { value: 'finance_business', label: 'Finance & Business' },
]

const minSubsOptions = [
  { value: '0', label: 'Any size' },
  { value: '10000', label: '10K+' },
  { value: '50000', label: '50K+' },
  { value: '100000', label: '100K+' },
  { value: '500000', label: '500K+' },
]

const minEngOptions = [
  { value: '0', label: 'Any engagement' },
  { value: '3', label: '3%+' },
  { value: '5', label: '5%+' },
  { value: '7', label: '7%+' },
]

export default function DiscoverFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentNiche = searchParams.get('niche') ?? 'all'
  const currentMinSubs = searchParams.get('min_subs') ?? '0'
  const currentMinEng = searchParams.get('min_eng') ?? '0'

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '0') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const query = params.toString()
    router.push(query ? `/dashboard/discover?${query}` : '/dashboard/discover')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col lg:flex-row lg:items-center gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Niche</label>
        <select
          value={currentNiche}
          onChange={(e) => updateParam('niche', e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          {nicheOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Min Subscribers</label>
        <select
          value={currentMinSubs}
          onChange={(e) => updateParam('min_subs', e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          {minSubsOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Min Engagement</label>
        <select
          value={currentMinEng}
          onChange={(e) => updateParam('min_eng', e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          {minEngOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
