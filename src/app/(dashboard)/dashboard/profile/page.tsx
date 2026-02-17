import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/dashboard/ProfileForm'

export const metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  let email = ''
  let displayName = ''
  let role: 'creator' | 'brand' | null = null

  if (isConfigured) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    email = data.user?.email ?? ''

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', data.user.id)
        .single()

      displayName = profile?.display_name ?? ''
      role = (profile?.role as 'creator' | 'brand') ?? null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account details.</p>
      </div>
      <ProfileForm email={email} displayName={displayName} role={role} />
    </div>
  )
}
