import { Role } from '../models/Role';
import { CreateRoleDTO, UpdateRoleDTO, RoleCreationAttributes } from '../types/RoleTypes';

export class RoleRepository {
  async findById(id: string) {
    return Role.findByPk(id);
  }

  async findByName(name: string) {
    return Role.findOne({ where: { name } });
  }

  async findAll() {
    return Role.findAll();
  }

  async findActive() {
    return Role.findAll({ where: { is_active: true } });
  }

  async create(roleData: CreateRoleDTO) {
    return Role.create(roleData as RoleCreationAttributes);
  }

  async update(id: string, updates: UpdateRoleDTO) {
    return Role.update(updates, { where: { id } });
  }

  async delete(id: string) {
    return Role.destroy({ where: { id } });
  }
}

export const roleRepository = new RoleRepository();
