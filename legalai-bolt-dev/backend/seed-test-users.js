/**
 * Script to seed test users with properly hashed passwords
 * Run this script to create test users for authentication testing
 * 
 * Usage: node seed-test-users.js
 * 
 * Make sure to set DATABASE_URL in your .env file
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testUsers = [
  {
    email: 'admin@tesa.com',
    password: 'password123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    email: 'viewer@tesa.com',
    password: 'password123',
    name: 'Viewer User',
    role: 'viewer',
  },
  {
    email: 'test@tesa.com',
    password: 'password123',
    name: 'Test User',
    role: 'viewer',
  },
];

async function seedUsers() {
  // Support both connection string and individual connection parameters
  const client = new Client(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
        }
      : {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        }
  );

  try {
    await client.connect();
    console.log('Connected to database');

    // Delete existing test users
    console.log('\nDeleting existing test users...');
    const emails = testUsers.map(u => u.email);
    await client.query(
      `DELETE FROM users WHERE email = ANY($1)`,
      [emails]
    );
    console.log('Existing test users deleted');

    // Insert new test users
    console.log('\nCreating test users...');
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await client.query(
        `INSERT INTO users (email, password, name, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [user.email, hashedPassword, user.name, user.role]
      );
      
      console.log(`✓ Created user: ${user.email} (role: ${user.role})`);
    }

    console.log('\n✅ Test users created successfully!');
    console.log('\nYou can now login with:');
    console.log('  Admin:  admin@tesa.com / password123');
    console.log('  Viewer: viewer@tesa.com / password123');
    console.log('  Test:   test@tesa.com / password123');

  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedUsers();
