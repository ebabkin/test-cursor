import { createMocks } from 'node-mocks-http';
import registerHandler from '../../pages/api/users/register';
import authenticateHandler from '../../pages/api/users/authenticate';
import getUserHandler from '../../pages/api/users/[id]';
import { pool } from '../../config/database';

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
        password: 'hashedPassword',
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [mockUser] });

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

    it('should return 409 when email is already registered', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          nickname: 'testuser',
          email: 'existing@example.com',
          password: 'password123',
        },
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(409);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Email already registered',
      });
    });

    it('should return 409 when nickname is already taken', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          nickname: 'existinguser',
          email: 'new@example.com',
          password: 'password123',
        },
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(409);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Nickname already taken',
      });
    });
  });

  describe('POST /api/users/authenticate', () => {
    it('should authenticate user successfully', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: 'testuser',
        password: 'hashedPassword',
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
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        nickname: mockUser.nickname,
      });
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

    it('should authenticate user with nickname', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: 'testuser',
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'testuser',
          password: 'password123',
        },
      });

      await authenticateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockUser);
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