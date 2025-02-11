/**
 * Jest setup for API E2E tests
 * This file configures the test environment for API testing
 */

import { TextEncoder, TextDecoder } from 'util';
import { pool } from '../src/config/database';

// Required for JWT token handling in tests
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Constants for test users - keep in sync with setup.ts
export const API_TEST_USER = {
  email: 'apitest@example.com',
  nickname: 'apitest',
  password: 'password123'
};

beforeAll(async () => {
  // Note: We specifically delete only test-related data instead of truncating the whole table
  // to avoid affecting production data during tests
  await pool.query('DELETE FROM users WHERE email = $1', [API_TEST_USER.email]);
});

afterAll(async () => {
  await pool.end();
}); 