import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Connect YouTube | TubeRise' }

export default async function ConnectPage() {
  const isConfigured =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http') &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').length > 20

  let account: {
    channel_name: string | null
    channel_handle: string | null
    avatar_url: string | null
    connected_at: string | null
    last_synced_at: string | null
  } | null = null

  if (isConfigured) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('social_accounts')
        .select('channel_name, channel_handle, avatar_url, connected_at, last_synced_at')
        .eq('user_id', user.id)
        .eq('platform', 'youtube')
        .single()
      account = data ?? null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Connect YouTube</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your YouTube account connection.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {account ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {account.avatar_url ? (
                <img
                  src={account.avatar_url}
                  alt={account.channel_name ?? 'Channel avatar'}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-100" />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {account.channel_name ?? 'YouTube Channel'}
                </p>
                <p className="text-xs text-gray-500">{account.channel_handle ?? ''}</p>
                <p className="text-xs text-gray-400 mt-1">Last synced {account.last_synced_at ?? '—'}</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
              Connected
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">No account connected</p>
              <p className="text-xs text-gray-500 mt-1">Connect your YouTube channel to sync analytics.</p>
            </div>
            <a
              href="/api/auth/youtube"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-blue-500/25"
            >
              Connect YouTube
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
