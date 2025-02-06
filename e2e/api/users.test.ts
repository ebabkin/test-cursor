import request from 'supertest';
import { pool } from '../../src/config/database';

const BASE_URL = 'http://localhost:3000';

describe('User API E2E', () => {
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
    await pool.query('TRUNCATE TABLE users CASCADE');
  });


  it('should register and authenticate user', async () => {
    try {
      // Register user
      const registerRes = await request(BASE_URL)
        .post('/api/users/register')
        .send({
          nickname: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      console.log('Register response:', registerRes.status, registerRes.body);
      expect(registerRes.status).toBe(201);
      expect(registerRes.body).toHaveProperty('id');
      
      // Authenticate user
      const authRes = await request(BASE_URL)
        .post('/api/users/authenticate')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      console.log('Auth response:', authRes.status, authRes.body);
      expect(authRes.status).toBe(200);
      expect(authRes.body.email).toBe('test@example.com');
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
        nickname: 'user1',
        email: 'test@example.com',
        password: 'password123'
      });

    // Try to register with same email
    const duplicateRes = await request(BASE_URL)
      .post('/api/users/register')
      .send({
        nickname: 'user2',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.message).toBe('Email already registered');
  });
}); 