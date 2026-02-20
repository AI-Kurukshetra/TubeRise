'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toaster'
import { inviteCreator } from '@/app/(dashboard)/dashboard/campaigns/actions'
import { CAMPAIGN_STATUS_ACTIVE } from '@/lib/constants'

interface InviteModalProps {
  creatorUserId: string
}

type CampaignOption = { id: string; title: string }

export default function InviteModal({ creatorUserId }: InviteModalProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [message, setMessage] = useState('')
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [isPending, startTransition] = useTransition()

  const canSubmit = useMemo(() => Boolean(selectedCampaignId), [selectedCampaignId])

  useEffect(() => {
    if (!isOpen) return
    const loadCampaigns = async () => {
      setLoadingCampaigns(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast('Please sign in again.', 'error')
        setLoadingCampaigns(false)
        return
      }
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title')
        .eq('brand_user_id', user.id)
        .eq('status', CAMPAIGN_STATUS_ACTIVE)
        .order('created_at', { ascending: false })
      if (error) {
        toast(error.message, 'error')
      } else {
        setCampaigns((data ?? []) as CampaignOption[])
      }
      setLoadingCampaigns(false)
    }
    loadCampaigns()
  }, [isOpen, toast])

  const handleInvite = () => {
    if (!selectedCampaignId) {
      toast('Select a campaign first.', 'error')
      return
    }
    startTransition(async () => {
      const result = await inviteCreator(selectedCampaignId, creatorUserId, message.trim())
      if (result?.error) {
        toast(result.error, 'error')
        return
      }
      toast('Invitation sent!', 'success')
      setIsOpen(false)
      setSelectedCampaignId('')
      setMessage('')
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-emerald-500/25"
      >
        Invite to Campaign
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl border border-gray-100 shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Invite Creator</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  disabled={loadingCampaigns}
                >
                  <option value="">Select a campaign</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {loadingCampaigns && (
                  <p className="text-xs text-gray-400 mt-1">Loading campaigns...</p>
                )}
                {!loadingCampaigns && campaigns.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No active campaigns found.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-24"
                  placeholder="Share any details or expectations..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInvite}
                disabled={!canSubmit || isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-500/25"
              >
                {isPending ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
