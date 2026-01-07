# Frontend RBAC Implementation Guide

## Overview

This document describes the Role-Based Access Control (RBAC) implementation on the frontend of the Legal AI platform. The RBAC system ensures that users only see and access features they are authorized to use based on their assigned roles.

## Architecture

### Key Components

1. **Permissions Utility** (`src/lib/permissions.ts`)
   - Centralized permission definitions
   - Permission checking logic
   - Route-to-role mapping

2. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Manages authentication state
   - Fetches and stores user roles
   - Provides permission checker instance

3. **ProtectedRoute** (`src/App.tsx`)
   - Guards routes from unauthorized access
   - Redirects to unauthorized page if access denied

4. **Layout** (`src/components/Layout.tsx`)
   - Filters navigation items based on permissions

5. **Unauthorized Page** (`src/pages/Unauthorized.tsx`)
   - Displays when user tries to access forbidden routes

## Roles and Permissions

### Predefined Roles

The system supports four predefined roles that align with the backend:

1. **Platform Administrator**
   - Full system access
   - All routes and features available

2. **Legal Admin**
   - Full access to legal features
   - Cannot access platform administration

3. **Department Admin**
   - Department-level administration
   - Limited to department features

4. **Department User**
   - Basic user access
   - Read-only for most features

### Permission Categories

Permissions are organized by resource:

- **Documents**: create, read, update, delete
- **Contracts**: create, read, update, delete, approve, submit
- **Team**: view, manage, assign
- **Analytics**: view
- **System**: configure, monitor
- **Users**: create, read, update, delete
- **Roles**: create, read, update, delete
- **Departments**: create, read, update, delete

## Route Permissions

### Route Configuration

Routes are configured with required roles and permissions in `src/lib/permissions.ts`:

```typescript
{
  path: appRoutes.admin,
  roles: [RoleName.PLATFORM_ADMINISTRATOR],
  permissions: [Permission.SYSTEM_CONFIGURE],
}
```

### Current Route Mappings

| Route | Required Roles | Required Permissions |
|-------|---------------|---------------------|
| `/` (Home) | All roles | None |
| `/legalai` | All roles | None |
| `/review` | All roles | contracts.read |
| `/draft` | All roles | documents.create |
| `/builder` | All roles | documents.create |
| `/repository` | All roles | documents.read |
| `/intake` | Admin roles only | contracts.submit |
| `/search` | All roles | documents.read |
| `/clauses` | Admin roles | documents.read |
| `/playbooks` | Admin roles | documents.read |
| `/workflows` | Admin roles | team.view |
| `/analytics` | Admin roles | analytics.view |
| `/partners` | All roles | team.view |
| `/discovery` | All roles | documents.read |
| `/research` | All roles | documents.read |
| `/admin` | Platform Admin only | system.configure |
| `/settings` | All roles | None |
| `/help` | All roles | None |
| `/legal` | All roles | None |

## Usage

### Using Permission Checker in Components

The `PermissionChecker` instance is available through the `useAuth` hook:

```typescript
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../lib/permissions';

function MyComponent() {
  const { permissions } = useAuth();

  // Check if user has a specific permission
  if (permissions?.hasPermission(Permission.DOCUMENTS_CREATE)) {
    // Show create button
  }

  // Check if user has a specific role
  if (permissions?.isPlatformAdmin()) {
    // Show admin features
  }

  // Check if user can access a route
  if (permissions?.canAccessRoute('/admin')) {
    // Show admin link
  }
}
```

### Permission Checker Methods

#### Role Checking
- `hasRole(roleName)` - Check if user has a specific role
- `hasAnyRole(roleNames)` - Check if user has any of the specified roles
- `hasAllRoles(roleNames)` - Check if user has all specified roles
- `isPlatformAdmin()` - Convenience method for platform admin check
- `isLegalAdmin()` - Convenience method for legal admin check
- `isDepartmentAdmin()` - Convenience method for department admin check
- `isDepartmentUser()` - Convenience method for department user check

#### Permission Checking
- `hasPermission(permission)` - Check if user has a specific permission
- `hasAnyPermission(permissions)` - Check if user has any of the specified permissions
- `hasAllPermissions(permissions)` - Check if user has all specified permissions

#### Route Checking
- `canAccessRoute(routePath)` - Check if user can access a specific route

#### Utility Methods
- `getRoleNames()` - Get list of user's role names
- `getHighestRole()` - Get user's highest priority role

### Conditional Rendering Example

