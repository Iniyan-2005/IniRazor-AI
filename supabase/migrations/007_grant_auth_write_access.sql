-- ============================================================
-- 007_grant_auth_write_access.sql
-- Grant INSERT and UPDATE privileges to authenticated users
-- so that Edge Functions acting on their behalf can upsert data.
-- Row Level Security (RLS) policies added in 006 still ensure
-- users can only modify their owan rows.
-- ============================================================

GRANT INSERT, UPDATE, DELETE ON payments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON settlements TO authenticated;
GRANT INSERT, UPDATE, DELETE ON reconciliations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON audit_logs TO authenticated;
