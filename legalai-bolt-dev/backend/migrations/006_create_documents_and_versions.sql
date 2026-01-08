/*
  # Create Documents and Document Versions Tables

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `title` (text, not null) - Document title
      - `owner_id` (uuid, foreign key) - References users table
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `tags` (text[]) - Array of tags
      - `confidentiality_level` (text) - public/internal/confidential/restricted
      - `metadata` (jsonb) - Additional metadata

    - `document_versions`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key) - References documents table
      - `version_number` (integer, not null) - Version number (1, 2, 3...)
      - `file_type` (text, not null) - docx, pdf
      - `blob_url` (text, not null) - Azure Blob Storage URL
      - `file_size` (bigint) - File size in bytes
      - `created_by` (uuid, foreign key) - References users table
      - `created_at` (timestamptz)
      - `is_current` (boolean) - True for latest version
      - `change_summary` (text) - What changed in this version

  2. Indexes
    - document_id for fast version lookup
    - owner_id for user's documents
    - is_current for fetching latest versions
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  owner_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  tags text[] DEFAULT '{}',
  confidentiality_level text DEFAULT 'internal' CHECK (confidentiality_level IN ('public', 'internal', 'confidential', 'restricted')),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT fk_documents_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  version_number integer NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('docx', 'pdf')),
  blob_url text NOT NULL,
  file_size bigint,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_current boolean DEFAULT true,
  change_summary text,
  CONSTRAINT fk_document_versions_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_document_versions_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_document_version UNIQUE (document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_is_current ON document_versions(is_current);
