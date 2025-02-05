import { createMocks } from 'node-mocks-http';
import registerHandler from '../../pages/api/users/register';
import authenticateHandler from '../../pages/api/users/authenticate';
import getUserHandler from '../../pages/api/users/[id]';
import { pool } from '../../config/database';
import request from 'supertest';
import { app } from '../../pages/api/users/register';

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('User API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nickname: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ count: '0' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ 
        rows: [{
          id: mockUser.id,
          nickname: mockUser.nickname,
          email: mockUser.email
        }] 
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          nickname: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        },
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.email).toBe(mockUser.email);
    });

    it('should return 400 for invalid email format', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          nickname: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        },
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Invalid email format',
      });
    });

    it('should not allow duplicate emails', async () => {
      // First registration
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          username: 'testuser1',
          password: 'password123'
        });

      // Attempt duplicate email registration
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          username: 'testuser2',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email already exists');
    });

    it('should not allow duplicate usernames', async () => {
      // First registration
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'test1@example.com',
          username: 'testuser',
          password: 'password123'
        });

      // Attempt duplicate username registration
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test2@example.com',
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Username already exists');
    });
  });

  describe('POST /api/users/authenticate', () => {
    it('should authenticate user successfully', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: 'testuser',
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      await authenticateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockUser);
    });

    it('should return 401 for invalid credentials', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'wrong@example.com',
          password: 'wrongpassword',
        },
      });

      await authenticateHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Invalid credentials',
      });
    });

    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        });
    });

    it('should authenticate with email', async () => {
      const response = await request(app)
        .post('/api/users/authenticate')
        .send({
          identifier: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
    });

    it('should authenticate with username', async () => {
      const response = await request(app)
        .post('/api/users/authenticate')
        .send({
          identifier: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
    });
  });

  describe('GET /api/users/[id]', () => {
    it('should get user by id successfully', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nickname: 'testuser',
        email: 'test@example.com',
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: mockUser.id,
        },
      });

      await getUserHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockUser);
    });

    it('should return 404 for non-existent user', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: '123e4567-e89b-12d3-a456-426614174000',
        },
      });

      await getUserHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'User not found',
      });
    });
  });
}); 