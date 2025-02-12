import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/v2/channels/[channelId]/invite';
import { pool } from '../../config/database';
import { generateToken } from '../../utils/jwt';

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn().mockResolvedValue({
      query: jest.fn(),
      release: jest.fn(),
    }),
  },
}));

jest.mock('../../utils/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
}));

jest.mock('../../middleware/auth', () => ({
  withAuth: (handler: any) => (req: any, res: any) => {
    req.user = { id: 'mock-user-id' };
    return handler(req, res);
  },
}));

describe('Invite User API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v2/channels/:channelId/invite', () => {
    it('should invite a user to a channel successfully', async () => {
      (pool.connect as jest.Mock).mockResolvedValue({
        query: jest.fn()
          .mockResolvedValueOnce({}) // Mock BEGIN transaction
          .mockResolvedValueOnce({ rows: [{ is_private: true }] }) // Mock channel check
          .mockResolvedValueOnce({ rows: [{ id: '1' }] }) // Mock member check
          .mockResolvedValueOnce({ rows: [{ id: 'mock-user-id' }] }) // Mock user check
          .mockResolvedValueOnce({}), // Mock adding user to channel
        release: jest.fn(),
      });

      const { req, res } = createMocks({
        method: 'POST',
        query: { channelId: 'mock-channel-id' },
        body: {
          userIdentifier: 'testuser@example.com',
        },
      });

      req.user = { id: 'mock-user-id' };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'User successfully invited',
      });
    });
  });
}); 