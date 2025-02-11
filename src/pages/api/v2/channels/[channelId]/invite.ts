import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../../middleware/auth';
import { ChannelService } from '../../../../../services/channelService';

const channelService = new ChannelService();

/**
 * @swagger
 * /api/v2/channels/{channelId}/invite:
 *   post:
 *     summary: Invite a user to a channel
 *     description: Invite a user to a private channel by their nickname or email
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
 *               - userIdentifier
 *             properties:
 *               userIdentifier:
 *                 type: string
 *                 description: User's nickname or email
 *     responses:
 *       200:
 *         description: User successfully invited
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a channel member
 *       404:
 *         description: Channel or user not found
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { channelId } = req.query;
    const { userIdentifier } = req.body;

    if (typeof channelId !== 'string' || !userIdentifier?.trim()) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        await channelService.inviteUser(req.user!.id, channelId, userIdentifier);
        res.status(200).json({ message: 'User successfully invited' });
    } catch (error) {
        if (error.message === 'Channel not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Not a channel member' || error.message === 'Channel is not private') {
            return res.status(403).json({ message: error.message });
        }
        console.error('Error inviting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(handler); 