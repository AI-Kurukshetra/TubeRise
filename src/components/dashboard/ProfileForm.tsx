'use client'

// TODO (UI finalisation): update layout, field styles, and avatar section
//       to match the final design system.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toaster'

interface ProfileFormProps {
  email: string
  displayName: string
  role: 'creator' | 'brand' | null
  creatorProfile?: {
    channel_name: string | null
    location: string | null
    niche: string[] | null
    bio: string | null
    contact_email: string | null
  } | null
  brandProfile?: {
    company_name: string | null
    website: string | null
    niche: string | null
    description: string | null
  } | null
}

export default function ProfileForm({
  email,
  displayName,
  role,
  creatorProfile,
  brandProfile,
}: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameValue, setNameValue] = useState(displayName)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingName, setLoadingName] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [creatorChannelName, setCreatorChannelName] = useState(creatorProfile?.channel_name ?? '')
  const [creatorLocation, setCreatorLocation] = useState(creatorProfile?.location ?? '')
  const [creatorNiche, setCreatorNiche] = useState((creatorProfile?.niche ?? []).join(', '))
  const [creatorBio, setCreatorBio] = useState(creatorProfile?.bio ?? '')
  const [creatorContactEmail, setCreatorContactEmail] = useState(creatorProfile?.contact_email ?? '')
  const [brandCompanyName, setBrandCompanyName] = useState(brandProfile?.company_name ?? '')
  const [brandWebsite, setBrandWebsite] = useState(brandProfile?.website ?? '')
  const [brandNiche, setBrandNiche] = useState(brandProfile?.niche ?? '')
  const [brandDescription, setBrandDescription] = useState(brandProfile?.description ?? '')

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'error')
      return
    }
    setLoadingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast(error.message, 'error')
    } else {
      toast('Password updated successfully', 'success')
      setNewPassword('')
      setConfirmPassword('')
      router.refresh()
    }
    setLoadingPassword(false)
  }

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingName(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast('Session expired', 'error'); setLoadingName(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: nameValue })
      .eq('id', user.id)

    if (error) {
      toast(error.message, 'error')
    } else {
      toast('Display name updated', 'success')
      router.refresh()
    }
    setLoadingName(false)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    setLoadingProfile(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast('Session expired', 'error'); setLoadingProfile(false); return }

    let errorMessage: string | null = null

    if (role === 'creator') {
      const nicheList = creatorNiche
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      const { error } = await supabase
        .from('creator_profiles')
        .upsert(
          {
            user_id: user.id,
            channel_name: creatorChannelName || null,
            location: creatorLocation || null,
            niche: nicheList.length > 0 ? nicheList : null,
            bio: creatorBio || null,
            contact_email: creatorContactEmail || null,
          },
          { onConflict: 'user_id' }
        )
      if (error) errorMessage = error.message
    }

    if (role === 'brand') {
      const { error } = await supabase
        .from('brand_profiles')
        .upsert(
          {
            user_id: user.id,
            company_name: brandCompanyName || null,
            website: brandWebsite || null,
            niche: brandNiche || null,
            description: brandDescription || null,
          },
          { onConflict: 'user_id' }
        )
      if (error) errorMessage = error.message
    }

    if (errorMessage) {
      toast(errorMessage, 'error')
    } else {
      toast('Profile details saved', 'success')
      router.refresh()
    }
    setLoadingProfile(false)
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Account info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Account</h3>
          {role && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              role === 'creator'
                ? 'bg-red-50 text-red-700'
                : 'bg-purple-50 text-purple-700'
            }`}>
              {role === 'creator' ? 'Creator' : 'Brand'}
            </span>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            {email || '—'}
          </p>
        </div>
      </div>

      {/* Display name */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Display Name</h3>
        <form onSubmit={handleNameUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name shown on your profile
            </label>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your display name"
            />
          </div>
          <button
            type="submit"
            disabled={loadingName}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/25"
          >
            {loadingName ? 'Saving...' : 'Save name'}
          </button>
        </form>
      </div>

      {role && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Profile Details</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {role === 'creator' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel name</label>
                  <input
                    type="text"
                    value={creatorChannelName}
                    onChange={(e) => setCreatorChannelName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your channel name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={creatorLocation}
                    onChange={(e) => setCreatorLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niches</label>
                  <input
                    type="text"
                    value={creatorNiche}
                    onChange={(e) => setCreatorNiche(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tech_gaming, fitness_health"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact email</label>
                  <input
                    type="email"
                    value={creatorContactEmail}
                    onChange={(e) => setCreatorContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@you.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={creatorBio}
                    onChange={(e) => setCreatorBio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[96px]"
                    placeholder="Short intro for brands"
                  />
                </div>
              </>
            )}

            {role === 'brand' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
                  <input
                    type="text"
                    value={brandCompanyName}
                    onChange={(e) => setBrandCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={brandWebsite}
                    onChange={(e) => setBrandWebsite(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary niche</label>
                  <input
                    type="text"
                    value={brandNiche}
                    onChange={(e) => setBrandNiche(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="finance_business"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={brandDescription}
                    onChange={(e) => setBrandDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[96px]"
                    placeholder="Describe your brand"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loadingProfile}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/25"
            >
              {loadingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </div>
      )}

      {/* Change password */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min. 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loadingPassword}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/25"
          >
            {loadingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
