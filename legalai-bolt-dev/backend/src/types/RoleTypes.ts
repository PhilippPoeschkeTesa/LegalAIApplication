import { Optional } from 'sequelize';

export interface RolePermissions {
  [key: string]: any;
}

export interface RoleAttributes {
  id: string;
  name: string;
  description?: string;
  permissions: RolePermissions;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
  permissions?: RolePermissions;
  is_active?: boolean;
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  permissions?: RolePermissions;
  is_active?: boolean;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'created_at' | 'updated_at' | 'description' | 'permissions' | 'is_active'> {}

export enum RoleNames {
  PLATFORM_ADMINISTRATOR = 'Platform Administrator',
  LEGAL_ADMIN = 'Legal Admin',
  DEPARTMENT_ADMIN = 'Department Admin',
  DEPARTMENT_USER = 'Department User',
}
