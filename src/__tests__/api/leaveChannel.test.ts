import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/v2/channels/[channelId]/leave';
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

describe('Leave Channel API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v2/channels/:channelId/leave', () => {
    it('should leave a channel successfully', async () => {
      (pool.connect as jest.Mock).mockResolvedValue({
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [{ owner_id: 'different-user-id' }] }) // Mock channel check
          .mockResolvedValueOnce({}), // Mock removing user from channel
        release: jest.fn(),
      });

      const { req, res } = createMocks({
        method: 'POST',
        query: { channelId: 'mock-channel-id' },
      });

      req.user = { id: 'mock-user-id' };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'Successfully left channel',
      });
    });
  });
}); 