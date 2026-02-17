import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  if (isConfigured) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* ── Nav ── */}
      <nav className="glass fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-8 h-16 border-b border-white/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="font-semibold text-slate-900 tracking-tight">TubeRise</span>
        </div>
        <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-slate-500">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-all font-medium shadow-md shadow-blue-500/25"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="gradient-hero flex items-center justify-center px-4 sm:px-8 pt-32 pb-20 sm:pt-40 sm:pb-28 relative">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl animate-glow-pulse delay-700" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-pink-400/10 rounded-full blur-3xl animate-glow-pulse delay-300" />

        <div className="text-center max-w-3xl relative z-10">
          <div className="animate-fade-in inline-flex items-center gap-2 bg-white/80 backdrop-blur text-sm font-medium px-4 py-2 rounded-full mb-8 border border-slate-200/60 shadow-sm">
            <span className="w-2 h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-full shrink-0" />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent font-semibold">Creator-brand partnerships, reimagined</span>
          </div>
          <h1 className="animate-slide-up text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
            The smarter way to run{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">YouTube influencer campaigns</span>
          </h1>
          <p className="animate-slide-up delay-200 text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            TubeRise connects brands with verified YouTube creators. Track ROI in real-time — CPV, engagement rate, and reach — all in one dashboard.
          </p>
          <div className="animate-slide-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-8 py-3.5 rounded-xl font-medium hover:opacity-90 transition-all text-center shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              Get started free
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto text-slate-600 px-8 py-3.5 rounded-xl font-medium hover:bg-white/80 transition-all border border-slate-200 text-center backdrop-blur"
            >
              See how it works
            </a>
          </div>
          <div className="animate-fade-in delay-500 flex items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              10+ creators
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              3 active campaigns
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              $16K tracked
            </span>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-4 sm:px-8 py-20 sm:py-28 bg-slate-50/80 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.05),transparent_70%)]" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 uppercase tracking-widest">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Everything you need to run influencer campaigns</h2>
            <p className="text-base sm:text-lg text-slate-500 max-w-lg mx-auto">From discovery to ROI — TubeRise covers the full campaign lifecycle.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Creator Discovery */}
            <div className="animate-slide-up bg-white rounded-2xl border border-slate-100 p-8 card-glow group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Creator Discovery</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Filter 10K+ YouTube creators by niche, subscriber count, and engagement rate.
              </p>
            </div>

            {/* Campaign Management */}
            <div className="animate-slide-up delay-200 bg-white rounded-2xl border border-slate-100 p-8 card-glow group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Campaign Management</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Create campaigns, invite creators, and track deliverables — all from one place.
              </p>
            </div>

            {/* ROI Tracking */}
            <div className="animate-slide-up delay-400 bg-white rounded-2xl border border-slate-100 p-8 card-glow group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-5 shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-shadow">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">ROI Tracking</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                See CPV, cost per engagement, and total reach per campaign video automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-4 sm:px-8 py-20 sm:py-28 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 uppercase tracking-widest">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Two paths, one platform</h2>
            <p className="text-base sm:text-lg text-slate-500">Get started in minutes, regardless of your role.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            {/* For Brands */}
            <div className="bg-gradient-to-br from-violet-50/80 to-purple-50/50 rounded-2xl p-8 border border-violet-100/60">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white mb-8 shadow-md shadow-violet-500/20 uppercase tracking-wide">
                For Brands
              </div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-blue-500/20">1</div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Post a campaign</p>
                    <p className="text-sm text-slate-500 mt-1">Set your budget, niche, and deliverables.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-violet-500/20">2</div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Browse & invite creators</p>
                    <p className="text-sm text-slate-500 mt-1">Filter by subscribers, engagement, and niche.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-violet-500/20">3</div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Track ROI</p>
                    <p className="text-sm text-slate-500 mt-1">Receive submitted videos and see CPV, engagement, and reach.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Creators */}
            <div className="bg-gradient-to-br from-pink-50/80 to-rose-50/50 rounded-2xl p-8 border border-pink-100/60">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-600 text-white mb-8 shadow-md shadow-pink-500/20 uppercase tracking-wide">
                For Creators
              </div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-pink-500/20">1</div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Connect your YouTube channel</p>
                    <p className="text-sm text-slate-500 mt-1">Link your account and sync analytics automatically.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-red-500 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-pink-500/20">2</div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Receive campaign invitations</p>
                    <p className="text-sm text-slate-500 mt-1">Brands find you and send collaboration offers.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-pink-500/20">3</div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Submit your video</p>
                    <p className="text-sm text-slate-500 mt-1">Deliver content and track your performance analytics.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Footer Banner ── */}
      <section className="px-4 sm:px-8 py-20 sm:py-28 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Ready to grow?</h2>
          <p className="text-base text-white/70 mb-10">Join TubeRise and start collaborating today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white text-slate-900 px-8 py-3.5 rounded-xl font-medium hover:bg-white/90 transition-all text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start as a Creator
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white/15 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-white/25 transition-all text-center border border-white/20 backdrop-blur"
            >
              Start as a Brand
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 sm:px-8 py-8 border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">T</span>
            </div>
            <span className="text-sm text-slate-400">TubeRise</span>
          </div>
          <p className="text-sm text-slate-400">&copy; 2026 TubeRise. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
