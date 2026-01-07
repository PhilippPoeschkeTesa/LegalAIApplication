import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * Authentication Routes
 */

// POST /api/auth/login - User login with email and password
router.post('/login', login);

// POST /api/auth/logout - User logout (client-side token removal)
router.post('/logout', logout);

// GET /api/auth/me - Get current authenticated user's information
router.get('/me', authMiddleware, getMe);

export default router;
