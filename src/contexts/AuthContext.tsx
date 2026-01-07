import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mockData } from '../lib/config';
import { apiClient } from '../lib/apiClient';
import { createPermissionChecker, createPermissionCheckerFromRole, createPermissionCheckerFromKeys, PermissionChecker } from '../lib/permissions';
import type { User, UserRole } from '../types/api';

interface AuthContextType {
  user: User | null;
  userRoles: UserRole[];
  permissions: PermissionChecker | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoLogin: () => void;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'legalai_demo_user';
const USER_ROLES_KEY = 'legalai_user_roles';
const JWT_TOKEN_KEY = 'legalai_jwt_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<PermissionChecker | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId: string) => {
    try {
      const response = await apiClient.userRoles.getActiveByUserId(userId);
      if (response.success && response.data) {
        const roles = Array.isArray(response.data) ? response.data : [response.data];
        setUserRoles(roles);
        setPermissions(createPermissionChecker(roles));
        localStorage.setItem(USER_ROLES_KEY, JSON.stringify(roles));
        return roles;
      } else {
        console.error('Failed to fetch user roles:', response.error);
        setUserRoles([]);
        setPermissions(null);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
      setPermissions(null);
      return [];
    }
  };

  const refreshRoles = async () => {
    if (user) {
      await fetchUserRoles(user.id);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Try to load JWT token from localStorage
      const token = localStorage.getItem(JWT_TOKEN_KEY);

      if (token) {
        try {
          // Set token in API client
          apiClient.setToken(token);

          // Validate token by fetching current user
          const response = await apiClient.auth.getMe();
          
          if (response.success && response.data) {
            setUser(response.data);
            
            // Try to load custom permissions from database
            if (response.data.id) {
              try {
                const permResponse = await apiClient.users.getPermissions(response.data.id);
                if (permResponse.success && permResponse.data && permResponse.data.length > 0) {
                  // User has custom permissions, use simple route-based checker
                  const customPermissions = createPermissionCheckerFromKeys(permResponse.data);
                  setPermissions(customPermissions);
                  setUserRoles([]);
                  setLoading(false);
                  return;
                }
              } catch (permError) {
                console.warn('Could not load custom permissions, using role-based:', permError);
              }
            }
            
            // If user has a role field, use it directly for permissions
            if (response.data.role) {
              const rolePermissions = createPermissionCheckerFromRole(response.data.role);
              setPermissions(rolePermissions);
              setUserRoles([]); // No userRoles from RBAC system
            } else {
              // Fallback: Fetch user roles from RBAC system
              await fetchUserRoles(response.data.id);
            }
          } else {
            // Token is invalid, clear it
            localStorage.removeItem(JWT_TOKEN_KEY);
            apiClient.setToken(null);
          }
        } catch (e) {
          console.error('Failed to validate token', e);
          localStorage.removeItem(JWT_TOKEN_KEY);
          apiClient.setToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.auth.login(email, password);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const { token, user: userData } = response.data;

      // Store token
      localStorage.setItem(JWT_TOKEN_KEY, token);
      apiClient.setToken(token);

      // Set user
      setUser(userData);

      // Try to load custom permissions from database
      if (userData.id) {
        try {
          const permResponse = await apiClient.users.getPermissions(userData.id);
          if (permResponse.success && permResponse.data && permResponse.data.length > 0) {
            // User has custom permissions, use simple route-based checker
            const customPermissions = createPermissionCheckerFromKeys(permResponse.data);
            setPermissions(customPermissions);
            setUserRoles([]);
            return;
          }
        } catch (permError) {
          console.warn('Could not load custom permissions, using role-based:', permError);
        }
      }

      // If user has a role field, use it directly for permissions
      if (userData.role) {
        const rolePermissions = createPermissionCheckerFromRole(userData.role);
        setPermissions(rolePermissions);
        setUserRoles([]); // No userRoles from RBAC system
      } else {
        // Fallback: Fetch user roles from RBAC system
        await fetchUserRoles(userData.id);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (_email: string, _password: string, _fullName: string) => {
    throw new Error('Registration not yet implemented');
  };

  const signOut = async () => {
    try {
      // Call logout endpoint (optional)
      await apiClient.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem(JWT_TOKEN_KEY);
      localStorage.removeItem(DEMO_USER_KEY);
      localStorage.removeItem(USER_ROLES_KEY);
      apiClient.setToken(null);
      setUser(null);
      setUserRoles([]);
      setPermissions(null);
    }
  };

  const demoLogin = async () => {
    const mockUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email: mockData.demoUser.email,
      first_name: mockData.demoUser.name.split(' ')[0],
      last_name: mockData.demoUser.name.split(' ')[1] || '',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    await fetchUserRoles(mockUser.id);
  };

  return (
    <AuthContext.Provider value={{ user, userRoles, permissions, loading, signIn, signUp, signOut, demoLogin, refreshRoles }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
