import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/v2/channels/join-by-code/[code]';
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

describe('Join by Code API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v2/channels/join-by-code/:code', () => {
    it('should join a channel by code successfully', async () => {
      (pool.connect as jest.Mock).mockResolvedValue({
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [{ id: 'mock-channel-id', is_private: false }] }) // Mock channel check
          .mockResolvedValueOnce({}), // Mock adding user to channel
        release: jest.fn(),
      });

      const { req, res } = createMocks({
        method: 'POST',
        query: { code: 'ABC123' },
      });

      req.user = { id: 'mock-user-id' };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'Successfully joined channel',
      });
    });
  });
}); 