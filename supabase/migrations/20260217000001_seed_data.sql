-- ============================================================
-- TubeRise â€” Seed Data
-- 10 creators, 3 brands, 3 campaigns, invitations, videos
-- ============================================================

-- Create auth users directly (bypasses need for service role key)
-- Password hash is for 'Password123!' using bcrypt
do $$
declare
  -- Creator UUIDs
  uid_alex    uuid := '11111111-0001-0001-0001-000000000001';
  uid_sarah   uuid := '11111111-0001-0001-0001-000000000002';
  uid_mia     uuid := '11111111-0001-0001-0001-000000000003';
  uid_jay     uuid := '11111111-0001-0001-0001-000000000004';
  uid_kai     uuid := '11111111-0001-0001-0001-000000000005';
  uid_rena    uuid := '11111111-0001-0001-0001-000000000006';
  uid_zoe     uuid := '11111111-0001-0001-0001-000000000007';
  uid_dan     uuid := '11111111-0001-0001-0001-000000000008';
  uid_pixel   uuid := '11111111-0001-0001-0001-000000000009';
  uid_nadia   uuid := '11111111-0001-0001-0001-000000000010';
  -- Brand UUIDs
  uid_nova    uuid := '22222222-0002-0002-0002-000000000001';
  uid_glow    uuid := '22222222-0002-0002-0002-000000000002';
  uid_fin     uuid := '22222222-0002-0002-0002-000000000003';
  -- Campaign + social account IDs
  sa_alex     uuid; sa_sarah   uuid; sa_mia     uuid; sa_jay     uuid;
  sa_kai      uuid; sa_rena    uuid; sa_zoe     uuid; sa_dan     uuid;
  sa_pixel    uuid; sa_nadia   uuid;
  camp1_id    uuid; camp2_id   uuid; camp3_id   uuid;
  inv_alex    uuid; inv_kai    uuid; inv_mia    uuid; inv_zoe    uuid;
  inv_jay3    uuid; inv_dan3   uuid;

begin

