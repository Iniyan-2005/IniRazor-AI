-- ============================================================
-- 003_fix_settlement_grants.sql
-- Enforce minimum privileges on the settlements table
-- ============================================================

-- 1. Revoke all privileges from public/anon/authenticated/service_role
REVOKE ALL ON settlements FROM anon, authenticated, service_role;

-- 2. Grant full CRUD exclusively to service_role (Edge Functions)
GRANT SELECT, INSERT, UPDATE, DELETE ON settlements TO service_role;

-- 3. Grant read-only access to authenticated users
GRANT SELECT ON settlements TO authenticated;

-- 4. Explicitly ensure anon has no access
-- (Already handled by REVOKE ALL, but good for self-documentation)
