-- Migration: Create test users for authentication
-- This script creates test users with different roles
-- Password for all users: 'password123'
-- Hashed using bcryptjs with salt rounds = 10

-- Insert admin user
-- Email: admin@tesa.com
-- Password: password123
-- Role: admin
INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@tesa.com',
  '$2a$10$YourHashedPasswordHere', -- This will be replaced by the script
  'Admin User',
  'admin',
  NOW(),
  NOW()
);

-- Insert viewer user
-- Email: viewer@tesa.com
-- Password: password123
-- Role: viewer
INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'viewer@tesa.com',
  '$2a$10$YourHashedPasswordHere', -- This will be replaced by the script
  'Viewer User',
  'viewer',
  NOW(),
  NOW()
);

-- Insert regular test user
-- Email: test@tesa.com
-- Password: password123
-- Role: viewer
INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test@tesa.com',
  '$2a$10$YourHashedPasswordHere', -- This will be replaced by the script
  'Test User',
  'viewer',
  NOW(),
  NOW()
);

-- Note: Run the seed-test-users.js script to generate proper hashed passwords
-- This SQL file is a template and should not be run directly
