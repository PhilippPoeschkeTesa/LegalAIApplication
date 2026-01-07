import { UserRole } from '../models/UserRole';
import { CreateUserRoleDTO, UpdateUserRoleDTO } from '../types/UserRoleTypes';
import { userRoleRepository } from '../repository/userRoleRepository';
import { userRepository } from '../repository/userRepository';
import { roleRepository } from '../repository/roleRepository';

export class UserRoleService {
  async getAllUserRoles(): Promise<UserRole[]> {
    try {
      const userRoles = await userRoleRepository.findAll();
      return userRoles as UserRole[];
    } catch (error) {
      throw error;
    }
  }

  async getUserRoleById(id: string): Promise<UserRole | null> {
    try {
      const userRole = await userRoleRepository.findById(id);
      if (!userRole) {
        return null;
      }
      return userRole as UserRole;
    } catch (error) {
      throw error;
    }
  }

  async getRolesByUserId(userId: string): Promise<UserRole[]> {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      const userRoles = await userRoleRepository.findByUserId(userId);
      return userRoles as UserRole[];
    } catch (error) {
      throw error;
    }
  }

  async getActiveRolesByUserId(userId: string): Promise<UserRole[]> {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      const userRoles = await userRoleRepository.findActiveByUserId(userId);
      return userRoles as UserRole[];
    } catch (error) {
      throw error;
    }
  }

  async getUsersByRoleId(roleId: string): Promise<UserRole[]> {
    try {
      const role = await roleRepository.findById(roleId);
      if (!role) {
        throw new Error('Role not found');
      }
      const userRoles = await userRoleRepository.findByRoleId(roleId);
      return userRoles as UserRole[];
    } catch (error) {
      throw error;
    }
  }

  async assignRoleToUser(userRoleData: CreateUserRoleDTO): Promise<UserRole> {
    try {
      const user = await userRepository.findById(userRoleData.user_id);
      if (!user) {
        throw new Error('User not found');
      }

      const role = await roleRepository.findById(userRoleData.role_id);
      if (!role) {
        throw new Error('Role not found');
      }

      const existingAssignment = await userRoleRepository.findByUserAndRole(
        userRoleData.user_id,
        userRoleData.role_id
      );
      if (existingAssignment) {
        throw new Error('User already has this role assigned');
      }

      const userRole = await userRoleRepository.create(userRoleData);
      return userRole as UserRole;
    } catch (error) {
      throw error;
    }
  }

  async updateUserRole(id: string, updates: UpdateUserRoleDTO): Promise<UserRole | null> {
    try {
      await userRoleRepository.update(id, updates);
      const updatedUserRole = await userRoleRepository.findById(id);
      if (!updatedUserRole) {
        return null;
      }
      return updatedUserRole as UserRole;
    } catch (error) {
      throw error;
    }
  }

  async removeRoleFromUser(id: string): Promise<boolean> {
    try {
      const deleted = await userRoleRepository.delete(id);
      return deleted > 0;
    } catch (error) {
      throw error;
    }
  }

  async removeRoleFromUserByIds(userId: string, roleId: string): Promise<boolean> {
    try {
      const deleted = await userRoleRepository.deleteByUserAndRole(userId, roleId);
      return deleted > 0;
    } catch (error) {
      throw error;
    }
  }
}

export const userRoleService = new UserRoleService();
