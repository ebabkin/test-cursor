import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../../middleware/auth';
import { ChannelService } from '../../../../../services/channelService';

const channelService = new ChannelService();

/**
 * @swagger
 * /api/v2/channels/{channelId}/leave:
 *   post:
 *     summary: Leave a channel
 *     description: Leave a channel. Channel owners cannot leave their channels.
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
 *         description: Successfully left channel
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot leave (owner)
 *       404:
 *         description: Channel not found
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { channelId } = req.query;

    if (typeof channelId !== 'string') {
        return res.status(400).json({ message: 'Invalid channel ID' });
    }

    try {
        await channelService.leaveChannel(req.user!.id, channelId);
        res.status(200).json({ message: 'Successfully left channel' });
    } catch (error) {
        if (error.message === 'Channel not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Cannot leave channel as owner') {
            return res.status(403).json({ message: error.message });
        }
        console.error('Error leaving channel:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(handler); 