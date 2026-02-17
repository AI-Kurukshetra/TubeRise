'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toaster'

type Role = 'creator' | 'brand'

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selected, setSelected] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!selected) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast('Session expired. Please log in again.', 'error')
      router.push('/login')
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      role: selected,
    })

    if (error) {
      toast(error.message, 'error')
      setLoading(false)
      return
    }

    // Create the role-specific profile row so the user appears in listings
    if (selected === 'creator') {
      await supabase.from('creator_profiles').upsert(
        { user_id: user.id, channel_name: user.email?.split('@')[0] ?? 'Creator', is_public: true },
        { onConflict: 'user_id' }
      )
    } else {
      await supabase.from('brand_profiles').upsert(
        { user_id: user.id, company_name: user.email?.split('@')[0] ?? 'Brand' },
        { onConflict: 'user_id' }
      )
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl animate-glow-pulse delay-500" />

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 animate-fade-in relative z-10">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
          <span className="text-white text-sm font-bold">T</span>
        </div>
        <span className="font-semibold text-slate-900">TubeRise</span>
      </div>

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome! How will you use TubeRise?
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Choose your role to get a personalised experience.
          </p>
        </div>

        {/* Role selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Creator card */}
          <button
            onClick={() => setSelected('creator')}
            className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 backdrop-blur-sm ${
              selected === 'creator'
                ? 'border-transparent bg-gradient-to-br from-pink-50/90 to-rose-50/80 shadow-lg shadow-pink-500/10'
                : 'border-slate-200/60 bg-white/70 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {selected === 'creator' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-md shadow-pink-500/30">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-pink-500/25">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.361a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">I&apos;m a Creator</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Find brand deals, track your YouTube analytics, and manage campaign invitations.
            </p>
          </button>

          {/* Brand card */}
          <button
            onClick={() => setSelected('brand')}
            className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 backdrop-blur-sm ${
              selected === 'brand'
                ? 'border-transparent bg-gradient-to-br from-violet-50/90 to-purple-50/80 shadow-lg shadow-violet-500/10'
                : 'border-slate-200/60 bg-white/70 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {selected === 'brand' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-md shadow-violet-500/30">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-violet-500/25">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">I&apos;m a Brand</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Discover creators that match your niche, run campaigns, and track performance.
            </p>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
        >
          {loading ? 'Setting up your account…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
