import { pool } from '../src/config/database';

beforeAll(async () => {
  // Clean database before tests
  await pool.query('TRUNCATE TABLE users CASCADE');
});

afterAll(async () => {
  await pool.end();
}); 