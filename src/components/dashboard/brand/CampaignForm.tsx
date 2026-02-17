'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toaster'
import { createCampaign } from '@/app/(dashboard)/dashboard/campaigns/actions'

const nicheOptions = [
  { value: 'tech_gaming', label: 'Tech & Gaming' },
  { value: 'fitness_health', label: 'Fitness & Health' },
  { value: 'beauty_fashion', label: 'Beauty & Fashion' },
  { value: 'finance_business', label: 'Finance & Business' },
]

export default function CampaignForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [niche, setNiche] = useState('')
  const [budget, setBudget] = useState('')
  const [deliverables, setDeliverables] = useState('')
  const [deadline, setDeadline] = useState('')

  const validate = () => {
    if (!title.trim()) return 'Title is required.'
    if (title.trim().length > 100) return 'Title must be 100 characters or less.'
    if (!description.trim()) return 'Description is required.'
    if (!niche) return 'Please select a niche.'
    if (!budget || Number(budget) <= 0) return 'Budget must be greater than 0.'
    if (deadline) {
      const date = new Date(deadline)
      const now = new Date()
      if (Number.isNaN(date.getTime())) return 'Deadline is invalid.'
      if (date <= now) return 'Deadline must be in the future.'
    } else {
      return 'Deadline is required.'
    }
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const error = validate()
    if (error) {
      toast(error, 'error')
      return
    }

    const formData = new FormData()
    formData.set('title', title.trim())
    formData.set('description', description.trim())
    formData.set('niche', niche)
    formData.set('budget', budget)
    formData.set('deliverables', deliverables.trim())
    formData.set('deadline', deadline)

    startTransition(async () => {
      const result = await createCampaign(formData)
      if (result?.error) {
        toast(result.error, 'error')
        return
      }
      toast('Campaign created', 'success')
      router.push('/dashboard/campaigns')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Q2 Product Launch"
          maxLength={100}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-28"
          placeholder="Describe the campaign goals and expectations..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            required
          >
            <option value="">Select niche</option>
            {nicheOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="5000"
            min={1}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables</label>
        <textarea
          value={deliverables}
          onChange={(e) => setDeliverables(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-24"
          placeholder="1 video (8-10 minutes), 2 community posts"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/25"
        >
          {isPending ? 'Creating...' : 'Create Campaign'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/campaigns')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
