import { UserRole } from '../models/UserRole';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { CreateUserRoleDTO, UpdateUserRoleDTO, UserRoleCreationAttributes } from '../types/UserRoleTypes';

export class UserRoleRepository {
  async findById(id: string) {
    return UserRole.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Role, as: 'role', attributes: ['id', 'name', 'description', 'permissions'] },
      ],
    });
  }

  async findAll() {
    return UserRole.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Role, as: 'role', attributes: ['id', 'name', 'description', 'permissions'] },
      ],
    });
  }

  async findByUserId(userId: string) {
    return UserRole.findAll({
      where: { user_id: userId },
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name', 'description', 'permissions', 'is_active'] },
      ],
    });
  }

  async findByRoleId(roleId: string) {
    return UserRole.findAll({
      where: { role_id: roleId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
    });
  }

  async findActiveByUserId(userId: string) {
    return UserRole.findAll({
      where: { user_id: userId, is_active: true },
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name', 'description', 'permissions', 'is_active'] },
      ],
    });
  }

  async findByUserAndRole(userId: string, roleId: string) {
    return UserRole.findOne({
      where: { user_id: userId, role_id: roleId },
    });
  }

  async create(userRoleData: CreateUserRoleDTO) {
    return UserRole.create(userRoleData as UserRoleCreationAttributes);
  }

  async update(id: string, updates: UpdateUserRoleDTO) {
    return UserRole.update(updates, { where: { id } });
  }

  async delete(id: string) {
    return UserRole.destroy({ where: { id } });
  }

  async deleteByUserAndRole(userId: string, roleId: string) {
    return UserRole.destroy({ where: { user_id: userId, role_id: roleId } });
  }
}

export const userRoleRepository = new UserRoleRepository();
