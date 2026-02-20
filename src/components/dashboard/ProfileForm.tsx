'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toaster'
import { NICHE_OPTIONS } from '@/lib/constants'

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

  // Profile state
  const [nameValue, setNameValue] = useState(displayName)
  const [savingProfile, setSavingProfile] = useState(false)
  const [creatorChannelName, setCreatorChannelName] = useState(creatorProfile?.channel_name ?? '')
  const [creatorLocation, setCreatorLocation] = useState(creatorProfile?.location ?? '')
  const [creatorNiche, setCreatorNiche] = useState<string[]>(creatorProfile?.niche ?? [])
  const [creatorBio, setCreatorBio] = useState(creatorProfile?.bio ?? '')
  const [creatorContactEmail, setCreatorContactEmail] = useState(creatorProfile?.contact_email ?? '')
  const [brandCompanyName, setBrandCompanyName] = useState(brandProfile?.company_name ?? '')
  const [brandWebsite, setBrandWebsite] = useState(brandProfile?.website ?? '')
  const [brandNiche, setBrandNiche] = useState(brandProfile?.niche ?? '')
  const [brandDescription, setBrandDescription] = useState(brandProfile?.description ?? '')

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast('Session expired', 'error'); setSavingProfile(false); return }

    // Update display name
    const { error: nameError } = await supabase
      .from('profiles')
      .update({ display_name: nameValue })
      .eq('id', user.id)

    if (nameError) {
      toast(nameError.message, 'error')
      setSavingProfile(false)
      return
    }

    // Update role-specific profile
    if (role === 'creator') {
      const { error } = await supabase
        .from('creator_profiles')
        .upsert(
          {
            user_id: user.id,
            channel_name: creatorChannelName || null,
            location: creatorLocation || null,
            niche: creatorNiche.length > 0 ? creatorNiche : null,
            bio: creatorBio || null,
            contact_email: creatorContactEmail || null,
          },
          { onConflict: 'user_id' }
        )
      if (error) { toast(error.message, 'error'); setSavingProfile(false); return }
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
      if (error) { toast(error.message, 'error'); setSavingProfile(false); return }
    }

    toast('Profile saved', 'success')
    router.refresh()
    setSavingProfile(false)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'error')
      return
    }
    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast(error.message, 'error')
    } else {
      toast('Password updated', 'success')
      setNewPassword('')
      setConfirmPassword('')
      router.refresh()
    }
    setSavingPassword(false)
  }

  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all bg-white'

  return (
    <div className="max-w-3xl space-y-6">
      {/* ── Profile card ── */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {role === 'creator' ? 'Creator Profile' : role === 'brand' ? 'Brand Profile' : 'Profile'}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {role === 'creator'
                  ? 'Your account and channel details visible to brands'
                  : role === 'brand'
                    ? 'Your account and company information'
                    : 'Your account information'}
              </p>
            </div>
            {role && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                role === 'creator'
                  ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/60'
                  : 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${role === 'creator' ? 'bg-rose-500' : 'bg-violet-500'}`} />
                {role === 'creator' ? 'Creator' : 'Brand'}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleProfileSave}>
          <div className="px-6 py-5 space-y-6">
            {/* Account fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200">
                  {email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Display name</label>
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className={inputClass}
                  placeholder="Your display name"
                />
              </div>
            </div>

            {/* Creator-specific fields */}
            {role === 'creator' && (
              <>
                <div className="border-t border-gray-100" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Channel name</label>
                    <input
                      type="text"
                      value={creatorChannelName}
                      onChange={(e) => setCreatorChannelName(e.target.value)}
                      className={inputClass}
                      placeholder="Your channel name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={creatorLocation}
                      onChange={(e) => setCreatorLocation(e.target.value)}
                      className={inputClass}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Niches</label>
                    <div className="flex flex-wrap gap-2">
                      {NICHE_OPTIONS.map((option) => {
                        const checked = creatorNiche.includes(option.value)
                        return (
                          <label
                            key={option.value}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm cursor-pointer transition-all ${
                              checked
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/10'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() =>
                                setCreatorNiche((prev) =>
                                  checked ? prev.filter((v) => v !== option.value) : [...prev, option.value]
                                )
                              }
                            />
                            {checked && (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {option.label}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact email</label>
                    <input
                      type="email"
                      value={creatorContactEmail}
                      onChange={(e) => setCreatorContactEmail(e.target.value)}
                      className={inputClass}
                      placeholder="contact@you.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                    <textarea
                      value={creatorBio}
                      onChange={(e) => setCreatorBio(e.target.value)}
                      className={`${inputClass} min-h-[100px] resize-none`}
                      placeholder="Short intro for brands — what makes your channel unique?"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Brand-specific fields */}
            {role === 'brand' && (
              <>
                <div className="border-t border-gray-100" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company name</label>
                    <input
                      type="text"
                      value={brandCompanyName}
                      onChange={(e) => setBrandCompanyName(e.target.value)}
                      className={inputClass}
                      placeholder="Company Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                    <input
                      type="url"
                      value={brandWebsite}
                      onChange={(e) => setBrandWebsite(e.target.value)}
                      className={inputClass}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary niche</label>
                    <select
                      value={brandNiche}
                      onChange={(e) => setBrandNiche(e.target.value)}
                      className={`${inputClass} bg-white`}
                    >
                      <option value="">Select niche</option>
                      {NICHE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      value={brandDescription}
                      onChange={(e) => setBrandDescription(e.target.value)}
                      className={`${inputClass} min-h-[100px] resize-none`}
                      placeholder="Describe your brand and what you look for in creators"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Security card ── */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Security</h3>
          <p className="text-sm text-gray-500 mt-0.5">Update your password</p>
        </div>
        <form onSubmit={handlePasswordUpdate}>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
