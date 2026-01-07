import { UserPermission } from '../models/UserPermission';

export class UserPermissionRepository {
  /**
   * Get all permissions for a user
   */
  async findByUserId(userId: string): Promise<UserPermission[]> {
    return UserPermission.findAll({
      where: { user_id: userId },
    });
  }

  /**
   * Set permissions for a user (replaces all existing permissions)
   */
  async setUserPermissions(userId: string, permissionKeys: string[]): Promise<void> {
    // Delete all existing permissions
    await UserPermission.destroy({
      where: { user_id: userId },
    });

    // Insert new permissions
    if (permissionKeys.length > 0) {
      const permissions = permissionKeys.map(key => ({
        user_id: userId,
        permission_key: key,
      }));

      await UserPermission.bulkCreate(permissions);
    }
  }

  /**
   * Add a single permission to a user
   */
  async addPermission(userId: string, permissionKey: string): Promise<UserPermission> {
    return UserPermission.create({
      user_id: userId,
      permission_key: permissionKey,
    });
  }

  /**
   * Remove a single permission from a user
   */
  async removePermission(userId: string, permissionKey: string): Promise<number> {
    return UserPermission.destroy({
      where: {
        user_id: userId,
        permission_key: permissionKey,
      },
    });
  }

  /**
   * Delete all permissions for a user
   */
  async deleteByUserId(userId: string): Promise<number> {
    return UserPermission.destroy({
      where: { user_id: userId },
    });
  }
}

export const userPermissionRepository = new UserPermissionRepository();
