import request from 'supertest';
import { pool } from '../../../src/config/database';
import { log } from 'console';

const BASE_URL = 'http://localhost:3000';

/**
 * Test flow for two users interacting with V2 APIs:
 *
 * User 1:
 * 1. Register and authenticate.
 * 2. Create a public channel.
 * 3. Create a private channel.
 *
 * User 2:
 * 1. Register and authenticate.
 * 2. Join the public channel.
 * 3. Be invited to the private channel by User 1.
 *
 * Messaging:
 * 1. Both users send messages in the channels they are part of.
 * 2. User 1 lists channels.
 * 3. User 2 lists channels.
 */
describe('V2 Channels API E2E', () => {
    beforeAll(async () => {
        // Verify database connection
        try {
            await pool.query('SELECT NOW()');
            console.log('Database connection successful');
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    });

    beforeEach(async () => {
        // Clean up test data
        // Delete message contents first (due to foreign key dependency)
        await pool.query(`
            DELETE FROM message_contents 
            WHERE id IN (
                SELECT mh.id 
                FROM message_headers mh 
                WHERE mh.user_id IN (SELECT id FROM users WHERE email IN ($1, $2))
            )
        `, ['APIuser1@example.com', 'APIuser2@example.com']);
        
        // Then delete message headers
        await pool.query(`
            DELETE FROM message_headers 
            WHERE user_id IN (SELECT id FROM users WHERE email IN ($1, $2))
        `, ['APIuser1@example.com', 'APIuser2@example.com']);

        // Delete channel memberships and channels
        await pool.query('DELETE FROM channel_members WHERE user_id IN (SELECT id FROM users WHERE email IN ($1, $2))', ['APIuser1@example.com', 'APIuser2@example.com']);
        await pool.query('DELETE FROM channels WHERE owner_id IN (SELECT id FROM users WHERE email IN ($1, $2))', ['APIuser1@example.com', 'APIuser2@example.com']);
        
        // Finally delete users
        await pool.query('DELETE FROM users WHERE email IN ($1, $2)', ['APIuser1@example.com', 'APIuser2@example.com']);
    });

    it('should register, create channels, join, and send messages', async () => {
        // User 1 registration and authentication
        const user1 = { email: 'APIuser1@example.com', nickname: 'APIuser1', password: 'password123' };
        const user1RegisterRes = await request(BASE_URL)
            .post('/api/users/register')
            .send(user1);
        expect(user1RegisterRes.status).toBe(201);

        const user1AuthRes = await request(BASE_URL)
            .post('/api/users/authenticate')
            .send({ email: user1.email, password: user1.password });
        expect(user1AuthRes.status).toBe(200);
        const user1Token = user1AuthRes.body.token;

        // User 1 creates a public channel
        const publicChannelRes = await request(BASE_URL)
            .post('/api/v2/channels')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ title: 'Public Channel', is_private: false });
        expect(publicChannelRes.status).toBe(201);
        const publicChannelId = publicChannelRes.body.id;
        const publicChannelCode = publicChannelRes.body.code;

        // User 1 creates a private channel
        const privateChannelRes = await request(BASE_URL)
            .post('/api/v2/channels')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ title: 'Private Channel', is_private: true });
        expect(privateChannelRes.status).toBe(201);
        const privateChannelId = privateChannelRes.body.id;

        // User 2 registration and authentication
        const user2 = { email: 'APIuser2@example.com', nickname: 'APIuser2', password: 'password123' };
        const user2RegisterRes = await request(BASE_URL)
            .post('/api/users/register')
            .send(user2);
        expect(user2RegisterRes.status).toBe(201);

        const user2AuthRes = await request(BASE_URL)
            .post('/api/users/authenticate')
            .send({ email: user2.email, password: user2.password });
        expect(user2AuthRes.status).toBe(200);
        const user2Token = user2AuthRes.body.token;

        // User 2 joins the public channel using join-by-code
        const joinPublicChannelRes = await request(BASE_URL)
            .post(`/api/v2/channels/join-by-code/${publicChannelCode}`)
            .set('Authorization', `Bearer ${user2Token}`);
        expect(joinPublicChannelRes.status).toBe(200);

        // User 1 invites User 2 to the private channel
        const inviteToPrivateChannelRes = await request(BASE_URL)
            .post(`/api/v2/channels/${privateChannelId}/invite`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ userIdentifier: user2.email });
            expect(inviteToPrivateChannelRes.status).toBe(200);

        // User 1 sends a message in the public channel
        const user1MessageRes = await request(BASE_URL)
            .post(`/api/v2/channels/${publicChannelId}/messages`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ content: 'Hello from User 1!' });
        expect(user1MessageRes.status).toBe(201);

        // User 2 sends a message in the public channel
        const longString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.5678901234567890";
        const user2MessageRes = await request(BASE_URL)
            .post(`/api/v2/channels/${publicChannelId}/messages`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send({ content: longString });
        expect(user2MessageRes.status).toBe(201);

        // User 1 lists channels
        const user1ChannelList = await request(BASE_URL)
            .get(`/api/v2/channels`)
            .set('Authorization', `Bearer ${user1Token}`);
        expect(user1ChannelList.status).toBe(200);
        console.log('user1ChannelList', user1ChannelList.body);

        // User 2 lists channels
        const user2ChannelList = await request(BASE_URL)
            .get(`/api/v2/channels`)
            .set('Authorization', `Bearer ${user2Token}`);
        expect(user2ChannelList.status).toBe(200);
        console.log('user2ChannelList', user2ChannelList.body);
    });
}); 