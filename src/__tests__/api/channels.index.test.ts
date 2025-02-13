import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/v2/channels/[channelId]/index';
import { pool } from '../../config/database';
import { generateToken } from '../../utils/jwt';
import { generateChannelCode } from '../../utils/channel';
import { log } from 'console';

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

jest.mock('../../utils/channel', () => ({
  generateChannelCode: jest.fn().mockResolvedValue('ABC123'),
}));

describe('Channel API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v2/channels/:channelId', () => {
    it('should get channel info successfully', async () => {
      (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: '1' }] }) // Mock member check
      .mockResolvedValueOnce({
            rows: [{
              id: 'mock-channel-id',
              title: 'Public Channel',
              description: 'A public channel',
              is_private: false,
              region_id: 'DEFAULT',
              code: 'ABC123',
              owner_id: 'mock-user-id',
            }],    
       });

      const { req, res } = createMocks({
        method: 'GET',
        query: { channelId: 'mock-channel-id' },
      });

      req.user = { id: 'mock-user-id' };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(
        {
          id: 'mock-channel-id',
          title: 'Public Channel',
          description: 'A public channel',
          is_private: false,
          region_id: 'DEFAULT',
          code: 'ABC123',
          owner_id: 'mock-user-id',
        },
      );
    });
  });


}); 