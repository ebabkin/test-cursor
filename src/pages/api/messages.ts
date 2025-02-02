import type { NextApiRequest, NextApiResponse } from 'next';

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