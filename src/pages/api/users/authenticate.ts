import { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '../../../services/userService';
import { AuthenticateUserDto } from '../../../types/user';

const userService = new UserService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const credentials: AuthenticateUserDto = req.body;

    if (!credentials.email || !credentials.password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userService.authenticateUser(credentials);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 