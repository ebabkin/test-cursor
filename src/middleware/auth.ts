import { NextApiRequest } from 'next';
import { pool } from '../config/database';
import { User } from '../types/user';

/**
 * Authenticates a user from the request
 * Currently uses a simple token-based authentication
 * TODO: Implement proper JWT authentication
 */
export async function authenticateUser(req: NextApiRequest): Promise<User | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  if (!token) {
    return null;
  }

  try {
    // For now, assume token is the user ID
    // TODO: Implement proper JWT verification
    const result = await pool.query(
      'SELECT id, nickname, email, creation_date FROM users WHERE id = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
} 