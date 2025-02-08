import { test, expect } from '@playwright/test';
import { pool } from '../../src/config/database';
import bcrypt from 'bcrypt';

test.describe('Channel functionality', () => {
  let userId: string;

  test.beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const result = await pool.query(
      'INSERT INTO users (nickname, email, password) VALUES ($1, $2, $3) RETURNING id',
      ['testuser', 'test@example.com', hashedPassword]
    );
    userId = result.rows[0].id;

    // Ensure default region exists
    await pool.query(
      'INSERT INTO regions (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      ['DEFAULT', 'Default Region']
    );
  });

  test.afterAll(async () => {
    await pool.query('TRUNCATE TABLE messages, message_previews, channel_members, channels, users CASCADE');
    await pool.end();
  });

  test('authenticated user can create and use a channel', async ({ request }) => {
    // Create channel
    const createChannelResponse = await request.post('/api/v2/channels', {
      headers: {
        'Authorization': `Bearer ${userId}`
      },
      data: {
        title: 'Test Channel',
        description: 'Test Description'
      }
    });
    expect(createChannelResponse.ok()).toBeTruthy();
    const channel = await createChannelResponse.json();
    expect(channel.title).toBe('Test Channel');

    // Post message to channel
    const createMessageResponse = await request.post(`/api/v2/channels/${channel.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${userId}`
      },
      data: {
        content: 'Hello, Channel!'
      }
    });
    expect(createMessageResponse.ok()).toBeTruthy();
    const message = await createMessageResponse.json();
    expect(message.content).toBe('Hello, Channel!');
  });

  test('unauthenticated user cannot create channel', async ({ request }) => {
    const response = await request.post('/api/v2/channels', {
      data: {
        title: 'Test Channel'
      }
    });
    expect(response.status()).toBe(401);
  });

  test('non-member cannot post to channel', async ({ request }) => {
    // Create channel with first user
    const createChannelResponse = await request.post('/api/v2/channels', {
      headers: {
        'Authorization': `Bearer ${userId}`
      },
      data: {
        title: 'Test Channel',
        isPrivate: true
      }
    });
    const channel = await createChannelResponse.json();

    // Create second user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await pool.query(
      'INSERT INTO users (nickname, email, password) VALUES ($1, $2, $3) RETURNING id',
      ['testuser2', 'test2@example.com', hashedPassword]
    );
    const user2Id = userResult.rows[0].id;

    // Try to post message with second user
    const createMessageResponse = await request.post(`/api/v2/channels/${channel.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${user2Id}`
      },
      data: {
        content: 'Hello, Channel!'
      }
    });
    expect(createMessageResponse.status()).toBe(403);
  });

  test('user can view channel details and members', async ({ request }) => {
    // Create channel
    const createChannelResponse = await request.post('/api/v2/channels', {
      headers: {
        'Authorization': `Bearer ${userId}`
      },
      data: {
        title: 'Test Channel',
        description: 'Test Description'
      }
    });
    const channel = await createChannelResponse.json();

    // Get channel details
    const channelResponse = await request.get(`/api/v2/channels/${channel.id}`, {
      headers: {
        'Authorization': `Bearer ${userId}`
      }
    });
    expect(channelResponse.ok()).toBeTruthy();
    const channelDetails = await channelResponse.json();
    expect(channelDetails.title).toBe('Test Channel');
    expect(channelDetails.is_member).toBe(true);

    // Get channel members
    const membersResponse = await request.get(`/api/v2/channels/${channel.id}/members`, {
      headers: {
        'Authorization': `Bearer ${userId}`
      }
    });
    expect(membersResponse.ok()).toBeTruthy();
    const members = await membersResponse.json();
    expect(members.total).toBe(1);
    expect(members.members[0].nickname).toBe('testuser');
  });

  test('channel owner can update and delete channel', async ({ request }) => {
    // Create channel
    const createChannelResponse = await request.post('/api/v2/channels', {
      headers: {
        'Authorization': `Bearer ${userId}`
      },
      data: {
        title: 'Test Channel',
        description: 'Test Description'
      }
    });
    const channel = await createChannelResponse.json();

    // Update channel
    const updateResponse = await request.put(`/api/v2/channels/${channel.id}`, {
      headers: {
        'Authorization': `Bearer ${userId}`
      },
      data: {
        title: 'Updated Channel',
        description: 'Updated Description'
      }
    });
    expect(updateResponse.ok()).toBeTruthy();
    const updatedChannel = await updateResponse.json();
    expect(updatedChannel.title).toBe('Updated Channel');

    // Delete channel
    const deleteResponse = await request.delete(`/api/v2/channels/${channel.id}`, {
      headers: {
        'Authorization': `Bearer ${userId}`
      }
    });
    expect(deleteResponse.status()).toBe(204);

    // Verify channel is not accessible
    const getResponse = await request.get(`/api/v2/channels/${channel.id}`, {
      headers: {
        'Authorization': `Bearer ${userId}`
      }
    });
    expect(getResponse.status()).toBe(404);
  });

  test('non-owner cannot update or delete channel', async ({ request }) => {
    // Create channel with first user
    const createChannelResponse = await request.post('/api/v2/channels', {
      headers: {
        'Authorization': `Bearer ${userId}`
      },
      data: {
        title: 'Test Channel'
      }
    });
    const channel = await createChannelResponse.json();

    // Create second user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await pool.query(
      'INSERT INTO users (nickname, email, password) VALUES ($1, $2, $3) RETURNING id',
      ['testuser2', 'test2@example.com', hashedPassword]
    );
    const user2Id = userResult.rows[0].id;

    // Try to update channel with second user
    const updateResponse = await request.put(`/api/v2/channels/${channel.id}`, {
      headers: {
        'Authorization': `Bearer ${user2Id}`
      },
      data: {
        title: 'Updated Channel'
      }
    });
    expect(updateResponse.status()).toBe(403);

    // Try to delete channel with second user
    const deleteResponse = await request.delete(`/api/v2/channels/${channel.id}`, {
      headers: {
        'Authorization': `Bearer ${user2Id}`
      }
    });
    expect(deleteResponse.status()).toBe(403);
  });
}); 