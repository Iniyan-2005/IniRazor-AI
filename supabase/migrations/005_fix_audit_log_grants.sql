-- ============================================================  
-- 005_fix_audit_log_grants.sql  
-- Grant minimum required privileges on the audit_logs table.  
-- Migration 001 defined RLS policies but never issued explicit  
-- table-level GRANT statements. Without these grants,  
-- service_role and authenticated roles are denied access.  
-- ============================================================  
  
-- 1. Revoke all broad defaults first (defensive, idempotent)  
REVOKE ALL ON audit_logs FROM anon, authenticated, service_role;  
  
-- 2. Grant full CRUD to service_role (Edge Functions)  
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO service_role;  
  
-- 3. Grant read-only to authenticated users  
GRANT SELECT ON audit_logs TO authenticated; 
