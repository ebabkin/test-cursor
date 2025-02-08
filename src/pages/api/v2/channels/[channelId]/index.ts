import { NextApiRequest, NextApiResponse } from 'next';
import { ChannelService } from '../../../../../services/channelService';
import { authenticateUser } from '../../../../../middleware/auth';

const channelService = new ChannelService();

/**
 * @swagger
 * /api/v2/channels/{channelId}:
 *   get:
 *     summary: Get channel details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Channel details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Channel not found
 *   put:
 *     summary: Update channel details
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Channel updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not channel owner
 *       404:
 *         description: Channel not found
 *   delete:
 *     summary: Delete a channel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Channel deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not channel owner
 *       404:
 *         description: Channel not found
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { channelId } = req.query;
    if (typeof channelId !== 'string') {
      return res.status(400).json({ message: 'Invalid channel ID' });
    }

    switch (req.method) {
      case 'GET':
        return handleGet(user.id, channelId, res);
      case 'PUT':
        return handlePut(user.id, channelId, req.body, res);
      case 'DELETE':
        return handleDelete(user.id, channelId, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling channel request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGet(userId: string, channelId: string, res: NextApiResponse) {
  const channel = await channelService.getChannelById(userId, channelId);
  if (!channel) {
    return res.status(404).json({ message: 'Channel not found' });
  }
  res.status(200).json(channel);
}

async function handlePut(userId: string, channelId: string, data: any, res: NextApiResponse) {
  try {
    const channel = await channelService.updateChannel(userId, channelId, data);
    res.status(200).json(channel);
  } catch (error) {
    if (error.message === 'Channel not found or user is not owner') {
      return res.status(403).json({ message: error.message });
    }
    throw error;
  }
}

async function handleDelete(userId: string, channelId: string, res: NextApiResponse) {
  try {
    await channelService.deleteChannel(userId, channelId);
    res.status(204).end();
  } catch (error) {
    if (error.message === 'Channel not found or user is not owner') {
      return res.status(403).json({ message: error.message });
    }
    throw error;
  }
} 