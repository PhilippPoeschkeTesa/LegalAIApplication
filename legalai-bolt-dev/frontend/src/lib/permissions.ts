import { UserRole } from '../types/api';
import { appRoutes } from './config';

export enum Permission {
  DOCUMENTS_CREATE = 'documents.create',
  DOCUMENTS_READ = 'documents.read',
  DOCUMENTS_UPDATE = 'documents.update',
  DOCUMENTS_DELETE = 'documents.delete',

  CONTRACTS_CREATE = 'contracts.create',
  CONTRACTS_READ = 'contracts.read',
  CONTRACTS_UPDATE = 'contracts.update',
  CONTRACTS_DELETE = 'contracts.delete',
  CONTRACTS_APPROVE = 'contracts.approve',
  CONTRACTS_SUBMIT = 'contracts.submit',

  TEAM_VIEW = 'team.view',
  TEAM_MANAGE = 'team.manage',
  TEAM_ASSIGN = 'team.assign',

  ANALYTICS_VIEW = 'analytics.view',

  SYSTEM_CONFIGURE = 'system.configure',
  SYSTEM_MONITOR = 'system.monitor',

  USERS_CREATE = 'users.create',
  USERS_READ = 'users.read',
  USERS_UPDATE = 'users.update',
  USERS_DELETE = 'users.delete',

  ROLES_CREATE = 'roles.create',
  ROLES_READ = 'roles.read',
  ROLES_UPDATE = 'roles.update',
  ROLES_DELETE = 'roles.delete',

  DEPARTMENTS_CREATE = 'departments.create',
  DEPARTMENTS_READ = 'departments.read',
  DEPARTMENTS_UPDATE = 'departments.update',
  DEPARTMENTS_DELETE = 'departments.delete',
}

export enum RoleName {
  PLATFORM_ADMINISTRATOR = 'Platform Administrator',
  LEGAL_ADMIN = 'Legal Admin',
  DEPARTMENT_ADMIN = 'Department Admin',
  DEPARTMENT_USER = 'Department User',
}

export interface RoutePermission {
  path: string;
  roles?: RoleName[];
  permissions?: Permission[];
  requireAll?: boolean;
}

export const routePermissions: RoutePermission[] = [
  {
    path: appRoutes.home,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
  },
  {
    path: appRoutes.legalai,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
  },
  {
    path: appRoutes.review,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
    permissions: [Permission.CONTRACTS_READ],
  },
  {
    path: appRoutes.draft,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
    permissions: [Permission.DOCUMENTS_CREATE],
  },
  {
    path: appRoutes.builder,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
    permissions: [Permission.DOCUMENTS_CREATE],
  },
  {
    path: appRoutes.repository,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
    permissions: [Permission.DOCUMENTS_READ],
  },
  {
    path: appRoutes.intake,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN],
    permissions: [Permission.CONTRACTS_SUBMIT],
  },
  {
    path: appRoutes.search,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
    permissions: [Permission.DOCUMENTS_READ],
  },
  {
    path: appRoutes.clauses,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN],
    permissions: [Permission.DOCUMENTS_READ],
  },
  {
    path: appRoutes.playbooks,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN],
    permissions: [Permission.DOCUMENTS_READ],
  },
  {
    path: appRoutes.workflows,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN],
    permissions: [Permission.TEAM_VIEW],
  },
  {
    path: appRoutes.analytics,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN],
    permissions: [Permission.ANALYTICS_VIEW],
  },
  {
    path: appRoutes.partners,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
    permissions: [Permission.TEAM_VIEW],
  },
  {
    path: appRoutes.discovery,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
    permissions: [Permission.DOCUMENTS_READ],
  },
  {
    path: appRoutes.research,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
    permissions: [Permission.DOCUMENTS_READ],
  },
  {
    path: appRoutes.admin,
    roles: [RoleName.PLATFORM_ADMINISTRATOR],
    permissions: [Permission.SYSTEM_CONFIGURE],
  },
  {
    path: appRoutes.settings,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
  },
  {
    path: appRoutes.help,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
  },
  {
    path: appRoutes.legal,
    roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN, RoleName.DEPARTMENT_ADMIN, RoleName.DEPARTMENT_USER],
  },
];

