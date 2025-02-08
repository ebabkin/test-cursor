import { NextApiRequest, NextApiResponse } from 'next';
import { ChannelService } from '../../../../../services/channelService';
import { authenticateUser } from '../../../../../middleware/auth';

const channelService = new ChannelService();

/**
 * @swagger
 * /api/v2/channels/{channelId}/messages:
 *   post:
 *     summary: Create a new message in a channel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               kind:
 *                 type: string
 *                 enum: [TEXT]
 *     responses:
 *       201:
 *         description: Message created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Channel not found
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { channelId } = req.query;
    if (typeof channelId !== 'string') {
      return res.status(400).json({ message: 'Invalid channel ID' });
    }

    const message = await channelService.createMessage(user.id, channelId, req.body);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    if (error.message === 'User is not a member of this channel') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
} 