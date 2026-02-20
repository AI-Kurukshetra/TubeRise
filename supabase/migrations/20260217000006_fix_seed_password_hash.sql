-- ============================================================
-- Fix: Correct the bcrypt password hash for seeded users
-- The original hash did not match 'Password123!'
-- New hash is a valid bcrypt hash for 'Password123!'
-- ============================================================

UPDATE auth.users
SET encrypted_password = '$2a$10$beHvi/iHAI1Dc95m4BtHGeNYFEC294eiyliX0VWSQC1qaOaDq4HH6'
WHERE email LIKE '%@tuberise.dev';
