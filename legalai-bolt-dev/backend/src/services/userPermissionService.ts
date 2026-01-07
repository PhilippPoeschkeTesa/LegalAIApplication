import { userPermissionRepository } from '../repository/userPermissionRepository';
import { UserPermission } from '../models/UserPermission';

export class UserPermissionService {
  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const permissions = await userPermissionRepository.findByUserId(userId);
    return permissions.map(p => p.permission_key);
  }

  /**
   * Set permissions for a user (replaces all existing)
   */
  async setUserPermissions(userId: string, permissionKeys: string[]): Promise<void> {
    await userPermissionRepository.setUserPermissions(userId, permissionKeys);
  }

  /**
   * Add a permission to a user
   */
  async addPermission(userId: string, permissionKey: string): Promise<UserPermission> {
    return userPermissionRepository.addPermission(userId, permissionKey);
  }

  /**
   * Remove a permission from a user
   */
  async removePermission(userId: string, permissionKey: string): Promise<boolean> {
    const deleted = await userPermissionRepository.removePermission(userId, permissionKey);
    return deleted > 0;
  }
}

export const userPermissionService = new UserPermissionService();
