require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration(migrationFile) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log(`Connecting to database ${process.env.DB_NAME}...`);
    await client.connect();
    console.log('Connected successfully!');

    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    console.log(`Reading migration file: ${migrationPath}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`Executing migration: ${migrationFile}`);
    await client.query(sql);
    console.log(`✓ Migration ${migrationFile} completed successfully!`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node run-migration.js <migration-file>');
  console.error('Example: node run-migration.js 005_create_user_permissions.sql');
  process.exit(1);
}

runMigration(migrationFile);
