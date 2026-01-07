import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Authentication middleware - Verify JWT token and attach user to request
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
    res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
}

/**
 * SSO Migration Note:
 * When migrating to SSO, replace this middleware with:
 * 1. Extract SSO token from Authorization header
 * 2. Verify token with SSO provider's validation endpoint or public key
 * 3. Extract user claims from SSO token (sub, email, roles, etc.)
 * 4. Map SSO claims to req.user structure
 * Keep the same req.user interface for backward compatibility
 */
