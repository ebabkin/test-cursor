import request from 'supertest';
import { pool } from '../../src/config/database';
import { API_TEST_USER } from '../jest.setup';

const BASE_URL = 'http://localhost:3000';

describe('User API E2E', () => {
    // Add server health check test first
    it('should verify server is running', async () => {
        try {
            await request(BASE_URL)
                .get('/api/health')
                .timeout(5000); // 5 second timeout
        } catch (error) {
            console.error('\x1b[31m%s\x1b[0m', `
🚨 SERVER NOT RUNNING 🚨
Please ensure the server is running on ${BASE_URL} before running tests.
You can start the server using 'npm run dev'
            `);
            throw new Error('Server is not running');
        }
    });

    beforeAll(async () => {
        // Verify database connection
        try {
          await pool.query('SELECT NOW()');
          console.log('Database connection successful');
        } catch (error) {
          console.error('Database connection failed:', error);
          throw error;
        }
   });

    beforeEach(async () => {
        // Note: We specifically delete only test-related data instead of truncating the whole table
        // to avoid affecting production data during tests
        await pool.query('DELETE FROM messages WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [API_TEST_USER.email]);
        await pool.query('DELETE FROM users WHERE email = $1', [API_TEST_USER.email]);
    });

    it('should register and authenticate user', async () => {
        try {
            // Register user
            const registerRes = await request(BASE_URL)
                .post('/api/users/register')
                .send({
                    nickname: API_TEST_USER.nickname,
                    email: API_TEST_USER.email,
                    password: API_TEST_USER.password
                });

            console.log('Register response:', registerRes.status, registerRes.body);
            expect(registerRes.status).toBe(201);
            expect(registerRes.body).toHaveProperty('id');
            
            // Authenticate user
            const authRes = await request(BASE_URL)
                .post('/api/users/authenticate')
                .send({
                    email: API_TEST_USER.email,
                    password: API_TEST_USER.password
                });

            console.log('Auth response:', authRes.status, authRes.body);
            expect(authRes.status).toBe(200);
            expect(authRes.body.email).toBe(API_TEST_USER.email);
        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    });

    it('should prevent duplicate email registration', async () => {
        // Register first user
        await request(BASE_URL)
            .post('/api/users/register')
            .send({
                nickname: API_TEST_USER.nickname,
                email: API_TEST_USER.email,
                password: API_TEST_USER.password
            });

        // Try to register with same email
        const duplicateRes = await request(BASE_URL)
            .post('/api/users/register')
            .send({
                nickname: 'another_user',
                email: API_TEST_USER.email,
                password: API_TEST_USER.password
            });

        expect(duplicateRes.status).toBe(409);
        expect(duplicateRes.body.message).toBe('Email already registered');
    });
}); 