```typescript
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../lib/permissions';

function DocumentActions() {
  const { permissions } = useAuth();

  return (
    <div>
      {permissions?.hasPermission(Permission.DOCUMENTS_READ) && (
        <button>View Document</button>
      )}

      {permissions?.hasPermission(Permission.DOCUMENTS_UPDATE) && (
        <button>Edit Document</button>
      )}

      {permissions?.hasPermission(Permission.DOCUMENTS_DELETE) && (
        <button>Delete Document</button>
      )}

      {permissions?.hasPermission(Permission.CONTRACTS_APPROVE) && (
        <button>Approve Contract</button>
      )}
    </div>
  );
}
```

### Protecting Page Sections

```typescript
import { useAuth } from '../contexts/AuthContext';
import { RoleName } from '../lib/permissions';

function AdminPage() {
  const { permissions } = useAuth();

  if (!permissions?.hasRole(RoleName.PLATFORM_ADMINISTRATOR)) {
    return <div>You don't have access to this page.</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}
```

## Navigation Filtering

Navigation items are automatically filtered based on user permissions in `Layout.tsx`. This ensures users only see menu items they can access.

The filtering happens automatically using:
```typescript
const navItems = permissions
  ? allNavItems.filter(item => permissions.canAccessRoute(item.path))
  : allNavItems;
```

## Route Protection

Routes are protected using the `ProtectedRoute` wrapper component with the `requirePath` prop:

```typescript
<Route
  path={appRoutes.admin}
  element={
    <ProtectedRoute requirePath={appRoutes.admin}>
      <Admin />
    </ProtectedRoute>
  }
/>
```

This ensures:
1. User is authenticated
2. User has permission to access the route
3. Unauthorized users are redirected to `/unauthorized`

## Unauthorized Access

When a user tries to access a route they don't have permission for:
1. They are redirected to `/unauthorized`
2. The Unauthorized page displays:
   - Their current role(s)
   - Options to go home or go back
   - Information about contacting an administrator

## Authentication Flow with RBAC

1. **User Login**
   ```typescript
   await demoLogin();
   ```
   - User credentials are validated
   - User roles are fetched from backend
   - Roles are stored in context and localStorage
   - PermissionChecker instance is created

2. **Permission Check**
   - On every route change, ProtectedRoute checks permissions
   - Navigation items are filtered based on permissions
   - Components can check permissions for conditional rendering

3. **Logout**
   ```typescript
   await signOut();
   ```
   - User session is cleared
   - Roles are removed from context and localStorage
   - PermissionChecker instance is cleared

## Adding New Permissions

### 1. Define Permission

Add to `Permission` enum in `src/lib/permissions.ts`:
```typescript
export enum Permission {
  // ... existing permissions
  NEW_FEATURE_CREATE = 'new_feature.create',
  NEW_FEATURE_READ = 'new_feature.read',
}
```

### 2. Add Route Permission

Add to `routePermissions` array in `src/lib/permissions.ts`:
```typescript
{
  path: appRoutes.newFeature,
  roles: [RoleName.PLATFORM_ADMINISTRATOR, RoleName.LEGAL_ADMIN],
  permissions: [Permission.NEW_FEATURE_READ],
}
```

### 3. Use in Components

```typescript
if (permissions?.hasPermission(Permission.NEW_FEATURE_CREATE)) {
  // Show create UI
}
```

## Backend Integration

### Fetching User Roles

User roles are fetched via the API client:
```typescript
const response = await apiClient.userRoles.getActiveByUserId(userId);
```

The response includes:
- User role assignments
- Associated role details
- Permissions for each role

### API Client Methods

Available methods for role management:
- `apiClient.userRoles.getByUserId(userId)` - Get all roles
- `apiClient.userRoles.getActiveByUserId(userId)` - Get active roles only
- `apiClient.roles.getAll()` - Get all system roles
- `apiClient.roles.getById(id)` - Get specific role

## Security Considerations

### Frontend vs Backend

Frontend RBAC is for **UX only**. Security enforcement happens on the backend:
- Frontend hides UI elements users shouldn't access
- Backend validates permissions on every API call
- Never rely on frontend checks for security

### Best Practices

1. **Always validate on backend** - Frontend checks are for user experience
2. **Use permission checks liberally** - Check permissions for every protected action
3. **Fail closed** - If permissions are unclear, deny access
4. **Update roles on privilege change** - Call `refreshRoles()` if user roles change
5. **Handle missing permissions gracefully** - Show helpful messages

## Refreshing User Roles

If user roles change while logged in, refresh them:
```typescript
const { refreshRoles } = useAuth();

await refreshRoles();
```

This is useful when:
- Admin assigns new roles to the user
- User's roles are modified
- Permissions are updated

## Testing RBAC

### Manual Testing

1. **Login with different roles**
   - Test with each role type
   - Verify navigation items match role permissions

2. **Try accessing restricted routes**
   - Directly navigate to URLs
   - Verify redirects to unauthorized page

