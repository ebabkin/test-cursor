import { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '../../../services/userService';
import { CreateUserDto } from '../../../types/user';

const userService = new UserService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userData: CreateUserDto = req.body;

    // Validate input
    if (!userData.email || !userData.nickname || !userData.password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
      const user = await userService.createUser(userData);
      delete user.password;
      res.status(201).json(user);
    } catch (error) {
      if (error.message === 'Email already registered') {
        return res.status(409).json({ message: 'Email already registered' });
      }
      if (error.message === 'Nickname already taken') {
        return res.status(409).json({ message: 'Nickname already taken' });
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 