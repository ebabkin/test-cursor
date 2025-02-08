import { jest } from '@jest/globals';
import { NextApiRequest } from 'next';

const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  nickname: 'testuser',
  email: 'test@example.com',
};

const authenticateUser = jest.fn();

export { authenticateUser, mockUser }; 