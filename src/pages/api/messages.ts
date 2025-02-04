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
  const formattedDate = formatDate(now);

  const response = `Message accepted, length: ${message.length} on ${formattedDate} UTC`;

  res.status(200).json({ response });
}

function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
} 