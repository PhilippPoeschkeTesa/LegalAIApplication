import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 * @param payload - User data to encode in the token
 * @returns JWT token string
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * SSO Migration Note:
 * When migrating to SSO, replace these functions with:
 * - generateToken() -> Exchange SSO token with your identity provider
 * - verifyToken() -> Verify SSO token using provider's public key/endpoint
 * The JwtPayload structure can remain the same if SSO claims are mapped accordingly
 */
