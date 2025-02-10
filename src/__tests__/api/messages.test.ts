import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/messages';
import { generateToken } from '../../utils/jwt';

// Mock jwt utils
jest.mock('../../utils/jwt', () => ({
  verifyToken: jest.fn().mockReturnValue({
    sub: 'test-user-id',
    email: 'test@example.com',
    nickname: 'testuser'
  }),
  extractTokenFromHeader: jest.fn().mockImplementation((header) => {
    if (!header) {
      throw new Error('No authorization header');
    }
    if (!header.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header format');
    }
    return header.split(' ')[1];
  })
}));

describe('/api/messages', () => {
  const mockValidToken = 'Bearer valid-token';

  it('returns 401 when no auth token is provided', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Test message',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Unauthorized'
    });
  });

  it('returns success response for valid message with auth token', async () => {
    const testMessage = 'Test message';
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: mockValidToken
      },
      body: {
        message: testMessage,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('response');
    expect(data.response).toMatch(
      /^Message from testuser accepted, length: \d+ on \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC$/
    );
  });

  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: mockValidToken
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
}); 