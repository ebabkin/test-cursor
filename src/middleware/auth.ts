import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    nickname: string;
  };
}

type NextApiHandler = (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>;

export const withAuth = (handler: NextApiHandler) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Skip auth for OPTIONS requests (CORS preflight)
      if (req.method === 'OPTIONS') {
        return handler(req, res);
      }

      const token = extractTokenFromHeader(req.headers.authorization);
      const decoded = verifyToken(token);

      // Add user info to request
      req.user = {
        id: decoded.sub as string,
        email: decoded.email as string,
        nickname: decoded.nickname as string
      };

      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}; 