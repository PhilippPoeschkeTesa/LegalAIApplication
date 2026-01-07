import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

/**
 * Login controller - Authenticate user with email and password
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    // Find user by email
    const user = await userService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return success with token and user data (exclude password)
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login',
    });
  }
}

/**
 * Logout controller - Client-side token removal
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  // With JWT, logout is primarily client-side (removing token)
  // This endpoint can be used for logging purposes or future token blacklisting
  res.json({
    success: true,
    message: 'Logout successful',
  });
}

/**
 * Get current user controller - Returns authenticated user's information
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    // User is attached to request by authMiddleware
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Return user data (exclude password)
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while fetching user data',
    });
  }
}

/**
 * SSO Migration Note:
 * When migrating to SSO:
 * 1. Replace login() with SSO redirect/callback handler
 * 2. Exchange SSO authorization code for tokens
 * 3. Extract user info from SSO claims
 * 4. Keep the same response format for frontend compatibility
 * 5. Logout should redirect to SSO logout endpoint
 * 6. getMe() can remain similar, extracting user from SSO token
 */
