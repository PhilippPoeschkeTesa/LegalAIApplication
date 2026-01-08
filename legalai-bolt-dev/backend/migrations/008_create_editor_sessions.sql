/*
  # Create ONLYOFFICE Editor Sessions Table

  Tracks active editor sessions for document collaboration
*/

CREATE TABLE IF NOT EXISTS editor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  version_id uuid NOT NULL,
  user_id uuid NOT NULL,
  session_key text UNIQUE NOT NULL,
  onlyoffice_key text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now(),
  CONSTRAINT fk_editor_sessions_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_editor_sessions_version FOREIGN KEY (version_id) REFERENCES document_versions(id) ON DELETE CASCADE,
  CONSTRAINT fk_editor_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_editor_sessions_user_id ON editor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_editor_sessions_expires_at ON editor_sessions(expires_at);