export class PermissionChecker {
  private userRoles: UserRole[];

  constructor(userRoles: UserRole[]) {
    this.userRoles = userRoles.filter(ur => ur.is_active !== false && ur.role?.is_active !== false);
  }

  hasRole(roleName: RoleName): boolean {
    return this.userRoles.some(ur => ur.role?.name === roleName);
  }

  hasAnyRole(roleNames: RoleName[]): boolean {
    return roleNames.some(roleName => this.hasRole(roleName));
  }

  hasAllRoles(roleNames: RoleName[]): boolean {
    return roleNames.every(roleName => this.hasRole(roleName));
  }

  hasPermission(permission: Permission): boolean {
    return this.userRoles.some(ur => {
      if (!ur.role?.permissions) return false;

      const [resource, action] = permission.split('.');
      return ur.role.permissions[resource]?.[action] === true;
    });
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  canAccessRoute(routePath: string): boolean {
    const routePermission = routePermissions.find(rp => {
      if (rp.path === routePath) return true;
      if (rp.path.includes(':')) {
        const pattern = rp.path.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(routePath);
      }
      return false;
    });

    if (!routePermission) {
      return true;
    }

    const hasRequiredRole = !routePermission.roles || this.hasAnyRole(routePermission.roles);

    if (!routePermission.permissions) {
      return hasRequiredRole;
    }

    const hasRequiredPermissions = routePermission.requireAll
      ? this.hasAllPermissions(routePermission.permissions)
      : this.hasAnyPermission(routePermission.permissions);

    return hasRequiredRole && hasRequiredPermissions;
  }

  getRoleNames(): string[] {
    return this.userRoles.map(ur => ur.role?.name || '').filter(Boolean);
  }

  isPlatformAdmin(): boolean {
    return this.hasRole(RoleName.PLATFORM_ADMINISTRATOR);
  }

  isLegalAdmin(): boolean {
    return this.hasRole(RoleName.LEGAL_ADMIN);
  }

  isDepartmentAdmin(): boolean {
    return this.hasRole(RoleName.DEPARTMENT_ADMIN);
  }

  isDepartmentUser(): boolean {
    return this.hasRole(RoleName.DEPARTMENT_USER);
  }

  getHighestRole(): RoleName | null {
    if (this.isPlatformAdmin()) return RoleName.PLATFORM_ADMINISTRATOR;
    if (this.isLegalAdmin()) return RoleName.LEGAL_ADMIN;
    if (this.isDepartmentAdmin()) return RoleName.DEPARTMENT_ADMIN;
    if (this.isDepartmentUser()) return RoleName.DEPARTMENT_USER;
    return null;
  }
}

export function createPermissionChecker(userRoles: UserRole[]): PermissionChecker {
  return new PermissionChecker(userRoles);
}

/**
 * Create a simple permission checker from a database role string
 * This is used when user data comes directly from the users table
 * Maps database role strings (admin, viewer) to the RoleName enum
 */
export function createPermissionCheckerFromRole(role: string): PermissionChecker {
  // Map database role strings to RoleName enum
  let roleName: RoleName;
  let permissions: Record<string, any> = {};
  
  switch (role.toLowerCase()) {
    case 'admin':
    case 'platform administrator':
      roleName = RoleName.PLATFORM_ADMINISTRATOR;
      // Admin has ALL permissions
      permissions = {
        documents: { create: true, read: true, update: true, delete: true },
        contracts: { create: true, read: true, update: true, delete: true, approve: true, submit: true },
        team: { view: true, manage: true, assign: true },
        analytics: { view: true },
        system: { configure: true, monitor: true },
        users: { create: true, read: true, update: true, delete: true },
        roles: { create: true, read: true, update: true, delete: true },
        departments: { create: true, read: true, update: true, delete: true },
      };
      break;
    case 'legal admin':
      roleName = RoleName.LEGAL_ADMIN;
      // Legal Admin has most permissions except system configuration
      permissions = {
        documents: { create: true, read: true, update: true, delete: true },
        contracts: { create: true, read: true, update: true, delete: true, approve: true, submit: true },
        team: { view: true, manage: true, assign: true },
        analytics: { view: true },
        users: { read: true, update: true },
      };
      break;
    case 'department admin':
      roleName = RoleName.DEPARTMENT_ADMIN;
      // Department Admin has department-level permissions
      permissions = {
        documents: { create: true, read: true, update: true },
        contracts: { create: true, read: true, submit: true },
        team: { view: true, assign: true },
        analytics: { view: true },
      };
      break;
    case 'viewer':
    case 'department user':
    default:
      roleName = RoleName.DEPARTMENT_USER;
      // Viewer has read-only permissions
      permissions = {
        documents: { read: true },
        contracts: { read: true },
        team: { view: true },
      };
      break;
  }

  // Create a mock UserRole object with permissions
  const mockUserRole: UserRole = {
    id: 'mock-id',
    user_id: 'mock-user-id',
    role_id: 'mock-role-id',
    is_active: true,
    role: {
      id: 'mock-role-id',
      name: roleName,
      is_active: true,
      permissions: permissions,
    },
  };

  return new PermissionChecker([mockUserRole]);
}

export function getAccessibleRoutes(userRoles: UserRole[]): string[] {
  const checker = createPermissionChecker(userRoles);
  return routePermissions
    .filter(rp => checker.canAccessRoute(rp.path))
    .map(rp => rp.path);
}

export function filterRoutesByPermission(routes: RoutePermission[], userRoles: UserRole[]): RoutePermission[] {
  const checker = createPermissionChecker(userRoles);
  return routes.filter(route => checker.canAccessRoute(route.path));
}

/**
 * Create a permission checker from simple route permission keys (like 'home', 'legalai')
 * This is used when loading custom permissions from the user_permissions table
 */
export function createPermissionCheckerFromKeys(permissionKeys: string[]): PermissionChecker {
  // Map route keys to actual route paths
  const routeKeyMap: Record<string, string> = {
    home: appRoutes.home,
    legalai: appRoutes.legalai,
    review: appRoutes.review,
    draft: appRoutes.draft,
    builder: appRoutes.builder,
    repository: appRoutes.repository,
    intake: appRoutes.intake,
    search: appRoutes.search,
    clauses: appRoutes.clauses,
    playbooks: appRoutes.playbooks,
    workflows: appRoutes.workflows,
    analytics: appRoutes.analytics,
    partners: appRoutes.partners,
    discovery: appRoutes.discovery,
    research: appRoutes.research,
    admin: appRoutes.admin,
    settings: appRoutes.settings,
    help: appRoutes.help,
  };

  // Get all route paths that the user has access to
  const allowedRoutes = permissionKeys
    .map(key => routeKeyMap[key])
    .filter(Boolean);

  // Create a custom permission checker that checks if route is in allowed list
  class SimplePermissionChecker extends PermissionChecker {
    constructor() {
      // Create a mock UserRole with a permissive role
      super([{
        id: 'custom',
        user_id: 'custom',
        role_id: 'custom',
        is_active: true,
        role: {
          id: 'custom',
          name: 'Custom',
          is_active: true,
          permissions: {
            documents: { create: true, read: true, update: true, delete: true },
            contracts: { create: true, read: true, update: true, delete: true, approve: true, submit: true },
            team: { view: true, manage: true, assign: true },
            analytics: { view: true },
          },
        },
      }]);
    }

    canAccessRoute(routePath: string): boolean {
      // Check if the route is in the allowed routes list
      return allowedRoutes.includes(routePath);
    }
  }

  return new SimplePermissionChecker();
}
