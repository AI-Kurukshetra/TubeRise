import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/dashboard/ProfileForm'

export const metadata = { title: 'Profile' }
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  let email = ''
  let displayName = ''
  let role: 'creator' | 'brand' | null = null
  let creatorProfile: {
    channel_name: string | null
    location: string | null
    niche: string[] | null
    bio: string | null
    contact_email: string | null
  } | null = null
  let brandProfile: {
    company_name: string | null
    website: string | null
    niche: string | null
    description: string | null
  } | null = null

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

      if (role === 'creator') {
        const { data: creator } = await supabase
          .from('creator_profiles')
          .select('channel_name, location, niche, bio, contact_email')
          .eq('user_id', data.user.id)
          .single()
        creatorProfile = creator ?? null
      }

      if (role === 'brand') {
        const { data: brand } = await supabase
          .from('brand_profiles')
          .select('company_name, website, niche, description')
          .eq('user_id', data.user.id)
          .single()
        brandProfile = brand ?? null
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account details.</p>
      </div>
      <ProfileForm
        email={email}
        displayName={displayName}
        role={role}
        creatorProfile={creatorProfile}
        brandProfile={brandProfile}
      />
    </div>
  )
}
