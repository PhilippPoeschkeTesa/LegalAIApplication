import { Request, Response, NextFunction } from 'express';

/**
 * Role-based authorization middleware
 * @param allowedRoles - Array of role names that are allowed to access the route
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Check if user's role is in the allowed roles
      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Authorization check failed',
      });
    }
  };
}

/**
 * SSO Migration Note:
 * This middleware should work the same with SSO tokens
 * as long as the role claim is properly extracted and
 * attached to req.user in the authMiddleware
 */
