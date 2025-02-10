import jwt from 'jsonwebtoken';
import { User } from '../types/user';

const decodeBase64 = (base64String: string): string => {
  return Buffer.from(base64String, 'base64').toString('utf-8');
};

const getPrivateKey = () => {
  const key = process.env.JWT_PRIVATE_KEY;
  if (!key) {
    throw new Error('JWT_PRIVATE_KEY environment variable is not set');
  }
  return decodeBase64(key);
};

const getPublicKey = () => {
  const key = process.env.JWT_PUBLIC_KEY;
  if (!key) {
    throw new Error('JWT_PUBLIC_KEY environment variable is not set');
  }
  return decodeBase64(key);
};

export const generateToken = (user: User): string => {
  const privateKey = getPrivateKey();
  
  // Create token payload
  const payload = {
    sub: user.id,
    email: user.email,
    nickname: user.nickname
  };

  // Sign token with private key using RS256 algorithm
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '24h' // Token expires in 24 hours
  });
};

export const verifyToken = (token: string): jwt.JwtPayload => {
  const publicKey = getPublicKey();
  
  try {
    // Verify token with public key
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });
    
    return decoded as jwt.JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const extractTokenFromHeader = (authHeader?: string): string => {
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header format');
  }

  return parts[1];
}; 