3. **Test permission checks**
   - Verify UI elements show/hide correctly
   - Test all permission-gated features

### Testing Checklist

- [ ] Platform Admin sees all routes
- [ ] Legal Admin sees appropriate routes
- [ ] Department Admin has limited access
- [ ] Department User has minimal access
- [ ] Unauthorized routes redirect properly
- [ ] Navigation filters correctly
- [ ] Conditional UI renders correctly
- [ ] Role changes reflect immediately

## Troubleshooting

### User has no roles

**Symptom**: All routes show as unauthorized

**Solution**:
1. Check if roles are assigned in backend
2. Verify API response from `/api/user-roles/user/:userId/active`
3. Check browser console for errors

### Permissions not updating

**Symptom**: Old permissions still apply after role change

**Solution**:
1. Call `refreshRoles()` after role assignment
2. Clear localStorage and re-login
3. Check if roles are marked as active in backend

### Navigation items not filtering

**Symptom**: All nav items show regardless of permissions

**Solution**:
1. Verify `permissions` object exists in context
2. Check if `canAccessRoute()` returns correct values
3. Ensure route paths match exactly in config

## API Reference

### Permission Enum Values

```typescript
DOCUMENTS_CREATE = 'documents.create'
DOCUMENTS_READ = 'documents.read'
DOCUMENTS_UPDATE = 'documents.update'
DOCUMENTS_DELETE = 'documents.delete'

CONTRACTS_CREATE = 'contracts.create'
CONTRACTS_READ = 'contracts.read'
CONTRACTS_UPDATE = 'contracts.update'
CONTRACTS_DELETE = 'contracts.delete'
CONTRACTS_APPROVE = 'contracts.approve'
CONTRACTS_SUBMIT = 'contracts.submit'

TEAM_VIEW = 'team.view'
TEAM_MANAGE = 'team.manage'
TEAM_ASSIGN = 'team.assign'

ANALYTICS_VIEW = 'analytics.view'

SYSTEM_CONFIGURE = 'system.configure'
SYSTEM_MONITOR = 'system.monitor'

USERS_CREATE = 'users.create'
USERS_READ = 'users.read'
USERS_UPDATE = 'users.update'
USERS_DELETE = 'users.delete'

ROLES_CREATE = 'roles.create'
ROLES_READ = 'roles.read'
ROLES_UPDATE = 'roles.update'
ROLES_DELETE = 'roles.delete'

DEPARTMENTS_CREATE = 'departments.create'
DEPARTMENTS_READ = 'departments.read'
DEPARTMENTS_UPDATE = 'departments.update'
DEPARTMENTS_DELETE = 'departments.delete'
```

### RoleName Enum Values

```typescript
PLATFORM_ADMINISTRATOR = 'Platform Administrator'
LEGAL_ADMIN = 'Legal Admin'
DEPARTMENT_ADMIN = 'Department Admin'
DEPARTMENT_USER = 'Department User'
```

## Examples

### Complete Component Example

```typescript
import { useAuth } from '../contexts/AuthContext';
import { Permission, RoleName } from '../lib/permissions';

function ContractManagement() {
  const { permissions, userRoles } = useAuth();

  const canCreate = permissions?.hasPermission(Permission.CONTRACTS_CREATE);
  const canUpdate = permissions?.hasPermission(Permission.CONTRACTS_UPDATE);
  const canDelete = permissions?.hasPermission(Permission.CONTRACTS_DELETE);
  const canApprove = permissions?.hasPermission(Permission.CONTRACTS_APPROVE);

  const isAdmin = permissions?.hasAnyRole([
    RoleName.PLATFORM_ADMINISTRATOR,
    RoleName.LEGAL_ADMIN
  ]);

  return (
    <div>
      <h1>Contract Management</h1>

      {canCreate && (
        <button>Create New Contract</button>
      )}

      <table>
        {/* Contract list */}
        <tbody>
          <tr>
            <td>Contract 1</td>
            <td>
              {canUpdate && <button>Edit</button>}
              {canDelete && <button>Delete</button>}
              {canApprove && <button>Approve</button>}
            </td>
          </tr>
        </tbody>
      </table>

      {isAdmin && (
        <div className="admin-panel">
          <h2>Admin Actions</h2>
          {/* Admin-only features */}
        </div>
      )}

      <div className="user-info">
        <p>Your Roles: {userRoles.map(r => r.role?.name).join(', ')}</p>
      </div>
    </div>
  );
}

export default ContractManagement;
```

## Conclusion

The frontend RBAC system provides a comprehensive, type-safe way to control access to features and routes based on user roles and permissions. By centralizing permission logic and integrating it with authentication, the system ensures a consistent and secure user experience across the application.

For backend RBAC documentation, see `/backend/RBAC_GUIDE.md`.
