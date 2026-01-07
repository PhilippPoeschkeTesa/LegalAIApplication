import { apiConfig, buildUrl, getAuthHeaders } from './apiConfig';
import type {
  User,
  Role,
  UserRole,
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
  UpdateUserRoleRequest,
} from '../types/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    const headers = getAuthHeaders(this.token || undefined);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: AbortSignal.timeout(apiConfig.timeout),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  users = {
    getAll: () => this.get<User[]>('/api/users'),
    getById: (id: string) => this.get<User>(`/api/users/${id}`),
    create: (data: CreateUserRequest) => this.post<User>('/api/users', data),
    update: (id: string, data: UpdateUserRequest) =>
      this.put<User>(`/api/users/${id}`, data),
    delete: (id: string) => this.delete<void>(`/api/users/${id}`),
    
    // Permission management
    getPermissions: (userId: string) => 
      this.get<string[]>(`/api/users/${userId}/permissions`),
    setPermissions: (userId: string, permissions: string[]) => 
      this.put<void>(`/api/users/${userId}/permissions`, { permissions }),
    addPermission: (userId: string, permission: string) => 
      this.post<void>(`/api/users/${userId}/permissions`, { permission }),
    removePermission: (userId: string, permission: string) => 
      this.delete<void>(`/api/users/${userId}/permissions/${permission}`),
  };

  roles = {
    getAll: () => this.get<Role[]>('/api/roles'),
    getActive: () => this.get<Role[]>('/api/roles/active'),
    getById: (id: string) => this.get<Role>(`/api/roles/${id}`),
    getByName: (name: string) => this.get<Role>(`/api/roles/name/${name}`),
    create: (data: CreateRoleRequest) => this.post<Role>('/api/roles', data),
    update: (id: string, data: UpdateRoleRequest) =>
      this.put<Role>(`/api/roles/${id}`, data),
    delete: (id: string) => this.delete<void>(`/api/roles/${id}`),
  };

  userRoles = {
    getAll: () => this.get<UserRole[]>('/api/user-roles'),
    getById: (id: string) => this.get<UserRole>(`/api/user-roles/${id}`),
    getByUserId: (userId: string) =>
      this.get<UserRole[]>(`/api/user-roles/user/${userId}`),
    getActiveByUserId: (userId: string) =>
      this.get<UserRole[]>(`/api/user-roles/user/${userId}/active`),
    getByRoleId: (roleId: string) =>
      this.get<UserRole[]>(`/api/user-roles/role/${roleId}`),
    assign: (data: AssignRoleRequest) =>
      this.post<UserRole>('/api/user-roles', data),
    update: (id: string, data: UpdateUserRoleRequest) =>
      this.put<UserRole>(`/api/user-roles/${id}`, data),
    remove: (id: string) => this.delete<void>(`/api/user-roles/${id}`),
    removeByUserAndRole: (userId: string, roleId: string) =>
      this.delete<void>(`/api/user-roles/user/${userId}/role/${roleId}`),
  };

  files = {
    upload: async (file: File, directory: string = 'legal'): Promise<ApiResponse<{ url: string }>> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', directory);

      const url = buildUrl('/api/files/upload');
      const headers: Record<string, string> = {};

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: formData,
          signal: AbortSignal.timeout(apiConfig.timeout),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.message || data.error || 'Upload failed',
          };
        }

        return {
          success: true,
          data: data,
          message: data.message,
        };
      } catch (error) {
        console.error('File upload error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
        };
      }
    },
  };

  documents = {
    generatePreview: (builderState: any) =>
      this.post<any>('/api/documents/generate-preview', builderState),
  };

  auth = {
    login: (email: string, password: string) =>
      this.post<{ token: string; user: User }>('/api/auth/login', { email, password }),
    logout: () => this.post<void>('/api/auth/logout'),
    getMe: () => this.get<User>('/api/auth/me'),
  };
}

export const apiClient = new ApiClient();
