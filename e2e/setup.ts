/**
 * Global setup for both API and UI E2E tests
 * This file initializes the test database and creates necessary test users
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Test user constants - keep in sync with jest.setup.ts and playwright tests
const API_TEST_USER = {
  email: 'apitest@example.com',
  nickname: 'apitest',
  password: 'password123'
};

const UI_TEST_USER = {
  email: 'uitest@example.com',
  nickname: 'uitest',
  password: 'password123'
};

async function globalSetup() {
  // Load test environment variables
  dotenv.config({ path: '.env.test' });

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };

  const pool = new Pool(config);

  try {
    // Note: Instead of dropping all tables, we now only remove test-specific data
    // This is safer for running tests against shared databases
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', 
      [API_TEST_USER.email, UI_TEST_USER.email]);
    console.log('Existing test users cleaned up successfully');

    // Read and execute schema (tables will only be created if they don't exist)
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);
    console.log('Test database schema verified successfully');

    // Create test users with bcrypt hashed password
    const hashedPassword = await bcrypt.hash(API_TEST_USER.password, 10);
    
    // Create API test user
    await pool.query(
      'INSERT INTO users (id, nickname, email, password) VALUES (gen_random_uuid(), $1, $2, $3)',
      [API_TEST_USER.nickname, API_TEST_USER.email, hashedPassword]
    );

    // Create UI test user
    await pool.query(
      'INSERT INTO users (id, nickname, email, password) VALUES (gen_random_uuid(), $1, $2, $3)',
      [UI_TEST_USER.nickname, UI_TEST_USER.email, hashedPassword]
    );
    
    console.log('Test users created successfully');

  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

export default globalSetup; 