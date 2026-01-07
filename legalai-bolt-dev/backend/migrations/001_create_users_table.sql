/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique identifier for each user
      - `email` (text, unique, not null) - User's email address
      - `password` (text, not null) - Hashed password using bcrypt
      - `name` (text, not null) - User's full name
      - `role` (text, not null) - User's role in the system
      - `created_at` (timestamptz) - Timestamp when user was created
      - `updated_at` (timestamptz) - Timestamp when user was last updated

  2. Important Notes
    - Email must be unique across all users
    - Password is stored as bcrypt hash
    - All fields except timestamps are required
    - Uses UUID for primary key with automatic generation
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
