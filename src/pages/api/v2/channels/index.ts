import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { ChannelService } from '../../../../services/channelService';
import { CreateChannelDto } from '../../../../types/channel';

const channelService = new ChannelService();

/**
 * @swagger
 * /api/v2/channels:
 *   post:
 *     summary: Create a new channel
 *     description: Creates a new channel and adds the creator as a member
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Channel title
 *               description:
 *                 type: string
 *                 description: Optional channel description
 *               is_private:
 *                 type: boolean
 *                 description: Whether the channel is private
 *               region_id:
 *                 type: string
 *                 description: Region ID (defaults to 'DEFAULT')
 *     responses:
 *       201:
 *         description: Channel created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 *   get:
 *     summary: List public channels
 *     description: Get a list of public channels, sorted by last message date
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of channels
 *       401:
 *         description: Unauthorized
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const before = req.query.before ? new Date(req.query.before as string) : undefined;

            const channels = await channelService.listPublicChannels(limit, before);
            res.status(200).json(channels);
        } catch (error) {
            console.error('Error listing channels:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const data: CreateChannelDto = req.body;
        
        if (!data.title?.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const channel = await channelService.createChannel(req.user!.id, data);
        res.status(201).json(channel);
    } catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(handler); 