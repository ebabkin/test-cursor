import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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
    // Drop existing tables if they exist
    await pool.query(`
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
    `);
    console.log('Existing tables dropped successfully');

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);
    console.log('Test database schema initialized successfully');

    // Create test user with bcrypt hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    await pool.query(
      'INSERT INTO users (id, nickname, email, password) VALUES (gen_random_uuid(), $1, $2, $3)',
      ['testuser', 'test@example.com', hashedPassword]
    );
    console.log('Test user created successfully');

  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

export default globalSetup; 