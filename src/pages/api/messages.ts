import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message and get a response
 *     description: Accepts a message and returns a confirmation with timestamp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message to be sent
 *     responses:
 *       200:
 *         description: Message successfully processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: Confirmation message with timestamp
 *       405:
 *         description: Method not allowed
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;

  // Log message to stdout
  console.log('Received message:', message);

  // Format current date
  const now = new Date();
  const formattedDate = now.toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0]
    .replace('T', ' ') + ' UTC';

  const response = `Message accepted, length:${message.length} at date:${formattedDate}`;

  res.status(200).json({ response });
} 