import { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '../../../services/userService';
import { CreateUserDto } from '../../../types/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userService = new UserService();
    
    // Check if user exists before attempting to create
    const { emailExists, usernameExists } = await userService.checkUserExists(email, username);
    
    if (emailExists || usernameExists) {
      return res.status(400).json({
        message: emailExists && usernameExists 
          ? 'Both email and username are already taken'
          : emailExists 
          ? 'Email already exists' 
          : 'Username already exists'
      });
    }

    const user = await userService.createUser({ email, username, password });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 