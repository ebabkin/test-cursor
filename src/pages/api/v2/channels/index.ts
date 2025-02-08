import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '../../../../middleware/auth';
import { ChannelService } from '../../../../services/channelService';

const channelService = new ChannelService();

/**
 * @swagger
 * /api/v2/channels:
 *   post:
 *     summary: Create a new channel
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
 *               description:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *               regionId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Channel created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const channel = await channelService.createChannel(user.id, req.body);
    res.status(201).json(channel);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const channel = await channelService.getChannelById(user.id, req.query.channelId as string);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    res.status(200).json(channel);
  } catch (error) {
    console.error('Error getting channel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Implement your handler functions here... 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      return handlePost(req, res, user);
    case 'GET':
      return handleGet(req, res, user);
    case 'PUT':
      return handlePut(req, res, user);
    case 'DELETE':
      return handleDelete(req, res, user);
    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 