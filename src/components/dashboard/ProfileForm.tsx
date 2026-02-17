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
}

export default function ProfileForm({ email, displayName, role }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameValue, setNameValue] = useState(displayName)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingName, setLoadingName] = useState(false)

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
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/25"
          >
            {loadingName ? 'Saving...' : 'Save name'}
          </button>
        </form>
      </div>

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
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/25"
          >
            {loadingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
