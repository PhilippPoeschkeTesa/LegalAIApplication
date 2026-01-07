import { Request, Response } from 'express';
import { userPermissionService } from '../services/userPermissionService';
import { userService } from '../services/userService';

/**
 * Get permissions for a specific user
 * GET /api/users/:userId/permissions
 */
export async function getUserPermissions(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    const permissions = await userPermissionService.getUserPermissions(userId);

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user permissions',
    });
  }
}

/**
 * Set permissions for a specific user
 * PUT /api/users/:userId/permissions
 */
export async function setUserPermissions(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    // Validate input
    if (!Array.isArray(permissions)) {
      res.status(400).json({
        success: false,
        error: 'Permissions must be an array',
      });
      return;
    }

    // Verify user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Set permissions
    await userPermissionService.setUserPermissions(userId, permissions);

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      data: permissions,
    });
  } catch (error) {
    console.error('Error setting user permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set user permissions',
    });
  }
}

/**
 * Add a single permission to a user
 * POST /api/users/:userId/permissions
 */
export async function addUserPermission(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { permission } = req.body;

    if (!permission || typeof permission !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Permission key is required',
      });
      return;
    }

    // Verify user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    await userPermissionService.addPermission(userId, permission);

    res.json({
      success: true,
      message: 'Permission added successfully',
    });
  } catch (error) {
    console.error('Error adding user permission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add user permission',
    });
  }
}

/**
 * Remove a single permission from a user
 * DELETE /api/users/:userId/permissions/:permission
 */
export async function removeUserPermission(req: Request, res: Response): Promise<void> {
  try {
    const { userId, permission } = req.params;

    const removed = await userPermissionService.removePermission(userId, permission);

    if (!removed) {
      res.status(404).json({
        success: false,
        error: 'Permission not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Permission removed successfully',
    });
  } catch (error) {
    console.error('Error removing user permission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove user permission',
    });
  }
}

export const userPermissionController = {
  getUserPermissions,
  setUserPermissions,
  addUserPermission,
  removeUserPermission,
};
