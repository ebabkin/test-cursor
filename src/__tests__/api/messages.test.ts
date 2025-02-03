import { createMocks } from 'node-mocks-http';
import handler from '../../../src/pages/api/messages';

describe('/api/messages', () => {
  it('returns success response for valid message', async () => {
    const testMessage = 'Test message';
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: testMessage,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('response');
    expect(data.response).toMatch(
      /^Message accepted, length: \d+ on \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC$/
    );
  });

  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
}); 