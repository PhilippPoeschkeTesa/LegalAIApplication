-- Migration: Create user_permissions table
-- This table stores custom permissions for each user (route-level access control)

CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, permission_key)
);

-- Create index for faster lookups
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);

-- Add comments
COMMENT ON TABLE user_permissions IS 'Stores custom route/tab permissions for users';
COMMENT ON COLUMN user_permissions.permission_key IS 'Route identifier (e.g., home, legalai, admin, etc.)';

-- Example data
-- INSERT INTO user_permissions (user_id, permission_key) 
-- VALUES 
--   ('user-uuid-here', 'home'),
--   ('user-uuid-here', 'legalai'),
--   ('user-uuid-here', 'review');
