import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  let user = null
  let role: 'creator' | 'brand' | null = null

  if (isConfigured) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (!user) redirect('/login')

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) redirect('/onboarding')
    role = profile.role as 'creator' | 'brand'

    // Ensure role-specific profile row exists (backfills users who onboarded before this was added)
    if (role === 'creator') {
      const { data: cp } = await supabase
        .from('creator_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!cp) {
        await supabase.from('creator_profiles').insert({
          user_id: user.id,
          channel_name: user.email?.split('@')[0] ?? 'Creator',
          is_public: true,
        })
      }
    } else if (role === 'brand') {
      const { data: bp } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!bp) {
        await supabase.from('brand_profiles').insert({
          user_id: user.id,
          company_name: user.email?.split('@')[0] ?? 'Brand',
        })
      }
    }
  }

  return (
    <DashboardShell email={user?.email} role={role}>
      {children}
    </DashboardShell>
  )
}
