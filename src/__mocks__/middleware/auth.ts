import { jest } from '@jest/globals';
import { NextApiRequest } from 'next';

export const authenticateUser = jest.fn().mockImplementation(async (req: NextApiRequest) => {
  if (req.headers.authorization) {
    const userId = req.headers.authorization.replace('Bearer ', '');
    return {
      id: userId,
      nickname: 'testuser',
      email: 'test@example.com',
    };
  }
  return null;
}); 