import { Optional } from 'sequelize';

export interface UserRoleAttributes {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at?: Date;
  assigned_by?: string;
  is_active: boolean;
}

export interface CreateUserRoleDTO {
  user_id: string;
  role_id: string;
  assigned_by?: string;
  is_active?: boolean;
}

export interface UpdateUserRoleDTO {
  is_active?: boolean;
  assigned_by?: string;
}

export interface UserRoleCreationAttributes extends Optional<UserRoleAttributes, 'id' | 'assigned_at' | 'assigned_by' | 'is_active'> {}

export interface UserWithRolesDTO {
  user_id: string;
  user_name: string;
  user_email: string;
  roles: Array<{
    role_id: string;
    role_name: string;
    assigned_at: Date;
    is_active: boolean;
  }>;
}
