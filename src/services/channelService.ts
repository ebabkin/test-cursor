import { pool } from '../config/database';
import { Channel, CreateChannelDto, MessageV2, CreateMessageV2Dto } from '../types/channel';
import { generateChannelCode } from '../utils/channel';

export class ChannelService {
    /**
     * Create a new channel
     * Creates a new channel and adds the creator as a member
     */
    async createChannel(userId: string, data: CreateChannelDto): Promise<Channel> {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Generate unique channel code
            const code = await generateChannelCode();
            
            // Create channel
            const channelResult = await client.query(
                `INSERT INTO channels 
                (code, region_id, title, description, is_private, owner_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [code, data.region_id || 'DEFAULT', data.title, data.description, data.is_private, userId]
            );
            
            console.log('channelResult', channelResult);

            // Add owner as member
            await client.query(
                `INSERT INTO channel_members (channel_id, user_id, role)
                VALUES ($1, $2, 'USER')`,
                [channelResult.rows[0].id, userId]
            );
            
            await client.query('COMMIT');
            return channelResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Create a new message in a channel
     * Creates a message in a channel the user is a member of
     */
    async createMessage(userId: string, data: CreateMessageV2Dto): Promise<MessageV2> {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Verify user is member of channel
            const memberCheck = await client.query(
                `SELECT 1 FROM channel_members 
                WHERE channel_id = $1 AND user_id = $2`,
                [data.channel_id, userId]
            );
            
            if (memberCheck.rowCount === 0) {
                throw new Error('User is not a member of this channel');
            }
            
            // Create message header
            const contentPreview = data.content.substring(0, 128);
            const messageResult = await client.query(
                `INSERT INTO message_headers 
                (channel_id, user_id, content_preview)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [data.channel_id, userId, contentPreview]
            );
            
            // Store full content
            await client.query(
                `INSERT INTO message_contents (id, content)
                VALUES ($1, $2)`,
                [messageResult.rows[0].id, data.content]
            );
            
            // Update channel's last message
            await client.query(
                `UPDATE channels 
                SET last_message_preview = $1,
                    last_message_date = CURRENT_TIMESTAMP
                WHERE id = $2`,
                [contentPreview, data.channel_id]
            );
            
            await client.query('COMMIT');
            
            return {
                ...messageResult.rows[0],
                content: data.content
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get channel messages
     * Retrieves messages from a channel the user is a member of
     */
    async getChannelMessages(
        channelId: string,
        userId: string,
        limit: number = 50,
        before?: Date
    ): Promise<MessageV2[]> {
        // Verify user is member of channel
        const memberCheck = await pool.query(
            `SELECT 1 FROM channel_members 
            WHERE channel_id = $1 AND user_id = $2`,
            [channelId, userId]
        );
        
        if (memberCheck.rowCount === 0) {
            throw new Error('User is not a member of this channel');
        }
        
        // Get messages with content
        const result = await pool.query(
            `SELECT h.*, c.content
            FROM message_headers h
            JOIN message_contents c ON c.id = h.id
            WHERE h.channel_id = $1
                AND h.is_deleted = false
                ${before ? 'AND h.creation_date < $4' : ''}
            ORDER BY h.creation_date DESC
            LIMIT $2`,
            before 
                ? [channelId, limit, before]
                : [channelId, limit]
        );
        
        return result.rows;
    }

    /**
     * Join a channel using its code
     * Join a public channel using its 6-character code
     */
    async joinChannelByCode(userId: string, code: string): Promise<void> {
        const client = await pool.connect();
        
        try {
            // Check if channel exists and is active
            const channelCheck = await client.query(
                `SELECT id, is_private FROM channels 
                WHERE code = $1 AND state = 'ACTIVE'`,
                [code]
            );
            
            if (channelCheck.rowCount === 0) {
                throw new Error('Channel not found or inactive');
            }
            
            if (channelCheck.rows[0].is_private) {
                throw new Error('Cannot join private channel directly');
            }
            
            // Add member
            await client.query(
                `INSERT INTO channel_members (channel_id, user_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING`,
                [channelCheck.rows[0].id, userId]
            );
        } finally {
            client.release();
        }
    }

    /**
     * Invite a user to a channel
     * Invite a user to a channel by their nickname or email
     */
    async inviteUser(inviterId: string, channelId: string, userIdentifier: string): Promise<void> {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Check channel exists and is private
            const channelCheck = await client.query(
                `SELECT is_private FROM channels 
                WHERE id = $1 AND state = 'ACTIVE'`,
                [channelId]
            );
            
            if (channelCheck.rowCount === 0) {
                throw new Error('Channel not found');
            }
            
            // manually commented out - probably never needed
            // if (!channelCheck.rows[0].is_private) {
            //     throw new Error('Channel is not private');
            // }
            
            // Check inviter is member
            const memberCheck = await client.query(
                `SELECT 1 FROM channel_members 
                WHERE channel_id = $1 AND user_id = $2`,
                [channelId, inviterId]
            );
            
            if (memberCheck.rowCount === 0) {
                throw new Error('Not a channel member');
            }
            
            // Find user by nickname or email
            const userCheck = await client.query(
                `SELECT id FROM users 
                WHERE nickname = $1 OR email = $1`,
                [userIdentifier]
            );
            
            if (userCheck.rowCount === 0) {
                throw new Error('User not found');
            }
            
            // Add user to channel
            await client.query(
                `INSERT INTO channel_members (channel_id, user_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING`,
                [channelId, userCheck.rows[0].id]
            );
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Leave a channel
     * Leave a channel. Channel owners cannot leave their channels.
     */
    async leaveChannel(userId: string, channelId: string): Promise<void> {
        const client = await pool.connect();
        
        try {
            // Check if user is owner
            const channelCheck = await client.query(
                `SELECT owner_id FROM channels 
                WHERE id = $1 AND state = 'ACTIVE'`,
                [channelId]
            );
            
            if (channelCheck.rowCount === 0) {
                throw new Error('Channel not found');
            }
            
            if (channelCheck.rows[0].owner_id === userId) {
                throw new Error('Cannot leave channel as owner');
            }
            
            // Remove member
            await client.query(
                `DELETE FROM channel_members 
                WHERE channel_id = $1 AND user_id = $2`,
                [channelId, userId]
            );
        } finally {
            client.release();
        }
    }

    /**
     * List public channels
     * Get a list of public channels, sorted by last message date
     */
    async listPublicChannels(limit: number = 20, before?: Date): Promise<Channel[]> {
        const result = await pool.query(
            `SELECT c.*, COUNT(cm.user_id) as member_count
            FROM channels c
            LEFT JOIN channel_members cm ON c.id = cm.channel_id
            WHERE c.is_private = false 
                AND c.state = 'ACTIVE'
                ${before ? 'AND c.last_message_date < $3' : ''}
            GROUP BY c.id
            ORDER BY c.last_message_date DESC NULLS LAST
            LIMIT $1`,
            before ? [limit, before] : [limit]
        );
        console.log('result 1 ', result);
        return result.rows;
    }
} 