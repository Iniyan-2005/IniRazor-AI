-- ============================================================
-- IniRazorAI — Database Schema Migration
-- Razorpay AI Buildathon — Track 04: AI Finance Controller
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'captured',
  customer_name TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  ground_truth_status TEXT -- Used ONLY for evaluation, never sent to AI
);

-- Indexes
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- ============================================================
-- 2. SETTLEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  settlement_id TEXT UNIQUE NOT NULL,
  payment_id TEXT NOT NULL REFERENCES payments(payment_id) ON DELETE CASCADE,
  gross_amount DECIMAL(12, 2) NOT NULL,
  fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  adjustment DECIMAL(12, 2) NOT NULL DEFAULT 0,
  refund DECIMAL(12, 2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'settled',
  settled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_settlements_payment_id ON settlements(payment_id);
CREATE INDEX idx_settlements_settlement_id ON settlements(settlement_id);
CREATE INDEX idx_settlements_status ON settlements(status);

-- ============================================================
-- 3. RECONCILIATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reconciliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT NOT NULL REFERENCES payments(payment_id) ON DELETE CASCADE,
  settlement_id TEXT,
  expected_amount DECIMAL(12, 2),
  actual_amount DECIMAL(12, 2),
  difference DECIMAL(12, 2),
  status TEXT NOT NULL DEFAULT 'PENDING',
  confidence DECIMAL(5, 4) DEFAULT 0,
  reason TEXT,
  ai_analysis JSONB,
  recommended_action TEXT,
  final_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reconciliations_payment_id ON reconciliations(payment_id);
CREATE INDEX idx_reconciliations_settlement_id ON reconciliations(settlement_id);
CREATE INDEX idx_reconciliations_status ON reconciliations(status);
CREATE INDEX idx_reconciliations_created_at ON reconciliations(created_at);

-- ============================================================
-- 4. AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reconciliation_id UUID REFERENCES reconciliations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'SYSTEM',
  action TEXT,
  input_snapshot JSONB,
  reasoning TEXT,
  decision TEXT,
  confidence DECIMAL(5, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_reconciliation_id ON audit_logs(reconciliation_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- 5. EVALUATION RESULTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reconciliation_id UUID REFERENCES reconciliations(id) ON DELETE CASCADE,
  ground_truth TEXT NOT NULL,
  predicted_result TEXT NOT NULL,
  correct BOOLEAN NOT NULL DEFAULT FALSE,
  false_positive BOOLEAN NOT NULL DEFAULT FALSE,
  false_negative BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_evaluation_reconciliation_id ON evaluation_results(reconciliation_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results ENABLE ROW LEVEL SECURITY;

-- Public read access (authenticated users can read)
CREATE POLICY "Allow authenticated read on payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on settlements"
  ON settlements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on reconciliations"
  ON reconciliations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on audit_logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on evaluation_results"
  ON evaluation_results FOR SELECT
  TO authenticated
  USING (true);

-- Write access only via service role (Edge Functions)
-- No INSERT/UPDATE/DELETE policies for anon/authenticated
-- All writes happen through Edge Functions using service_role key

-- Service role bypass (for Edge Functions)
CREATE POLICY "Service role full access on payments"
  ON payments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on settlements"
  ON settlements FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on reconciliations"
  ON reconciliations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on audit_logs"
  ON audit_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on evaluation_results"
  ON evaluation_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reconciliations_updated_at
  BEFORE UPDATE ON reconciliations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
