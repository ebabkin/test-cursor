import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '../../../../../middleware/auth';
import { ChannelService } from '../../../../../services/channelService';

/**
 * @swagger
 * /api/v2/channels/{channelId}/members:
 *   get:
 *     summary: Get channel members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Channel members retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Channel not found
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { channelId } = req.query;
  if (!channelId || Array.isArray(channelId)) {
    return res.status(400).json({ message: 'Invalid channel ID' });
  }

  const channelService = new ChannelService();

  try {
    const members = await channelService.getChannelMembers(channelId);
    res.status(200).json(members);
  } catch (error) {
    console.error('Error getting channel members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 