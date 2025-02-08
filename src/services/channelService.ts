import { pool } from '../config/database';
import { Channel, CreateChannelDto, ChannelMember, Message, CreateMessageDto } from '../types/channel';
import { generateChannelCode } from '../utils/channelCode';

export class ChannelService {
  async createChannel(userId: string, data: CreateChannelDto): Promise<Channel> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Generate unique channel code
      let code: string;
      let isUnique = false;
      while (!isUnique) {
        code = generateChannelCode();
        const existing = await client.query(
          'SELECT code FROM channels WHERE code = $1',
          [code]
        );
        isUnique = existing.rows.length === 0;
      }

      // Create channel
      const result = await client.query(
        `INSERT INTO channels (code, region_id, title, description, is_private, owner_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          code,
          data.regionId || 'DEFAULT',
          data.title,
          data.description,
          data.isPrivate || false,
          userId
        ]
      );

      // Add owner as member
      await client.query(
        `INSERT INTO channel_members (channel_id, user_id, role)
         VALUES ($1, $2, 'USER')`,
        [result.rows[0].id, userId]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async joinChannel(userId: string, channelId: string): Promise<ChannelMember> {
    const client = await pool.connect();
    try {
      // Check if channel exists and is active
      const channel = await client.query(
        'SELECT * FROM channels WHERE id = $1 AND state = $2',
        [channelId, 'ACTIVE']
      );
      if (channel.rows.length === 0) {
        throw new Error('Channel not found or inactive');
      }

      // Check if private and user is already a member
      if (channel.rows[0].is_private) {
        throw new Error('Cannot join private channel directly');
      }

      // Add member
      const result = await client.query(
        `INSERT INTO channel_members (channel_id, user_id, role)
         VALUES ($1, $2, 'USER')
         ON CONFLICT (channel_id, user_id) DO NOTHING
         RETURNING *`,
        [channelId, userId]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createMessage(userId: string, channelId: string, data: CreateMessageDto): Promise<Message> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check membership
      const member = await client.query(
        'SELECT * FROM channel_members WHERE channel_id = $1 AND user_id = $2',
        [channelId, userId]
      );
      if (member.rows.length === 0) {
        throw new Error('User is not a member of this channel');
      }

      const messageId = crypto.randomUUID();
      const now = new Date();

      // Create preview
      await client.query(
        `INSERT INTO message_previews (id, channel_id, user_id, content_preview, kind, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [messageId, channelId, userId, data.content.substring(0, 128), data.kind || 'TEXT', now]
      );

      // Create full message
      const result = await client.query(
        `INSERT INTO messages (id, channel_id, user_id, content, kind, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [messageId, channelId, userId, data.content, data.kind || 'TEXT', now]
      );

      // Update channel's last message preview
      await client.query(
        `UPDATE channels 
         SET last_message_preview = $1
         WHERE id = $2`,
        [data.content.substring(0, 128), channelId]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getChannelMessages(channelId: string, limit: number = 50, before?: Date): Promise<Message[]> {
    const query = `
      SELECT m.*, u.nickname as user_nickname
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.channel_id = $1
        AND m.is_deleted = false
        ${before ? 'AND m.created_at < $3' : ''}
      ORDER BY m.created_at DESC
      LIMIT $2
    `;

    const params = before 
      ? [channelId, limit, before]
      : [channelId, limit];

    const result = await pool.query(query, params);
    return result.rows;
  }

  async listChannels(userId: string, options: {
    search?: string,
    limit?: number,
    offset?: number
  } = {}): Promise<{ channels: Channel[], total: number }> {
    const { search, limit = 20, offset = 0 } = options;
    const client = await pool.connect();

    try {
      // Build query conditions
      const conditions = ['(NOT is_private OR EXISTS (SELECT 1 FROM channel_members cm WHERE cm.channel_id = c.id AND cm.user_id = $1))'];
      const params = [userId];
      let paramIndex = 2;

      if (search) {
        conditions.push(`(c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) 
         FROM channels c
         WHERE state = 'ACTIVE' AND ${conditions.join(' AND ')}`,
        params
      );

      // Get channels
      const result = await client.query(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM channel_members cm WHERE cm.channel_id = c.id) as member_count,
                EXISTS (SELECT 1 FROM channel_members cm WHERE cm.channel_id = c.id AND cm.user_id = $1) as is_member
         FROM channels c
         WHERE state = 'ACTIVE' AND ${conditions.join(' AND ')}
         ORDER BY c.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );

      return {
        channels: result.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } finally {
      client.release();
    }
  }

  async getChannelById(userId: string, channelId: string): Promise<Channel | null> {
    const client = await pool.connect();

    try {
      // Check if user can access this channel
      const result = await client.query(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM channel_members cm WHERE cm.channel_id = c.id) as member_count,
                EXISTS (SELECT 1 FROM channel_members cm WHERE cm.channel_id = c.id AND cm.user_id = $1) as is_member
         FROM channels c
         WHERE c.id = $2 
           AND c.state = 'ACTIVE'
           AND (NOT c.is_private OR EXISTS (
             SELECT 1 FROM channel_members cm 
             WHERE cm.channel_id = c.id AND cm.user_id = $1
           ))`,
        [userId, channelId]
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getChannelMembers(channelId: string, options: {
    limit?: number,
    offset?: number
  } = {}): Promise<{ members: ChannelMember[], total: number }> {
    const { limit = 20, offset = 0 } = options;
    const client = await pool.connect();

    try {
      const countResult = await client.query(
        'SELECT COUNT(*) FROM channel_members WHERE channel_id = $1',
        [channelId]
      );

      const result = await client.query(
        `SELECT cm.*, u.nickname, u.email
         FROM channel_members cm
         JOIN users u ON cm.user_id = u.id
         WHERE cm.channel_id = $1
         ORDER BY cm.joined_at ASC
         LIMIT $2 OFFSET $3`,
        [channelId, limit, offset]
      );

      return {
        members: result.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } finally {
      client.release();
    }
  }

  async updateChannel(userId: string, channelId: string, data: {
    title?: string;
    description?: string;
    isPrivate?: boolean;
  }): Promise<Channel> {
    const client = await pool.connect();
    try {
      // Check if user is channel owner
      const channel = await client.query(
        'SELECT * FROM channels WHERE id = $1 AND owner_id = $2 AND state = $3',
        [channelId, userId, 'ACTIVE']
      );

      if (channel.rows.length === 0) {
        throw new Error('Channel not found or user is not owner');
      }

      // Build update query
      const updates: string[] = [];
      const values: any[] = [channelId];
      let paramIndex = 2;

      if (data.title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        values.push(data.title);
        paramIndex++;
      }

      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(data.description);
        paramIndex++;
      }

      if (data.isPrivate !== undefined) {
        updates.push(`is_private = $${paramIndex}`);
        values.push(data.isPrivate);
        paramIndex++;
      }

      if (updates.length === 0) {
        return channel.rows[0];
      }

      const result = await client.query(
        `UPDATE channels 
         SET ${updates.join(', ')}
         WHERE id = $1
         RETURNING *`,
        values
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteChannel(userId: string, channelId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if user is channel owner
      const channel = await client.query(
        'SELECT * FROM channels WHERE id = $1 AND owner_id = $2 AND state = $3',
        [channelId, userId, 'ACTIVE']
      );

      if (channel.rows.length === 0) {
        throw new Error('Channel not found or user is not owner');
      }

      // Soft delete channel
      await client.query(
        `UPDATE channels 
         SET state = 'DELETED'
         WHERE id = $1`,
        [channelId]
      );

      // Mark all messages as deleted
      await client.query(
        `UPDATE messages 
         SET is_deleted = true
         WHERE channel_id = $1`,
        [channelId]
      );

      await client.query(
        `UPDATE message_previews 
         SET is_deleted = true
         WHERE channel_id = $1`,
        [channelId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
} 