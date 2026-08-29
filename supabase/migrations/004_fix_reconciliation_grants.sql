-- ============================================================
-- 004_fix_reconciliation_grants.sql
-- Enforce minimum privileges on the reconciliations table
-- ============================================================

-- 1. Revoke all privileges from public/anon/authenticated/service_role
REVOKE ALL ON reconciliations FROM anon, authenticated, service_role;

-- 2. Grant full CRUD exclusively to service_role (Edge Functions)
GRANT SELECT, INSERT, UPDATE, DELETE ON reconciliations TO service_role;

-- 3. Grant read-only access to authenticated users
GRANT SELECT ON reconciliations TO authenticated;
