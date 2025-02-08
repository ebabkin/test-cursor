import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import channelHandler from '../../../pages/api/v2/channels';
import messageHandler from '../../../pages/api/v2/channels/[channelId]/messages';
import membersHandler from '../../../pages/api/v2/channels/[channelId]/members';
import { generateChannelCode } from '../../../utils/channelCode';
import { pool, mockClient } from '../../../__mocks__/database';
import { authenticateUser, mockUser } from '../../../middleware/auth';

// Mock modules
jest.mock('../../../config/database');
jest.mock('../../../middleware/auth');
jest.mock('../../../utils/channelCode', () => ({
  generateChannelCode: jest.fn().mockReturnValue('ABC123'),
}));

describe('Channel API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.query.mockClear().mockResolvedValue({ rows: [] });
    mockClient.release.mockClear();
    pool.connect.mockResolvedValue(mockClient);
    
    authenticateUser.mockReset();
    authenticateUser.mockImplementation(async (req) => {
      if (req.headers.authorization) {
        const userId = req.headers.authorization.replace('Bearer ', '');
        return { ...mockUser, id: userId };
      }
      return null;
    });
  });

  describe('POST /api/v2/channels', () => {
    it('creates a new channel successfully', async () => {
      const mockChannel = {
        id: '123',
        title: 'Test Channel',
        owner_id: mockUser.id,
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockChannel] });

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockUser.id}`,
        },
        body: {
          title: 'Test Channel',
        },
      });

      await channelHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockChannel);
    });

    it('returns 401 when not authenticated', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          title: 'Test Channel'
        }
      });

      await channelHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('POST /api/v2/channels/:channelId/messages', () => {
    const mockChannelId = '123e4567-e89b-12d3-a456-426614174001';

    it('creates a new message successfully', async () => {
      const mockMessage = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        channel_id: mockChannelId,
        content: 'Test message',
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ channel_id: mockChannelId }] }) // membership check
        .mockResolvedValueOnce({ rows: [] }) // preview creation
        .mockResolvedValueOnce({ rows: [mockMessage] }) // message creation
        .mockResolvedValueOnce({ rows: [] }); // channel update

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockUser.id}`,
        },
        query: {
          channelId: mockChannelId,
        },
        body: {
          content: 'Test message',
        },
      });

      await messageHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockMessage);
    });

    it('returns 403 when user is not a channel member', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // no membership found

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockUser.id}`
        },
        query: {
          channelId: mockChannelId
        },
        body: {
          content: 'Test message'
        }
      });

      await messageHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });
  });

  describe('GET /api/v2/channels/:channelId', () => {
    it('returns channel details for accessible channel', async () => {
      const mockChannel = {
        id: '123',
        title: 'Test Channel',
        owner_id: mockUser.id,
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockChannel] });

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockUser.id}`,
        },
        query: {
          channelId: '123',
        },
      });

      await channelHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockChannel);
    });

    it('returns 404 for inaccessible private channel', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockUser.id}`
        },
        query: {
          channelId: '123'
        }
      });

      await channelHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('GET /api/v2/channels/:channelId/members', () => {
    const mockChannelId = '123e4567-e89b-12d3-a456-426614174001';

    it('returns channel members for accessible channel', async () => {
      const mockMembers = {
        members: [
          {
            user_id: mockUser.id,
            nickname: mockUser.nickname,
            role: 'USER'
          }
        ],
        total: 1
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: mockChannelId }] }) // channel check
        .mockResolvedValueOnce({ rows: [{ count: '1' }] }) // total count
        .mockResolvedValueOnce({ rows: mockMembers.members }); // members

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockUser.id}`
        },
        query: {
          channelId: mockChannelId
        }
      });

      await membersHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockMembers);
    });
  });

  describe('PUT /api/v2/channels/:channelId', () => {
    const mockChannelId = '123e4567-e89b-12d3-a456-426614174001';

    it('updates channel successfully when user is owner', async () => {
      const mockChannel = {
        id: mockChannelId,
        title: 'Updated Channel',
        owner_id: mockUser.id
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: mockChannelId }] }) // owner check
        .mockResolvedValueOnce({ rows: [mockChannel] }); // update

      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mockUser.id}`
        },
        query: {
          channelId: mockChannelId
        },
        body: {
          title: 'Updated Channel'
        }
      });

      await channelHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockChannel);
    });

    it('returns 403 when user is not channel owner', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // owner check

      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mockUser.id}`
        },
        query: {
          channelId: mockChannelId
        },
        body: {
          title: 'Updated Channel'
        }
      });

      await channelHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });
  });

  describe('DELETE /api/v2/channels/:channelId', () => {
    const mockChannelId = '123e4567-e89b-12d3-a456-426614174001';

    it('deletes channel successfully when user is owner', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: mockChannelId }] }) // owner check
        .mockResolvedValueOnce({ rows: [] }) // channel update
        .mockResolvedValueOnce({ rows: [] }) // messages update
        .mockResolvedValueOnce({ rows: [] }); // message previews update

      const { req, res } = createMocks({
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${mockUser.id}`
        },
        query: {
          channelId: mockChannelId
        }
      });

      await channelHandler(req, res);

      expect(res._getStatusCode()).toBe(204);
    });

    it('returns 403 when user is not channel owner', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // owner check

      const { req, res } = createMocks({
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${mockUser.id}`
        },
        query: {
          channelId: mockChannelId
        }
      });

      await channelHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });
  });
}); 