-- ============================================================
-- Fix: Patch seeded auth.users with missing GoTrue fields
-- and add auth.identities rows for email/password login.
-- ============================================================

-- Step 1: Fix auth.users — add missing aud, role, instance_id
UPDATE auth.users
SET
  instance_id = '00000000-0000-0000-0000-000000000000',
  aud = 'authenticated',
  role = 'authenticated',
  is_super_admin = false,
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change = ''
WHERE email LIKE '%@tuberise.dev';

-- Step 2: Add auth.identities rows (required for signInWithPassword)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  id,
  id,
  json_build_object(
    'sub', id::text,
    'email', email,
    'email_verified', true
  )::jsonb,
  'email',
  id::text,
  now(),
  now(),
  now()
FROM auth.users
WHERE email LIKE '%@tuberise.dev'
ON CONFLICT DO NOTHING;
