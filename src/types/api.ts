export interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Full name from backend
  role?: string; // User role from database (admin, viewer, etc.)
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  permissions?: Record<string, any>;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  assigned_at?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  user?: User;
  role?: Role;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface CreateUserRequest {
  email: string;
  username?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  role?: string;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  role?: string;
}

export interface CreateRoleRequest {
  name: string;
  display_name?: string;
  description?: string;
  permissions?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  display_name?: string;
  description?: string;
  permissions?: Record<string, any>;
  is_active?: boolean;
}

export interface AssignRoleRequest {
  user_id: string;
  role_id: string;
  assigned_by?: string;
  is_active?: boolean;
}

export interface UpdateUserRoleRequest {
  is_active?: boolean;
  assigned_by?: string;
}
