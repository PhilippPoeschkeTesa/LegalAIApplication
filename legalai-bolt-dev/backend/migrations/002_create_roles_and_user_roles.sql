/*
  # Create roles and user_roles tables for RBAC

  1. New Tables
    - `roles`
      - `id` (uuid, primary key) - Unique identifier for each role
      - `name` (text, unique, not null) - Role name (e.g., Legal Admin, Department Admin)
      - `description` (text) - Description of the role and its permissions
      - `permissions` (jsonb) - JSON object containing permission flags
      - `is_active` (boolean) - Whether the role is currently active
      - `created_at` (timestamptz) - Timestamp when role was created
      - `updated_at` (timestamptz) - Timestamp when role was last updated

    - `user_roles`
      - `id` (uuid, primary key) - Unique identifier for the mapping
      - `user_id` (uuid, foreign key) - References users table
      - `role_id` (uuid, foreign key) - References roles table
      - `assigned_at` (timestamptz) - Timestamp when role was assigned
      - `assigned_by` (uuid) - User ID who assigned this role
      - `is_active` (boolean) - Whether this assignment is active

  2. Important Notes
    - Four predefined roles: Platform Administrator, Legal Admin, Department Admin, Department User
    - User-role mapping allows multiple roles per user
    - Uses UUID for all primary and foreign keys
    - Cascading deletes for referential integrity
    - Unique constraint on user_id + role_id to prevent duplicate assignments
*/

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid,
  is_active boolean DEFAULT true,
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);


INSERT INTO roles (name, description, permissions) VALUES
  ('Platform Administrator', 'Full system access with ability to manage all users, roles, and system settings',
   '{"users": {"create": true, "read": true, "update": true, "delete": true}, "roles": {"create": true, "read": true, "update": true, "delete": true}, "departments": {"create": true, "read": true, "update": true, "delete": true}, "system": {"configure": true, "monitor": true}}'::jsonb),

  ('Legal Admin', 'Legal department administrator with access to all legal documents, contracts, and team management',
   '{"documents": {"create": true, "read": true, "update": true, "delete": true}, "contracts": {"create": true, "read": true, "update": true, "delete": true, "approve": true}, "team": {"manage": true}, "analytics": {"view": true}}'::jsonb),

  ('Department Admin', 'Department-level administrator with access to department-specific resources and user management',
   '{"documents": {"create": true, "read": true, "update": true, "delete": false}, "contracts": {"create": true, "read": true, "update": true, "delete": false, "submit": true}, "team": {"view": true, "assign": true}, "analytics": {"view": true}}'::jsonb),

  ('Department User', 'Standard user with basic access to assigned documents and contracts',
   '{"documents": {"create": true, "read": true, "update": false, "delete": false}, "contracts": {"create": true, "read": true, "update": false, "delete": false}, "analytics": {"view": false}}'::jsonb)
ON CONFLICT (name) DO NOTHING;
