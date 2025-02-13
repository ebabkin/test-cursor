import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../../middleware/auth';
import { ChannelService } from '../../../../../services/channelService';

const channelService = new ChannelService();

// MANUAL: adding missing Get Channel API

/**
 * @swagger
 * /api/v2/channels/{channelId}:
 *   get:
 *     summary: Get channel info
 *     description: The user must be a channel member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Channel info
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a channel member
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    const { channelId } = req.query;

    if (typeof channelId !== 'string') {
        console.error('Invalid channel ID');
        return res.status(400).json({ message: 'Invalid channel ID' });
    }

    try {
         if (req.method === 'GET') {
            const channelInfo = await channelService.getChannelInfo(channelId, req.user!.id);
            res.status(200).json(channelInfo);
        } else {
            res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling channel info:', error);
        if (error.message === 'User is not a member of this channel') {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(handler); 
