import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../../middleware/auth';
import { ChannelService } from '../../../../../services/channelService';
import { CreateMessageV2Dto } from '../../../../../types/channel';

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
 *           format: uuid
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
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a channel member
 *   get:
 *     summary: Get channel messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a channel member
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    const { channelId } = req.query;

    if (typeof channelId !== 'string') {
        return res.status(400).json({ message: 'Invalid channel ID' });
    }

    try {
        if (req.method === 'POST') {
            const data: CreateMessageV2Dto = {
                channel_id: channelId,
                content: req.body.content
            };

            if (!data.content?.trim()) {
                return res.status(400).json({ message: 'Content is required' });
            }

            const message = await channelService.createMessage(req.user!.id, data);
            res.status(201).json(message);
        } else if (req.method === 'GET') {
            const limit = parseInt(req.query.limit as string) || 50;
            const before = req.query.before ? new Date(req.query.before as string) : undefined;

            const messages = await channelService.getChannelMessages(
                channelId,
                req.user!.id,
                limit,
                before
            );
            res.status(200).json(messages);
        } else {
            res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        if (error.message === 'User is not a member of this channel') {
            return res.status(403).json({ message: error.message });
        }
        console.error('Error handling channel messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(handler); 