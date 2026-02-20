-- ============================================================
-- Fix: Patch seeded auth.users with missing GoTrue fields
-- Without aud/role/instance_id, signInWithPassword returns 400
-- ============================================================

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
