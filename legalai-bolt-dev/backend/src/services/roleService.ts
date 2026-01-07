import { Role } from '../models/Role';
import { CreateRoleDTO, UpdateRoleDTO } from '../types/RoleTypes';
import { roleRepository } from '../repository/roleRepository';

export class RoleService {
  async getAllRoles(): Promise<Role[]> {
    try {
      const roles = await roleRepository.findAll();
      return roles as Role[];
    } catch (error) {
      throw error;
    }
  }

  async getActiveRoles(): Promise<Role[]> {
    try {
      const roles = await roleRepository.findActive();
      return roles as Role[];
    } catch (error) {
      throw error;
    }
  }

  async getRoleById(id: string): Promise<Role | null> {
    try {
      const role = await roleRepository.findById(id);
      if (!role) {
        return null;
      }
      return role as Role;
    } catch (error) {
      throw error;
    }
  }

  async getRoleByName(name: string): Promise<Role | null> {
    try {
      const role = await roleRepository.findByName(name);
      if (!role) {
        return null;
      }
      return role as Role;
    } catch (error) {
      throw error;
    }
  }

  async createRole(roleData: CreateRoleDTO): Promise<Role> {
    try {
      const existingRole = await roleRepository.findByName(roleData.name);
      if (existingRole) {
        throw new Error('Role with this name already exists');
      }
      const role = await roleRepository.create(roleData);
      return role as Role;
    } catch (error) {
      throw error;
    }
  }

  async updateRole(id: string, updates: UpdateRoleDTO): Promise<Role | null> {
    try {
      if (updates.name) {
        const existingRole = await roleRepository.findByName(updates.name);
        if (existingRole && existingRole.id !== id) {
          throw new Error('Role with this name already exists');
        }
      }

      await roleRepository.update(id, updates);
      const updatedRole = await roleRepository.findById(id);
      if (!updatedRole) {
        return null;
      }
      return updatedRole as Role;
    } catch (error) {
      throw error;
    }
  }

  async deleteRole(id: string): Promise<boolean> {
    try {
      const deleted = await roleRepository.delete(id);
      return deleted > 0;
    } catch (error) {
      throw error;
    }
  }
}

export const roleService = new RoleService();
