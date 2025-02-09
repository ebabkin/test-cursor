import { pool } from '../src/config/database';
import { TextEncoder, TextDecoder } from 'util';

beforeAll(async () => {
  // Clean database before tests
  await pool.query('TRUNCATE TABLE users CASCADE');
});

afterAll(async () => {
  await pool.end();
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder; 