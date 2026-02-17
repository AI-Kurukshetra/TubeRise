-- ============================================================
-- TubeRise — Video snapshots for remaining 7 creators
-- ============================================================

do $$
declare
  uid_sarah   uuid := '11111111-0001-0001-0001-000000000002';
  uid_jay     uuid := '11111111-0001-0001-0001-000000000004';
  uid_rena    uuid := '11111111-0001-0001-0001-000000000006';
  uid_zoe     uuid := '11111111-0001-0001-0001-000000000007';
  uid_dan     uuid := '11111111-0001-0001-0001-000000000008';
  uid_pixel   uuid := '11111111-0001-0001-0001-000000000009';
  uid_nadia   uuid := '11111111-0001-0001-0001-000000000010';
  sa_sarah    uuid; sa_jay   uuid; sa_rena  uuid; sa_zoe   uuid;
  sa_dan      uuid; sa_pixel uuid; sa_nadia uuid;
begin

  select id into sa_sarah from social_accounts where user_id = uid_sarah limit 1;
  select id into sa_jay   from social_accounts where user_id = uid_jay   limit 1;
  select id into sa_rena  from social_accounts where user_id = uid_rena  limit 1;
  select id into sa_zoe   from social_accounts where user_id = uid_zoe   limit 1;
  select id into sa_dan   from social_accounts where user_id = uid_dan   limit 1;
  select id into sa_pixel from social_accounts where user_id = uid_pixel limit 1;
  select id into sa_nadia from social_accounts where user_id = uid_nadia limit 1;

  insert into video_snapshots (account_id, user_id, video_id, title, thumbnail_url, published_at, views, likes, comments, duration, engagement_rate) values
    -- FitLifeSarah (89K subs, 32K avg_views, 6.1% eng)
    (sa_sarah, uid_sarah, 'sarah_v1', 'My 30-day fitness transformation',           'https://picsum.photos/seed/sarah1/640/360', now()-interval '2 days',  35000, 2800, 412, '18:22', 9.2),
    (sa_sarah, uid_sarah, 'sarah_v2', 'Full body workout — no equipment needed',    'https://picsum.photos/seed/sarah2/640/360', now()-interval '7 days',  29000, 2100, 310, '22:05', 8.3),
    (sa_sarah, uid_sarah, 'sarah_v3', 'What I eat in a day — high protein meals',   'https://picsum.photos/seed/sarah3/640/360', now()-interval '12 days', 38000, 3200, 520, '14:40', 9.7),
    (sa_sarah, uid_sarah, 'sarah_v4', '5 mistakes beginners make at the gym',       'https://picsum.photos/seed/sarah4/640/360', now()-interval '17 days', 31000, 2400, 380, '11:15', 8.9),
    (sa_sarah, uid_sarah, 'sarah_v5', 'Morning routine for energy all day',         'https://picsum.photos/seed/sarah5/640/360', now()-interval '22 days', 27000, 1900, 290, '9:48',  7.9),
    (sa_sarah, uid_sarah, 'sarah_v6', 'My home gym setup tour',                     'https://picsum.photos/seed/sarah6/640/360', now()-interval '27 days', 33000, 2600, 440, '16:30', 9.4),

    -- WealthBuilderJay (56K subs, 18K avg_views, 3.9% eng)
    (sa_jay, uid_jay, 'jay_v1', 'How I saved $50K by age 30',                       'https://picsum.photos/seed/jay1/640/360', now()-interval '2 days',  21000, 1100, 198, '19:44', 6.2),
    (sa_jay, uid_jay, 'jay_v2', 'Index funds explained for beginners',              'https://picsum.photos/seed/jay2/640/360', now()-interval '7 days',  17000,  820, 142, '14:22', 5.7),
    (sa_jay, uid_jay, 'jay_v3', 'My net worth update — 2026',                       'https://picsum.photos/seed/jay3/640/360', now()-interval '12 days', 24000, 1400, 280, '22:10', 7.0),
    (sa_jay, uid_jay, 'jay_v4', 'Best high-yield savings accounts right now',       'https://picsum.photos/seed/jay4/640/360', now()-interval '17 days', 15000,  710, 118, '11:05', 5.5),
    (sa_jay, uid_jay, 'jay_v5', 'Budgeting with the 50/30/20 rule',                 'https://picsum.photos/seed/jay5/640/360', now()-interval '22 days', 19000,  980, 162, '16:38', 6.0),
    (sa_jay, uid_jay, 'jay_v6', 'Should you pay off debt or invest first?',         'https://picsum.photos/seed/jay6/640/360', now()-interval '27 days', 22000, 1200, 214, '18:55', 6.4),

    -- RunWithRena (34K subs, 12K avg_views, 5.4% eng)
    (sa_rena, uid_rena, 'rena_v1', 'How I trained for my first marathon',           'https://picsum.photos/seed/rena1/640/360', now()-interval '2 days',  13000,  890, 180, '24:15', 8.2),
    (sa_rena, uid_rena, 'rena_v2', '5K to 10K — 8 week training plan',              'https://picsum.photos/seed/rena2/640/360', now()-interval '7 days',  11000,  720, 145, '18:42', 7.9),
    (sa_rena, uid_rena, 'rena_v3', 'Best running shoes of 2026 — full review',      'https://picsum.photos/seed/rena3/640/360', now()-interval '12 days', 14000,  980, 220, '15:30', 8.6),
    (sa_rena, uid_rena, 'rena_v4', 'My race day nutrition strategy',                'https://picsum.photos/seed/rena4/640/360', now()-interval '17 days', 10000,  640, 130, '12:10', 7.7),
    (sa_rena, uid_rena, 'rena_v5', 'Running for weight loss — what actually works', 'https://picsum.photos/seed/rena5/640/360', now()-interval '22 days', 15000, 1100, 240, '20:05', 8.9),
    (sa_rena, uid_rena, 'rena_v6', 'Post-run recovery routine',                     'https://picsum.photos/seed/rena6/640/360', now()-interval '27 days', 12000,  820, 168, '11:48', 8.2),

    -- StyleByZoe (178K subs, 62K avg_views, 6.7% eng)
    (sa_zoe, uid_zoe, 'zoe_v1', 'Spring outfit ideas — 10 looks under $100',        'https://picsum.photos/seed/zoe1/640/360', now()-interval '2 days',  68000, 5800, 820, '16:30', 9.7),
    (sa_zoe, uid_zoe, 'zoe_v2', 'How to dress for your body type',                  'https://picsum.photos/seed/zoe2/640/360', now()-interval '7 days',  59000, 4900, 710, '21:15', 9.5),
    (sa_zoe, uid_zoe, 'zoe_v3', 'Thrift flip challenge — $20 budget',               'https://picsum.photos/seed/zoe3/640/360', now()-interval '12 days', 74000, 6400, 980, '18:44', 9.9),
    (sa_zoe, uid_zoe, 'zoe_v4', 'Capsule wardrobe essentials for 2026',             'https://picsum.photos/seed/zoe4/640/360', now()-interval '17 days', 55000, 4500, 640, '14:22', 9.3),
    (sa_zoe, uid_zoe, 'zoe_v5', 'Styling the same piece 7 different ways',          'https://picsum.photos/seed/zoe5/640/360', now()-interval '22 days', 62000, 5200, 740, '12:58', 9.6),
    (sa_zoe, uid_zoe, 'zoe_v6', 'My fashion week highlights',                       'https://picsum.photos/seed/zoe6/640/360', now()-interval '27 days', 49000, 3900, 560, '10:35', 9.1),

    -- CryptoWithDan (92K subs, 28K avg_views, 4.5% eng)
    (sa_dan, uid_dan, 'dan_v1', 'Bitcoin or Ethereum — which in 2026?',             'https://picsum.photos/seed/dan1/640/360', now()-interval '2 days',  31000, 1800, 280, '22:14', 6.7),
    (sa_dan, uid_dan, 'dan_v2', 'DeFi explained in 10 minutes',                     'https://picsum.photos/seed/dan2/640/360', now()-interval '7 days',  26000, 1400, 210, '10:05', 6.2),
    (sa_dan, uid_dan, 'dan_v3', 'My crypto portfolio — full breakdown',             'https://picsum.photos/seed/dan3/640/360', now()-interval '12 days', 35000, 2100, 340, '28:30', 7.0),
    (sa_dan, uid_dan, 'dan_v4', 'Top altcoins to watch — Q1 2026',                  'https://picsum.photos/seed/dan4/640/360', now()-interval '17 days', 28000, 1600, 250, '18:22', 6.6),
    (sa_dan, uid_dan, 'dan_v5', 'How to store crypto safely',                       'https://picsum.photos/seed/dan5/640/360', now()-interval '22 days', 22000, 1200, 188, '14:48', 6.3),
    (sa_dan, uid_dan, 'dan_v6', 'I lost money on crypto — here is what I learned',  'https://picsum.photos/seed/dan6/640/360', now()-interval '27 days', 38000, 2400, 420, '24:10', 7.4),

    -- PixelPro (67K subs, 22K avg_views, 5.1% eng)
    (sa_pixel, uid_pixel, 'pixel_v1', 'Best camera for YouTube in 2026',            'https://picsum.photos/seed/pixel1/640/360', now()-interval '2 days',  24000, 1500, 230, '20:18', 7.2),
    (sa_pixel, uid_pixel, 'pixel_v2', 'Sony vs Canon — which should you buy?',      'https://picsum.photos/seed/pixel2/640/360', now()-interval '7 days',  20000, 1200, 180, '16:42', 6.9),
    (sa_pixel, uid_pixel, 'pixel_v3', 'Lighting setup under $500',                  'https://picsum.photos/seed/pixel3/640/360', now()-interval '12 days', 27000, 1800, 280, '14:55', 7.6),
    (sa_pixel, uid_pixel, 'pixel_v4', 'My full camera bag — what I carry',          'https://picsum.photos/seed/pixel4/640/360', now()-interval '17 days', 19000, 1100, 160, '12:30', 6.7),
    (sa_pixel, uid_pixel, 'pixel_v5', 'Cinematic video on a budget',                'https://picsum.photos/seed/pixel5/640/360', now()-interval '22 days', 23000, 1400, 210, '18:44', 7.0),
    (sa_pixel, uid_pixel, 'pixel_v6', 'Editing workflow for YouTube creators',      'https://picsum.photos/seed/pixel6/640/360', now()-interval '27 days', 21000, 1300, 195, '22:12', 7.1),

    -- NutritionNadia (115K subs, 38K avg_views, 5.9% eng)
    (sa_nadia, uid_nadia, 'nadia_v1', 'What a registered dietitian eats in a day',  'https://picsum.photos/seed/nadia1/640/360', now()-interval '2 days',  42000, 3200, 510, '16:20', 8.9),
    (sa_nadia, uid_nadia, 'nadia_v2', 'Meal prep for the whole week — under $80',   'https://picsum.photos/seed/nadia2/640/360', now()-interval '7 days',  36000, 2700, 430, '22:44', 8.7),
    (sa_nadia, uid_nadia, 'nadia_v3', 'Debunking viral diet myths',                 'https://picsum.photos/seed/nadia3/640/360', now()-interval '12 days', 48000, 3800, 620, '18:15', 9.2),
    (sa_nadia, uid_nadia, 'nadia_v4', 'High protein recipes — 30g+ per serving',    'https://picsum.photos/seed/nadia4/640/360', now()-interval '17 days', 39000, 3000, 490, '14:38', 8.9),
    (sa_nadia, uid_nadia, 'nadia_v5', 'Are supplements actually worth it?',         'https://picsum.photos/seed/nadia5/640/360', now()-interval '22 days', 33000, 2400, 380, '20:05', 8.4),
    (sa_nadia, uid_nadia, 'nadia_v6', 'How to read nutrition labels correctly',     'https://picsum.photos/seed/nadia6/640/360', now()-interval '27 days', 35000, 2600, 415, '11:52', 8.6)
  on conflict (account_id, video_id) do nothing;

  raise notice 'Video snapshots added for 7 remaining creators';
end $$;
