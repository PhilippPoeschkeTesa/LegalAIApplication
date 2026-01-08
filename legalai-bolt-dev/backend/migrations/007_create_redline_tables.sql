/*
  # Create Redlining Pipeline Tables

  1. New Tables
    - `redline_runs`
      - Tracks each redlining analysis run
      - Status: queued, running, completed, failed
      - Stores model configuration used

    - `findings`
      - Individual issues found during redlining
      - Severity: High, Medium, Low
      - Verification status: unverified, verified_safe, verified_risky
      - Location tracking (page, start/end offsets)

    - `user_decisions`
      - User actions on findings
      - Action: accept, reject, edited, ask_followup
      - Stores final text if edited
*/

CREATE TABLE IF NOT EXISTS redline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  version_id uuid NOT NULL,
  profile_id text DEFAULT 'default',
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  started_at timestamptz,
  finished_at timestamptz,
  primary_model text,
  verifier_model text,
  error_message text,
  overall_risk_score integer CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_redline_runs_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_redline_runs_version FOREIGN KEY (version_id) REFERENCES document_versions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL,
  severity text NOT NULL CHECK (severity IN ('High', 'Medium', 'Low')),
  score integer CHECK (score >= 0 AND score <= 100),
  category text NOT NULL,
  location_page integer,
  location_start_offset integer,
  location_end_offset text,
  evidence_snippet text,
  evidence_policy_ref text,
  evidence_rationale text,
  suggestion_proposed_rewrite text,
  verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified_safe', 'verified_risky')),
  verifier_notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_findings_run FOREIGN KEY (run_id) REFERENCES redline_runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('accept', 'reject', 'edited', 'ask_followup')),
  final_text text,
  comment text,
  timestamp timestamptz DEFAULT now(),
  CONSTRAINT fk_user_decisions_finding FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_decisions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_redline_runs_document_id ON redline_runs(document_id);
CREATE INDEX IF NOT EXISTS idx_redline_runs_status ON redline_runs(status);
CREATE INDEX IF NOT EXISTS idx_findings_run_id ON findings(run_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);
CREATE INDEX IF NOT EXISTS idx_user_decisions_finding_id ON user_decisions(finding_id);
