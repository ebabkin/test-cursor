import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/v2/channels/[channelId]/messages';
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

describe('Message V2 API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v2/channels/:channelId/messages', () => {
    it('should create a new message successfully', async () => {
      (pool.connect as jest.Mock).mockResolvedValue({
        query: jest.fn()
          .mockResolvedValueOnce({}) // Mock BEGIN transaction
          .mockResolvedValueOnce({ rows: [{ id: '1' }] }) // Mock member check
          .mockResolvedValueOnce({ rows: [{ 
            id: 'mock-message-id',
            channel_id: 'mock-channel-id',
            user_id: 'mock-user-id',
            content: 'Test message content',
            content_preview: 'Test message content',
            kind: 'TEXT',
            is_deleted: 'false',
            creation_date: '2024-01-01',
          }] }) // Mock message creation
          .mockResolvedValueOnce({ rows: [{ id: '1' }] }) // Mock insert content
          .mockResolvedValueOnce({ rows: [{ id: '1' }] }) // Mock update last message
          .mockResolvedValueOnce({}), // Mock COMMIT transaction
        release: jest.fn(),
      });

      const { req, res } = createMocks({
        method: 'POST',
        query: { channelId: 'mock-channel-id' },
        body: {
          content: 'Test message content',
        },
      });

      req.user = { id: 'mock-user-id' };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toEqual({
        id: 'mock-message-id',
        channel_id: 'mock-channel-id',
        user_id: 'mock-user-id',
        content: 'Test message content',
        content_preview: 'Test message content',
        kind: 'TEXT',
        is_deleted: 'false',
        creation_date: '2024-01-01',
      });
    });
  });

  describe('GET /api/v2/channels/:channelId/messages', () => {
    it('should get messages successfully', async () => {
      (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: '1' }] }) // Mock member check
      .mockResolvedValueOnce({
        rows: [{
          id: 'mock-message-id',
          channel_id: 'mock-channel-id',
          user_id: 'mock-user-id',
          content: 'Test message content',
          content_preview: 'Test message content',
          kind: 'TEXT',
          is_deleted: 'false',
          creation_date: '2024-01-01',
        }],
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: { channelId: 'mock-channel-id', limit: '10' },
      });

      req.user = { id: 'mock-user-id' };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual([
        {
          id: 'mock-message-id',
          channel_id: 'mock-channel-id',
          user_id: 'mock-user-id',
          content: 'Test message content',
          content_preview: 'Test message content',
          kind: 'TEXT',
          is_deleted: 'false',
          creation_date: '2024-01-01',
        },
      ]);
    });
  });
}); 