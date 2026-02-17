import { createClient } from '@/lib/supabase/server'
import CreatorDashboard from '@/components/dashboard/creator/CreatorDashboard'
import BrandDashboard from '@/components/dashboard/brand/BrandDashboard'

export const metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  let user: { id: string; email?: string | null } | null = null
  let role: 'creator' | 'brand' | null = null

  if (isConfigured) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = (profile?.role as 'creator' | 'brand') ?? null
    }
  }

  if (user && role === 'creator') {
    return <CreatorDashboard userId={user.id} />
  }

  if (user && role === 'brand') {
    return <BrandDashboard userId={user.id} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Set up your account</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a role during onboarding to unlock your dashboard.
        </p>
      </div>
    </div>
  )
}
