import { TextEncoder, TextDecoder } from 'util';
import { pool } from '../src/config/database';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

beforeAll(async () => {
  await pool.query('TRUNCATE TABLE users CASCADE');
});

afterAll(async () => {
  await pool.end();
}); 