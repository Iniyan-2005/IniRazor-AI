-- Phase 1.6: Enforce minimum privileges on payments table
-- These grants restrict base table access to the bare minimum required for the application to function.
-- Row Level Security (RLS) is additionally active on this table.

-- Revoke overly broad default privileges
REVOKE ALL ON payments FROM anon, authenticated, service_role;

-- Grant required privileges for Edge Functions (Service Role)
GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO service_role;

-- Grant required privileges for Frontend (Authenticated users)
GRANT SELECT ON payments TO authenticated;

-- Anon requires no privileges and remains fully revoked.