-- â”€â”€ Auth users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  (uid_alex,  'techwithAlex@tuberise.dev',     '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_sarah, 'fitlifesarah@tuberise.dev',     '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_mia,   'glowwithmia@tuberise.dev',      '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_jay,   'wealthbuilderjay@tuberise.dev', '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_kai,   'gamezonekai@tuberise.dev',      '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_rena,  'runwithrena@tuberise.dev',      '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_zoe,   'stylebyzoe@tuberise.dev',       '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_dan,   'cryptowithdan@tuberise.dev',    '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_pixel, 'pixelpro@tuberise.dev',         '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_nadia, 'nutritionnadia@tuberise.dev',   '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_nova,  'novatech@tuberise.dev',         '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_glow,  'pureglowskincare@tuberise.dev', '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  (uid_fin,   'finedgeapp@tuberise.dev',       '$2a$10$PozPkQYPzBQ5MNqP.bJkYuFsJBMHq7j0WzrL7GEUr9E9V8HiQfXpG', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}')
on conflict (id) do nothing;

-- â”€â”€ Profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into profiles (id, role, display_name) values
  (uid_alex,  'creator', 'TechWithAlex'),
  (uid_sarah, 'creator', 'FitLifeSarah'),
  (uid_mia,   'creator', 'GlowWithMia'),
  (uid_jay,   'creator', 'WealthBuilderJay'),
  (uid_kai,   'creator', 'GameZoneKai'),
  (uid_rena,  'creator', 'RunWithRena'),
  (uid_zoe,   'creator', 'StyleByZoe'),
  (uid_dan,   'creator', 'CryptoWithDan'),
  (uid_pixel, 'creator', 'PixelPro'),
  (uid_nadia, 'creator', 'NutritionNadia'),
  (uid_nova,  'brand',   'NovaTech'),
  (uid_glow,  'brand',   'PureGlow Skincare'),
  (uid_fin,   'brand',   'FinEdge App')
on conflict (id) do nothing;

-- â”€â”€ Creator profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into creator_profiles (user_id, channel_name, channel_handle, channel_avatar_url, niche, bio, location, contact_email, subscribers, avg_views, avg_engagement_rate, total_videos, is_public, last_synced_at) values
  (uid_alex,  'TechWithAlex',     '@TechWithAlex',     'https://api.dicebear.com/7.x/avataaars/svg?seed=TechWithAlex',     '{tech_gaming}',       'Tech reviewer and gadget enthusiast.',         'San Francisco, US', 'techwithAlex@tuberise.dev',     124000, 45000, 4.2, 89,  true, now() - interval '1 day'),
  (uid_sarah, 'FitLifeSarah',     '@FitLifeSarah',     'https://api.dicebear.com/7.x/avataaars/svg?seed=FitLifeSarah',     '{fitness_health}',    'Certified trainer sharing fitness journeys.',  'Austin, US',        'fitlifesarah@tuberise.dev',     89000,  32000, 6.1, 134, true, now() - interval '1 day'),
  (uid_mia,   'GlowWithMia',      '@GlowWithMia',      'https://api.dicebear.com/7.x/avataaars/svg?seed=GlowWithMia',      '{beauty_fashion}',    'Beauty creator obsessed with skincare.',        'Los Angeles, US',   'glowwithmia@tuberise.dev',      210000, 78000, 5.8, 201, true, now() - interval '1 day'),
  (uid_jay,   'WealthBuilderJay', '@WealthBuilderJay', 'https://api.dicebear.com/7.x/avataaars/svg?seed=WealthBuilderJay', '{finance_business}',  'Personal finance tips for everyday people.',   'New York, US',      'wealthbuilderjay@tuberise.dev', 56000,  18000, 3.9, 67,  true, now() - interval '1 day'),
  (uid_kai,   'GameZoneKai',      '@GameZoneKai',      'https://api.dicebear.com/7.x/avataaars/svg?seed=GameZoneKai',      '{tech_gaming}',       'Top gaming creator. Reviews, walkthroughs.',   'Seattle, US',       'gamezonekai@tuberise.dev',      445000, 120000,7.3, 312, true, now() - interval '1 day'),
  (uid_rena,  'RunWithRena',      '@RunWithRena',      'https://api.dicebear.com/7.x/avataaars/svg?seed=RunWithRena',      '{fitness_health}',    'Marathon runner & endurance coach.',           'Chicago, US',       'runwithrena@tuberise.dev',      34000,  12000, 5.4, 58,  true, now() - interval '1 day'),
  (uid_zoe,   'StyleByZoe',       '@StyleByZoe',       'https://api.dicebear.com/7.x/avataaars/svg?seed=StyleByZoe',       '{beauty_fashion}',    'Fashion stylist turning trends into looks.',   'Miami, US',         'stylebyzoe@tuberise.dev',       178000, 62000, 6.7, 156, true, now() - interval '1 day'),
  (uid_dan,   'CryptoWithDan',    '@CryptoWithDan',    'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoWithDan',    '{finance_business}',  'Crypto analyst. DeFi, NFTs, market trends.',   'Miami, US',         'cryptowithdan@tuberise.dev',    92000,  28000, 4.5, 103, true, now() - interval '1 day'),
  (uid_pixel, 'PixelPro',         '@PixelPro',         'https://api.dicebear.com/7.x/avataaars/svg?seed=PixelPro',         '{tech_gaming}',       'Camera & photo gear reviews for creators.',    'Portland, US',      'pixelpro@tuberise.dev',         67000,  22000, 5.1, 78,  true, now() - interval '1 day'),
  (uid_nadia, 'NutritionNadia',   '@NutritionNadia',   'https://api.dicebear.com/7.x/avataaars/svg?seed=NutritionNadia',   '{fitness_health}',    'Registered dietitian. Recipes & meal plans.',  'Denver, US',        'nutritionnadia@tuberise.dev',   115000, 38000, 5.9, 122, true, now() - interval '1 day')
on conflict (user_id) do nothing;

-- â”€â”€ Brand profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into brand_profiles (user_id, company_name, website, niche, description) values
  (uid_nova, 'NovaTech',          'https://novatech.io',      'tech_gaming',      'Leading consumer electronics brand targeting tech-savvy audiences.'),
  (uid_glow, 'PureGlow Skincare', 'https://pureglow.com',     'beauty_fashion',   'Clean beauty brand focused on natural skincare solutions.'),
  (uid_fin,  'FinEdge App',       'https://finedgeapp.com',   'finance_business', 'Investment tracking app helping users grow their portfolio.')
on conflict (user_id) do nothing;

-- â”€â”€ Social accounts (mock YouTube connections) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into social_accounts (id, user_id, platform, platform_user_id, channel_name, channel_handle, connected_at, last_synced_at)
values
  (gen_random_uuid(), uid_alex,  'youtube', 'UCalex001',  'TechWithAlex',     '@TechWithAlex',     now()-interval '30 days', now()-interval '1 day'),
  (gen_random_uuid(), uid_sarah, 'youtube', 'UCsarah002', 'FitLifeSarah',     '@FitLifeSarah',     now()-interval '30 days', now()-interval '1 day'),
  (gen_random_uuid(), uid_mia,   'youtube', 'UCmia003',   'GlowWithMia',      '@GlowWithMia',      now()-interval '30 days', now()-interval '1 day'),
  (gen_random_uuid(), uid_jay,   'youtube', 'UCjay004',   'WealthBuilderJay', '@WealthBuilderJay', now()-interval '30 days', now()-interval '1 day'),
  (gen_random_uuid(), uid_kai,   'youtube', 'UCkai005',   'GameZoneKai',      '@GameZoneKai',      now()-interval '30 days', now()-interval '1 day'),
  (gen_random_uuid(), uid_rena,  'youtube', 'UCrena006',  'RunWithRena',      '@RunWithRena',      now()-interval '30 days', now()-interval '1 day'),
  (gen_random_uuid(), uid_zoe,   'youtube', 'UCzoe007',   'StyleByZoe',       '@StyleByZoe',       now()-interval '30 days', now()-interval '1 day'),
  (gen_random_uuid(), uid_dan,   'youtube', 'UCdan008',   'CryptoWithDan',    '@CryptoWithDan',    now()-interval '30 days', now()-interval '1 day'),
  (gen_random_uuid(), uid_pixel, 'youtube', 'UCpixel009', 'PixelPro',         '@PixelPro',         now()-interval '30 days', now()-interval '1 day'),
  (gen_random_uuid(), uid_nadia, 'youtube', 'UCnadia010', 'NutritionNadia',   '@NutritionNadia',   now()-interval '30 days', now()-interval '1 day');

-- Capture social account IDs for analytics
select id into sa_alex  from social_accounts where user_id = uid_alex  limit 1;
select id into sa_sarah from social_accounts where user_id = uid_sarah limit 1;
select id into sa_mia   from social_accounts where user_id = uid_mia   limit 1;
select id into sa_jay   from social_accounts where user_id = uid_jay   limit 1;
select id into sa_kai   from social_accounts where user_id = uid_kai   limit 1;
select id into sa_rena  from social_accounts where user_id = uid_rena  limit 1;
select id into sa_zoe   from social_accounts where user_id = uid_zoe   limit 1;
select id into sa_dan   from social_accounts where user_id = uid_dan   limit 1;
select id into sa_pixel from social_accounts where user_id = uid_pixel limit 1;
select id into sa_nadia from social_accounts where user_id = uid_nadia limit 1;

-- â”€â”€ Analytics snapshots (30 days per creator) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into analytics_snapshots (account_id, user_id, snapshot_date, subscribers, total_views, video_count, avg_engagement_rate)
select sa_alex, uid_alex, (current_date - s)::date, 124000 - s*10, 45000 + s*200, 89, 4.2 from generate_series(0,29) s
on conflict (account_id, snapshot_date) do nothing;

insert into analytics_snapshots (account_id, user_id, snapshot_date, subscribers, total_views, video_count, avg_engagement_rate)
select sa_sarah, uid_sarah, (current_date - s)::date, 89000 - s*8, 32000 + s*150, 134, 6.1 from generate_series(0,29) s
on conflict (account_id, snapshot_date) do nothing;

insert into analytics_snapshots (account_id, user_id, snapshot_date, subscribers, total_views, video_count, avg_engagement_rate)
select sa_mia, uid_mia, (current_date - s)::date, 210000 - s*20, 78000 + s*300, 201, 5.8 from generate_series(0,29) s
on conflict (account_id, snapshot_date) do nothing;

insert into analytics_snapshots (account_id, user_id, snapshot_date, subscribers, total_views, video_count, avg_engagement_rate)
select sa_jay, uid_jay, (current_date - s)::date, 56000 - s*5, 18000 + s*100, 67, 3.9 from generate_series(0,29) s
on conflict (account_id, snapshot_date) do nothing;

insert into analytics_snapshots (account_id, user_id, snapshot_date, subscribers, total_views, video_count, avg_engagement_rate)
select sa_kai, uid_kai, (current_date - s)::date, 445000 - s*40, 120000 + s*500, 312, 7.3 from generate_series(0,29) s
on conflict (account_id, snapshot_date) do nothing;

insert into analytics_snapshots (account_id, user_id, snapshot_date, subscribers, total_views, video_count, avg_engagement_rate)
select sa_rena, uid_rena, (current_date - s)::date, 34000 - s*3, 12000 + s*80, 58, 5.4 from generate_series(0,29) s
on conflict (account_id, snapshot_date) do nothing;

insert into analytics_snapshots (account_id, user_id, snapshot_date, subscribers, total_views, video_count, avg_engagement_rate)
select sa_zoe, uid_zoe, (current_date - s)::date, 178000 - s*15, 62000 + s*250, 156, 6.7 from generate_series(0,29) s
on conflict (account_id, snapshot_date) do nothing;

insert into analytics_snapshots (account_id, user_id, snapshot_date, subscribers, total_views, video_count, avg_engagement_rate)
select sa_dan, uid_dan, (current_date - s)::date, 92000 - s*8, 28000 + s*120, 103, 4.5 from generate_series(0,29) s
on conflict (account_id, snapshot_date) do nothing;

insert into analytics_snapshots (account_id, user_id, snapshot_date, subscribers, total_views, video_count, avg_engagement_rate)
select sa_pixel, uid_pixel, (current_date - s)::date, 67000 - s*6, 22000 + s*100, 78, 5.1 from generate_series(0,29) s
on conflict (account_id, snapshot_date) do nothing;

insert into analytics_snapshots (account_id, user_id, snapshot_date, subscribers, total_views, video_count, avg_engagement_rate)
select sa_nadia, uid_nadia, (current_date - s)::date, 115000 - s*10, 38000 + s*180, 122, 5.9 from generate_series(0,29) s
on conflict (account_id, snapshot_date) do nothing;

-- â”€â”€ Video snapshots (6 per creator) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into video_snapshots (account_id, user_id, video_id, title, thumbnail_url, published_at, views, likes, comments, duration, engagement_rate) values
  (sa_alex, uid_alex, 'alex_v1', 'How I grew my tech channel to 124K', 'https://picsum.photos/seed/alex1/640/360', now()-interval '2 days',  48000, 2800, 310, '12:34', 6.5),
  (sa_alex, uid_alex, 'alex_v2', 'Top 5 gadgets of 2026',              'https://picsum.photos/seed/alex2/640/360', now()-interval '7 days',  52000, 3100, 287, '9:12',  6.1),
  (sa_alex, uid_alex, 'alex_v3', 'Is the NovaTech X1 worth it?',       'https://picsum.photos/seed/alex3/640/360', now()-interval '12 days', 61000, 3900, 420, '15:08', 7.4),
  (sa_alex, uid_alex, 'alex_v4', 'My full studio setup tour',           'https://picsum.photos/seed/alex4/640/360', now()-interval '17 days', 39000, 2200, 198, '8:45',  6.2),
  (sa_alex, uid_alex, 'alex_v5', 'Best budget laptops 2026',            'https://picsum.photos/seed/alex5/640/360', now()-interval '22 days', 44000, 2600, 231, '11:20', 6.4),
  (sa_alex, uid_alex, 'alex_v6', 'Q&A â€” you asked, I answered',         'https://picsum.photos/seed/alex6/640/360', now()-interval '27 days', 31000, 1800, 412, '20:15', 7.1),

  (sa_kai, uid_kai, 'kai_v1', 'I played every AAA game this month',     'https://picsum.photos/seed/kai1/640/360', now()-interval '2 days',  138000, 9800, 1420, '28:44', 8.1),
  (sa_kai, uid_kai, 'kai_v2', 'The game that broke my PC',              'https://picsum.photos/seed/kai2/640/360', now()-interval '7 days',  112000, 8100, 1180, '18:32', 8.3),
  (sa_kai, uid_kai, 'kai_v3', 'Best gaming setup under $2000',          'https://picsum.photos/seed/kai3/640/360', now()-interval '12 days', 125000, 9200, 1310, '22:15', 8.4),
  (sa_kai, uid_kai, 'kai_v4', 'RTX 5090 â€” full review',                 'https://picsum.photos/seed/kai4/640/360', now()-interval '17 days', 198000,14000, 2100, '31:07', 8.1),
  (sa_kai, uid_kai, 'kai_v5', '24 hours gaming challenge',              'https://picsum.photos/seed/kai5/640/360', now()-interval '22 days', 89000,  6200,  980, '45:00', 8.0),
  (sa_kai, uid_kai, 'kai_v6', 'Reacting to worst gaming takes',         'https://picsum.photos/seed/kai6/640/360', now()-interval '27 days', 76000,  5400,  870, '16:22', 8.2),

  (sa_mia, uid_mia, 'mia_v1', 'My spring skincare routine 2026',        'https://picsum.photos/seed/mia1/640/360', now()-interval '2 days',  84000, 6200, 743, '14:22', 8.3),
  (sa_mia, uid_mia, 'mia_v2', 'Drugstore vs luxury â€” honest review',    'https://picsum.photos/seed/mia2/640/360', now()-interval '7 days',  72000, 5100, 612, '11:48', 7.9),
  (sa_mia, uid_mia, 'mia_v3', 'Morning glow routine',                   'https://picsum.photos/seed/mia3/640/360', now()-interval '12 days', 91000, 7300, 892, '18:05', 9.0),
  (sa_mia, uid_mia, 'mia_v4', 'Skincare mistakes you are making',       'https://picsum.photos/seed/mia4/640/360', now()-interval '17 days', 68000, 4800, 521, '10:33', 7.8),
  (sa_mia, uid_mia, 'mia_v5', 'PureGlow collection â€” first impressions','https://picsum.photos/seed/mia5/640/360', now()-interval '22 days', 95000, 7800, 980, '16:40', 9.2),
  (sa_mia, uid_mia, 'mia_v6', 'Q&A â€” skincare edition',                 'https://picsum.photos/seed/mia6/640/360', now()-interval '27 days', 62000, 4200, 710, '22:18', 7.9)
on conflict (account_id, video_id) do nothing;

-- Extra video snapshots for remaining creators (to populate Videos + Dashboard)
insert into video_snapshots (account_id, user_id, video_id, title, thumbnail_url, published_at, views, likes, comments, duration, engagement_rate) values
  (sa_sarah, uid_sarah, 'sarah_v1', '30-Min Fat Burn Workout',          'https://picsum.photos/seed/sarah1/640/360', now()-interval '3 days',  26000, 2100, 310, '30:12', 9.2),
  (sa_sarah, uid_sarah, 'sarah_v2', 'Healthy Meal Prep in 45 Minutes',  'https://picsum.photos/seed/sarah2/640/360', now()-interval '9 days',  19000, 1500, 220, '12:48', 9.0),
  (sa_sarah, uid_sarah, 'sarah_v3', 'My Morning Mobility Routine',      'https://picsum.photos/seed/sarah3/640/360', now()-interval '15 days', 24000, 1900, 260, '10:22', 9.0),
  (sa_sarah, uid_sarah, 'sarah_v4', 'Cardio vs Strength for Fat Loss',  'https://picsum.photos/seed/sarah4/640/360', now()-interval '21 days', 17000, 1200, 180, '14:05', 8.2),
  (sa_sarah, uid_sarah, 'sarah_v5', '10K Steps Challenge â€” Day 1',      'https://picsum.photos/seed/sarah5/640/360', now()-interval '25 days', 11000,  800, 130, '8:33',  8.5),
  (sa_sarah, uid_sarah, 'sarah_v6', 'Hydration Tips You Actually Need', 'https://picsum.photos/seed/sarah6/640/360', now()-interval '28 days',  9000,  620,  90, '6:40',  7.9),

  (sa_jay, uid_jay, 'jay_v1', 'Budgeting 101 for 2026',                 'https://picsum.photos/seed/jay1/640/360', now()-interval '4 days',  15000, 980, 120, '11:10', 7.3),
  (sa_jay, uid_jay, 'jay_v2', 'My Favorite Credit Cards Right Now',     'https://picsum.photos/seed/jay2/640/360', now()-interval '8 days',  21000, 1400, 180, '13:25', 7.5),
  (sa_jay, uid_jay, 'jay_v3', 'Side Hustles That Actually Work',        'https://picsum.photos/seed/jay3/640/360', now()-interval '13 days', 18000, 1200, 160, '9:55',  7.6),
  (sa_jay, uid_jay, 'jay_v4', 'Debt Payoff Plan â€” Step by Step',        'https://picsum.photos/seed/jay4/640/360', now()-interval '18 days', 14000,  900, 130, '12:18', 7.4),
  (sa_jay, uid_jay, 'jay_v5', 'My Investing Portfolio Breakdown',       'https://picsum.photos/seed/jay5/640/360', now()-interval '23 days', 22000, 1500, 210, '16:20', 7.8),
  (sa_jay, uid_jay, 'jay_v6', 'How I Track Spending Monthly',           'https://picsum.photos/seed/jay6/640/360', now()-interval '27 days', 12000,  800, 110, '10:02', 7.5),

  (sa_rena, uid_rena, 'rena_v1', 'Half Marathon Training Plan',         'https://picsum.photos/seed/rena1/640/360', now()-interval '2 days',  9000,  620,  80, '18:10', 7.8),
  (sa_rena, uid_rena, 'rena_v2', '5K Speed Workout',                    'https://picsum.photos/seed/rena2/640/360', now()-interval '7 days',  7600,  520,  70, '9:20',  7.7),
  (sa_rena, uid_rena, 'rena_v3', 'Best Shoes for Long Runs',            'https://picsum.photos/seed/rena3/640/360', now()-interval '12 days', 8400,  580,  90, '11:45', 7.9),
  (sa_rena, uid_rena, 'rena_v4', 'Recovery Day Routine',                'https://picsum.photos/seed/rena4/640/360', now()-interval '17 days', 6900,  460,  60, '8:05',  7.5),
  (sa_rena, uid_rena, 'rena_v5', 'Tempo Run Explained',                 'https://picsum.photos/seed/rena5/640/360', now()-interval '21 days', 7200,  480,  65, '10:30', 7.4),
  (sa_rena, uid_rena, 'rena_v6', 'Fueling for Endurance',               'https://picsum.photos/seed/rena6/640/360', now()-interval '26 days', 6400,  420,  55, '7:58',  7.4),

  (sa_zoe, uid_zoe, 'zoe_v1', 'Spring Lookbook 2026',                   'https://picsum.photos/seed/zoe1/640/360', now()-interval '3 days',  52000, 3600, 410, '12:50', 7.7),
  (sa_zoe, uid_zoe, 'zoe_v2', 'Street Style on a Budget',               'https://picsum.photos/seed/zoe2/640/360', now()-interval '7 days',  47000, 3200, 380, '10:18', 7.6),
  (sa_zoe, uid_zoe, 'zoe_v3', 'Closet Clean-out Tips',                  'https://picsum.photos/seed/zoe3/640/360', now()-interval '11 days', 43000, 2900, 340, '9:45',  7.4),
  (sa_zoe, uid_zoe, 'zoe_v4', 'What I Wore This Week',                  'https://picsum.photos/seed/zoe4/640/360', now()-interval '16 days', 39000, 2600, 310, '8:55',  7.4),
  (sa_zoe, uid_zoe, 'zoe_v5', 'Style Mistakes to Avoid',                'https://picsum.photos/seed/zoe5/640/360', now()-interval '22 days', 35000, 2400, 280, '11:32', 7.6),
  (sa_zoe, uid_zoe, 'zoe_v6', 'PureGlow Routine + Outfit',              'https://picsum.photos/seed/zoe6/640/360', now()-interval '27 days', 41000, 2750, 330, '13:05', 7.6),

  (sa_dan, uid_dan, 'dan_v1', 'Crypto Market Recap',                    'https://picsum.photos/seed/dan1/640/360', now()-interval '2 days',  22000, 1500, 190, '12:40', 7.7),
  (sa_dan, uid_dan, 'dan_v2', 'DeFi Basics for Beginners',              'https://picsum.photos/seed/dan2/640/360', now()-interval '6 days',  18000, 1200, 160, '14:10', 7.6),
  (sa_dan, uid_dan, 'dan_v3', 'NFTs in 2026 â€” still worth it?',          'https://picsum.photos/seed/dan3/640/360', now()-interval '11 days', 16000, 1050, 150, '10:50', 7.5),
  (sa_dan, uid_dan, 'dan_v4', 'Risk Management Rules',                  'https://picsum.photos/seed/dan4/640/360', now()-interval '17 days', 14000,  900, 120, '9:25',  7.3),
  (sa_dan, uid_dan, 'dan_v5', 'Portfolio Updates + Lessons',            'https://picsum.photos/seed/dan5/640/360', now()-interval '22 days', 17000, 1100, 145, '13:02', 7.4),
  (sa_dan, uid_dan, 'dan_v6', 'FinEdge App Walkthrough',                'https://picsum.photos/seed/dan6/640/360', now()-interval '27 days', 20000, 1400, 180, '11:15', 7.9),

  (sa_pixel, uid_pixel, 'pixel_v1', 'Best Cameras Under $1000',         'https://picsum.photos/seed/pixel1/640/360', now()-interval '4 days',  16000, 1100, 140, '15:30', 7.8),
  (sa_pixel, uid_pixel, 'pixel_v2', 'Lighting Setup for Creators',      'https://picsum.photos/seed/pixel2/640/360', now()-interval '8 days',  14000,  980, 120, '12:05', 7.9),
  (sa_pixel, uid_pixel, 'pixel_v3', 'Editing Workflow in 2026',         'https://picsum.photos/seed/pixel3/640/360', now()-interval '13 days', 12000,  820, 110, '10:42', 7.7),
  (sa_pixel, uid_pixel, 'pixel_v4', 'Lens Guide for Beginners',         'https://picsum.photos/seed/pixel4/640/360', now()-interval '18 days', 11000,  760,  95, '9:18',  7.7),
  (sa_pixel, uid_pixel, 'pixel_v5', 'Studio Tour + Gear',               'https://picsum.photos/seed/pixel5/640/360', now()-interval '23 days', 15000, 1050, 130, '14:04', 7.9),
  (sa_pixel, uid_pixel, 'pixel_v6', 'Top 5 Tripods Tested',             'https://picsum.photos/seed/pixel6/640/360', now()-interval '28 days',  9000,  600,  80, '8:20',  7.6),

  (sa_nadia, uid_nadia, 'nadia_v1', 'High-Protein Breakfasts',          'https://picsum.photos/seed/nadia1/640/360', now()-interval '2 days',  28000, 2100, 260, '10:12', 8.5),
  (sa_nadia, uid_nadia, 'nadia_v2', 'Meal Prep for Busy Weeks',         'https://picsum.photos/seed/nadia2/640/360', now()-interval '6 days',  24000, 1800, 220, '12:02', 8.4),
  (sa_nadia, uid_nadia, 'nadia_v3', 'Grocery Haul + Nutrition Tips',     'https://picsum.photos/seed/nadia3/640/360', now()-interval '11 days', 20000, 1500, 190, '9:35',  8.5),
  (sa_nadia, uid_nadia, 'nadia_v4', 'Healthy Snacks I Love',            'https://picsum.photos/seed/nadia4/640/360', now()-interval '16 days', 18000, 1300, 160, '8:18',  8.3),
  (sa_nadia, uid_nadia, 'nadia_v5', 'Hydration & Recovery',             'https://picsum.photos/seed/nadia5/640/360', now()-interval '21 days', 16000, 1100, 140, '7:50',  8.1),
  (sa_nadia, uid_nadia, 'nadia_v6', 'Macro Basics in 15 Minutes',       'https://picsum.photos/seed/nadia6/640/360', now()-interval '26 days', 19000, 1400, 170, '14:20', 8.3)
 on conflict (account_id, video_id) do nothing;


-- â”€â”€ Campaigns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into campaigns (id, brand_user_id, title, description, niche, budget, deliverables, deadline, status, created_at)
values
  ('33333333-0003-0003-0003-000000000001'::uuid, uid_nova, 'Q1 Product Launch',          'Promote our new NovaTech X1 device to tech-savvy audiences.',          'tech_gaming',      5000, '1 dedicated video (min 8 min) + 2 community posts', current_date - 14, 'active',    now()-interval '20 days'),
  ('33333333-0003-0003-0003-000000000002'::uuid, uid_glow, 'Spring Glow Campaign',       'Showcase our new Spring collection skincare routine.',                  'beauty_fashion',   8000, '1 tutorial video featuring PureGlow products',       current_date - 7,  'active',    now()-interval '15 days'),
  ('33333333-0003-0003-0003-000000000003'::uuid, uid_fin,  'Invest Smarter with FinEdge','Review and demo our investment tracking app.',                          'finance_business', 3000, '1 app review video + pinned comment with promo link', current_date - 21, 'completed', now()-interval '30 days')
on conflict (id) do nothing;

select '33333333-0003-0003-0003-000000000001'::uuid into camp1_id;
select '33333333-0003-0003-0003-000000000002'::uuid into camp2_id;
select '33333333-0003-0003-0003-000000000003'::uuid into camp3_id;

-- â”€â”€ Invitations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into campaign_invitations (id, campaign_id, creator_user_id, status, message, invited_at, responded_at)
values
  ('44444444-0004-0004-0004-000000000001'::uuid, camp1_id, uid_alex,  'accepted', 'We love your tech content â€” perfect fit!',          now()-interval '20 days', now()-interval '18 days'),
  ('44444444-0004-0004-0004-000000000002'::uuid, camp1_id, uid_kai,   'accepted', 'Your gaming audience is our target demo.',           now()-interval '20 days', now()-interval '18 days'),
  ('44444444-0004-0004-0004-000000000003'::uuid, camp1_id, uid_pixel, 'declined', 'Would love your PixelPro perspective.',              now()-interval '20 days', now()-interval '17 days'),
  ('44444444-0004-0004-0004-000000000004'::uuid, camp1_id, uid_jay,   'pending',  'Your finance-tech crossover is unique.',             now()-interval '19 days', null),
  ('44444444-0004-0004-0004-000000000005'::uuid, camp2_id, uid_mia,   'accepted', 'Your glow content is stunning!',                    now()-interval '15 days', now()-interval '13 days'),
  ('44444444-0004-0004-0004-000000000006'::uuid, camp2_id, uid_zoe,   'accepted', 'StyleByZoe + PureGlow = perfect match.',            now()-interval '15 days', now()-interval '13 days'),
  ('44444444-0004-0004-0004-000000000007'::uuid, camp2_id, uid_sarah, 'pending',  'We think your audience would love this.',           now()-interval '14 days', null),
  ('44444444-0004-0004-0004-000000000008'::uuid, camp3_id, uid_jay,   'accepted', 'FinEdge aligns perfectly with your content.',       now()-interval '30 days', now()-interval '28 days'),
  ('44444444-0004-0004-0004-000000000009'::uuid, camp3_id, uid_dan,   'accepted', 'Your crypto audience needs FinEdge.',               now()-interval '30 days', now()-interval '28 days')
on conflict (campaign_id, creator_user_id) do nothing;

-- â”€â”€ Campaign videos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into campaign_videos (campaign_id, invitation_id, creator_user_id, video_id, video_url, title, thumbnail_url, views, likes, comments, engagement_rate, submitted_at)
values
  (camp1_id, '44444444-0004-0004-0004-000000000001'::uuid, uid_alex, 'yt_nova_alex', 'https://youtube.com/watch?v=nova_alex', 'NovaTech X1 â€” Honest Review After 2 Weeks',        'https://picsum.photos/seed/nova1/640/360', 52000,  3100, 287,  6.5, now()-interval '10 days'),
  (camp1_id, '44444444-0004-0004-0004-000000000002'::uuid, uid_kai,  'yt_nova_kai',  'https://youtube.com/watch?v=nova_kai',  'I Used NovaTech X1 for 30 Days â€” Here''s What Happened', 'https://picsum.photos/seed/nova2/640/360', 138000, 9800, 1420, 8.1, now()-interval '8 days'),
  (camp2_id, '44444444-0004-0004-0004-000000000005'::uuid, uid_mia,  'yt_glow_mia',  'https://youtube.com/watch?v=glow_mia',  'My Spring Skincare Routine ft. PureGlow',          'https://picsum.photos/seed/glow1/640/360', 84000,  6200, 743,  8.3, now()-interval '5 days'),
  (camp3_id, '44444444-0004-0004-0004-000000000008'::uuid, uid_jay,  'yt_fin_jay',   'https://youtube.com/watch?v=fin_jay',   'FinEdge App Review â€” Is It Worth It?',             'https://picsum.photos/seed/fin1/640/360',  21000,  1100, 198,  6.2, now()-interval '15 days'),
  (camp3_id, '44444444-0004-0004-0004-000000000009'::uuid, uid_dan,  'yt_fin_dan',   'https://youtube.com/watch?v=fin_dan',   'Track Your Crypto Portfolio with FinEdge',         'https://picsum.photos/seed/fin2/640/360',  33000,  2400, 312,  8.2, now()-interval '12 days');

-- Extra campaign video for Zoe (idempotent)
insert into campaign_videos (campaign_id, invitation_id, creator_user_id, video_id, video_url, title, thumbnail_url, views, likes, comments, engagement_rate, submitted_at)
select camp2_id, '44444444-0004-0004-0004-000000000006'::uuid, uid_zoe, 'yt_glow_zoe', 'https://youtube.com/watch?v=glow_zoe',
       'StyleByZoe + PureGlow: My Daily Routine', 'https://picsum.photos/seed/glow2/640/360', 69000, 4800, 560, 8.0, now()-interval '4 days'
where not exists (
  select 1 from campaign_videos where campaign_id = camp2_id and creator_user_id = uid_zoe and video_id = 'yt_glow_zoe'
);

raise notice 'Seed complete: 10 creators, 3 brands, 3 campaigns, 9 invitations, 6 videos';
end $$;
