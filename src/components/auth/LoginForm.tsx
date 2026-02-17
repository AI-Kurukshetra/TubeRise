'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toaster'

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast(error.message, 'error')
      setLoading(false)
    } else {
      toast('Signed in successfully', 'success')
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-teal-400/15 rounded-full blur-3xl animate-glow-pulse delay-500" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl animate-glow-pulse delay-300" />

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="font-semibold text-slate-900">TubeRise</span>
        </div>

        <div className="animate-slide-up bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-white/60 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all bg-white/70"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all bg-white/70"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-medium hover:opacity-80">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-2.5 px-4 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-semibold hover:opacity-80">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
