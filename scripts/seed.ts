// scripts/seed.ts
// Run with: npx ts-node scripts/seed.ts
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS)

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'REPLACE_WITH_REAL_SERVICE_ROLE_KEY') {
  console.error('❌ Missing or placeholder SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function dateOnly(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

async function createAuthUser(email: string, password: string): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw new Error(`Failed to create user ${email}: ${error.message}`)
  return data.user.id
}

// ─── Creator data ──────────────────────────────────────────────────────────────

const creators = [
  { handle: 'TechWithAlex',      niche: ['tech_gaming'],        subs: 124000,  avg_views: 45000,  eng: 4.2, videos: 89  },
  { handle: 'FitLifeSarah',      niche: ['fitness_health'],     subs: 89000,   avg_views: 32000,  eng: 6.1, videos: 134 },
  { handle: 'GlowWithMia',       niche: ['beauty_fashion'],     subs: 210000,  avg_views: 78000,  eng: 5.8, videos: 201 },
  { handle: 'WealthBuilderJay',  niche: ['finance_business'],   subs: 56000,   avg_views: 18000,  eng: 3.9, videos: 67  },
  { handle: 'GameZoneKai',       niche: ['tech_gaming'],        subs: 445000,  avg_views: 120000, eng: 7.3, videos: 312 },
  { handle: 'RunWithRena',       niche: ['fitness_health'],     subs: 34000,   avg_views: 12000,  eng: 5.4, videos: 58  },
  { handle: 'StyleByZoe',        niche: ['beauty_fashion'],     subs: 178000,  avg_views: 62000,  eng: 6.7, videos: 156 },
  { handle: 'CryptoWithDan',     niche: ['finance_business'],   subs: 92000,   avg_views: 28000,  eng: 4.5, videos: 103 },
  { handle: 'PixelPro',          niche: ['tech_gaming'],        subs: 67000,   avg_views: 22000,  eng: 5.1, videos: 78  },
  { handle: 'NutritionNadia',    niche: ['fitness_health'],     subs: 115000,  avg_views: 38000,  eng: 5.9, videos: 122 },
]

const brands = [
  { company: 'NovaTech',          niche: 'tech_gaming',       budget: 5000,  website: 'https://novatech.io'       },
  { company: 'PureGlow Skincare', niche: 'beauty_fashion',    budget: 8000,  website: 'https://pureglow.com'      },
  { company: 'FinEdge App',       niche: 'finance_business',  budget: 3000,  website: 'https://finedgeapp.com'    },
]

// ─── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting seed...\n')

  // ── 1. Create creator auth users + profiles ──────────────────────────────
  console.log('Creating 10 creator accounts...')
  const creatorIds: string[] = []

  for (const c of creators) {
    const email = `${c.handle.toLowerCase()}@tuberise.dev`
    const uid = await createAuthUser(email, 'Password123!')

    await supabase.from('profiles').insert({
      id: uid,
      role: 'creator',
      display_name: c.handle,
    })

    const { data: cp } = await supabase.from('creator_profiles').insert({
      user_id: uid,
      channel_name: c.handle,
      channel_handle: `@${c.handle}`,
      channel_avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.handle}`,
      niche: c.niche,
      bio: `${c.handle} — passionate content creator in ${c.niche[0].replace('_', ' ')}.`,
      location: 'United States',
      contact_email: email,
      subscribers: c.subs,
      avg_views: c.avg_views,
      avg_engagement_rate: c.eng,
      total_videos: c.videos,
      is_public: true,
      last_synced_at: daysAgo(1),
    }).select('id').single()

    // social_account row (mock YouTube connection)
    const { data: sa } = await supabase.from('social_accounts').insert({
      user_id: uid,
      platform: 'youtube',
      platform_user_id: `UC${uid.replace(/-/g, '').slice(0, 22)}`,
      channel_name: c.handle,
      channel_handle: `@${c.handle}`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.handle}`,
      connected_at: daysAgo(30),
      last_synced_at: daysAgo(1),
    }).select('id').single()

    const accountId = sa?.id

    // 30 days of analytics snapshots
    if (accountId) {
      const snapshots = Array.from({ length: 30 }, (_, i) => ({
        account_id: accountId,
        user_id: uid,
        snapshot_date: dateOnly(29 - i),
        subscribers: Math.round(c.subs * (0.97 + (i / 30) * 0.03)),
        total_views: Math.round(c.avg_views * 30 * (0.95 + Math.random() * 0.1)),
        video_count: c.videos,
        avg_engagement_rate: parseFloat((c.eng * (0.95 + Math.random() * 0.1)).toFixed(2)),
      }))
      await supabase.from('analytics_snapshots').insert(snapshots)

      // 6 video snapshots
      const videoTitles = [
        `How I grew my ${c.niche[0].replace('_', ' ')} channel to ${Math.round(c.subs / 1000)}K`,
        `My top ${c.niche[0].replace('_', ' ')} tips for 2026`,
        `${c.handle} reacts: biggest trends this month`,
        `${c.niche[0].replace('_', ' ')} deep dive — full breakdown`,
        `Q&A — everything you asked about ${c.niche[0].replace('_', ' ')}`,
        `Behind the scenes of my ${c.niche[0].replace('_', ' ')} setup`,
      ]
      const videoSnapshots = videoTitles.map((title, i) => ({
        account_id: accountId,
        user_id: uid,
        video_id: `vid_${uid.slice(0, 8)}_${i}`,
        title,
        thumbnail_url: `https://picsum.photos/seed/${uid.slice(0, 6)}${i}/640/360`,
        published_at: daysAgo(i * 5 + 2),
        views: Math.round(c.avg_views * (0.7 + Math.random() * 0.6)),
        likes: Math.round(c.avg_views * c.eng / 100 * (0.8 + Math.random() * 0.4)),
        comments: Math.round(c.avg_views * 0.02 * (0.8 + Math.random() * 0.4)),
        duration: `${Math.floor(Math.random() * 15) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        engagement_rate: parseFloat((c.eng * (0.9 + Math.random() * 0.2)).toFixed(2)),
      }))
      await supabase.from('video_snapshots').insert(videoSnapshots)
    }

    creatorIds.push(uid)
    process.stdout.write(`  ✓ @${c.handle}\n`)
  }

  // ── 2. Create brand auth users + profiles ────────────────────────────────
  console.log('\nCreating 3 brand accounts...')
  const brandIds: string[] = []

  for (const b of brands) {
    const slug = b.company.toLowerCase().replace(/\s+/g, '')
    const email = `${slug}@tuberise.dev`
    const uid = await createAuthUser(email, 'Password123!')

    await supabase.from('profiles').insert({
      id: uid,
      role: 'brand',
      display_name: b.company,
    })

    await supabase.from('brand_profiles').insert({
      user_id: uid,
      company_name: b.company,
      website: b.website,
      niche: b.niche,
      description: `${b.company} is a leading brand in the ${b.niche.replace('_', ' ')} space.`,
    })

    brandIds.push(uid)
    process.stdout.write(`  ✓ ${b.company}\n`)
  }

  // ── 3. Campaigns, invitations, submitted videos ──────────────────────────
  console.log('\nCreating campaigns...')

  // Campaign 1 — NovaTech Q1 Product Launch (tech creators)
  const { data: camp1 } = await supabase.from('campaigns').insert({
    brand_user_id: brandIds[0],
    title: 'Q1 Product Launch',
    description: 'Promote our new NovaTech X1 device to tech-savvy audiences.',
    niche: 'tech_gaming',
    budget: brands[0].budget,
    deliverables: '1 dedicated video (min 8 min) + 2 community posts',
    deadline: dateOnly(-14), // already past
    status: 'active',
  }).select('id').single()

  // Campaign 2 — PureGlow Spring Glow (beauty creators)
  const { data: camp2 } = await supabase.from('campaigns').insert({
    brand_user_id: brandIds[1],
    title: 'Spring Glow Campaign',
    description: 'Showcase our new Spring collection skincare routine.',
    niche: 'beauty_fashion',
    budget: brands[1].budget,
    deliverables: '1 tutorial video featuring PureGlow products',
    deadline: dateOnly(-7),
    status: 'active',
  }).select('id').single()

  // Campaign 3 — FinEdge Invest Smarter (finance creators)
  const { data: camp3 } = await supabase.from('campaigns').insert({
    brand_user_id: brandIds[2],
    title: 'Invest Smarter with FinEdge',
    description: 'Review and demo our investment tracking app.',
    niche: 'finance_business',
    budget: brands[2].budget,
    deliverables: '1 app review video + pinned comment with promo link',
    deadline: dateOnly(-21),
    status: 'completed',
  }).select('id').single()

  console.log('  ✓ 3 campaigns created')

  // ── 4. Invitations ───────────────────────────────────────────────────────
  console.log('\nCreating invitations...')

  // Campaign 1: invite TechWithAlex(0), GameZoneKai(4), PixelPro(8), WealthBuilderJay(3)
  const c1Invites = [
    { creator: creatorIds[0], status: 'accepted',  msg: 'We love your tech content — perfect fit!' },
    { creator: creatorIds[4], status: 'accepted',  msg: 'Your gaming audience is our target demo.' },
    { creator: creatorIds[8], status: 'declined',  msg: 'Would love your PixelPro perspective.' },
    { creator: creatorIds[3], status: 'pending',   msg: 'Your finance-tech crossover is unique.' },
  ]
  const inv1Ids: string[] = []
  for (const inv of c1Invites) {
    const { data } = await supabase.from('campaign_invitations').insert({
      campaign_id: camp1!.id,
      creator_user_id: inv.creator,
      status: inv.status,
      message: inv.msg,
      invited_at: daysAgo(20),
      responded_at: inv.status !== 'pending' ? daysAgo(18) : null,
    }).select('id').single()
    inv1Ids.push(data?.id)
  }

  // Campaign 2: invite GlowWithMia(2), StyleByZoe(6), FitLifeSarah(1)
  const c2Invites = [
    { creator: creatorIds[2], status: 'accepted', msg: 'Your glow content is stunning!' },
    { creator: creatorIds[6], status: 'accepted', msg: 'StyleByZoe + PureGlow = perfect match.' },
    { creator: creatorIds[1], status: 'pending',  msg: 'We think your audience would love this.' },
  ]
  const inv2Ids: string[] = []
  for (const inv of c2Invites) {
    const { data } = await supabase.from('campaign_invitations').insert({
      campaign_id: camp2!.id,
      creator_user_id: inv.creator,
      status: inv.status,
      message: inv.msg,
      invited_at: daysAgo(15),
      responded_at: inv.status !== 'pending' ? daysAgo(13) : null,
    }).select('id').single()
    inv2Ids.push(data?.id)
  }

  // Campaign 3: invite WealthBuilderJay(3), CryptoWithDan(7)
  const c3Invites = [
    { creator: creatorIds[3], status: 'accepted', msg: 'FinEdge aligns perfectly with your content.' },
    { creator: creatorIds[7], status: 'accepted', msg: 'Your crypto audience needs FinEdge.' },
  ]
  const inv3Ids: string[] = []
  for (const inv of c3Invites) {
    const { data } = await supabase.from('campaign_invitations').insert({
      campaign_id: camp3!.id,
      creator_user_id: inv.creator,
      status: inv.status,
      message: inv.msg,
      invited_at: daysAgo(30),
      responded_at: daysAgo(28),
    }).select('id').single()
    inv3Ids.push(data?.id)
  }

  console.log('  ✓ 9 invitations created')

  // ── 5. Submitted campaign videos ─────────────────────────────────────────
  console.log('\nCreating submitted videos...')

  // Campaign 1: TechWithAlex + GameZoneKai submitted
  await supabase.from('campaign_videos').insert([
    {
      campaign_id: camp1!.id,
      invitation_id: inv1Ids[0],
      creator_user_id: creatorIds[0],
      video_id: 'yt_novatech_alex',
      video_url: 'https://youtube.com/watch?v=novatech_alex',
      title: 'NovaTech X1 — Honest Review After 2 Weeks',
      thumbnail_url: 'https://picsum.photos/seed/novatech1/640/360',
      views: 52000, likes: 3100, comments: 287, engagement_rate: 6.5,
    },
    {
      campaign_id: camp1!.id,
      invitation_id: inv1Ids[1],
      creator_user_id: creatorIds[4],
      video_id: 'yt_novatech_kai',
      video_url: 'https://youtube.com/watch?v=novatech_kai',
      title: 'I Used NovaTech X1 for 30 Days — Here\'s What Happened',
      thumbnail_url: 'https://picsum.photos/seed/novatech2/640/360',
      views: 138000, likes: 9800, comments: 1420, engagement_rate: 8.1,
    },
  ])

  // Campaign 2: GlowWithMia submitted
  await supabase.from('campaign_videos').insert([
    {
      campaign_id: camp2!.id,
      invitation_id: inv2Ids[0],
      creator_user_id: creatorIds[2],
      video_id: 'yt_pureglow_mia',
      video_url: 'https://youtube.com/watch?v=pureglow_mia',
      title: 'My Spring Skincare Routine ft. PureGlow',
      thumbnail_url: 'https://picsum.photos/seed/pureglow1/640/360',
      views: 84000, likes: 6200, comments: 743, engagement_rate: 8.3,
    },
  ])

  // Campaign 3: WealthBuilderJay + CryptoWithDan submitted
  await supabase.from('campaign_videos').insert([
    {
      campaign_id: camp3!.id,
      invitation_id: inv3Ids[0],
      creator_user_id: creatorIds[3],
      video_id: 'yt_finedge_jay',
      video_url: 'https://youtube.com/watch?v=finedge_jay',
      title: 'FinEdge App Review — Is It Worth It?',
      thumbnail_url: 'https://picsum.photos/seed/finedge1/640/360',
      views: 21000, likes: 1100, comments: 198, engagement_rate: 6.2,
    },
    {
      campaign_id: camp3!.id,
      invitation_id: inv3Ids[1],
      creator_user_id: creatorIds[7],
      video_id: 'yt_finedge_dan',
      video_url: 'https://youtube.com/watch?v=finedge_dan',
      title: 'Track Your Crypto Portfolio with FinEdge',
      thumbnail_url: 'https://picsum.photos/seed/finedge2/640/360',
      views: 33000, likes: 2400, comments: 312, engagement_rate: 8.2,
    },
  ])

  console.log('  ✓ 5 campaign videos submitted')

  console.log('\n✅ Seed complete!')
  console.log('\nAccounts created (all password: Password123!):')
  creators.forEach((c, i) => {
    console.log(`  creator  ${c.handle.toLowerCase()}@tuberise.dev`)
  })
  brands.forEach((b) => {
    console.log(`  brand    ${b.company.toLowerCase().replace(/\s+/g, '')}@tuberise.dev`)
  })
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
