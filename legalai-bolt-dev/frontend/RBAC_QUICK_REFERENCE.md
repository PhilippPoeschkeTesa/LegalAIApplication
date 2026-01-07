# Frontend RBAC Quick Reference

## Permission Checker Usage

### Import
```typescript
import { useAuth } from '../contexts/AuthContext';
import { Permission, RoleName } from '../lib/permissions';

const { permissions } = useAuth();
```

## Common Checks

### Check Single Permission
```typescript
permissions?.hasPermission(Permission.DOCUMENTS_CREATE)
```

### Check Multiple Permissions (OR)
```typescript
permissions?.hasAnyPermission([
  Permission.DOCUMENTS_CREATE,
  Permission.DOCUMENTS_UPDATE
])
```

### Check Multiple Permissions (AND)
```typescript
permissions?.hasAllPermissions([
  Permission.DOCUMENTS_READ,
  Permission.CONTRACTS_READ
])
```

### Check Role
```typescript
permissions?.hasRole(RoleName.PLATFORM_ADMINISTRATOR)
```

### Check Multiple Roles (OR)
```typescript
permissions?.hasAnyRole([
  RoleName.PLATFORM_ADMINISTRATOR,
  RoleName.LEGAL_ADMIN
])
```

### Check Route Access
```typescript
permissions?.canAccessRoute('/admin')
```

## Role Shortcuts

```typescript
permissions?.isPlatformAdmin()  // Platform Administrator
permissions?.isLegalAdmin()     // Legal Admin
permissions?.isDepartmentAdmin() // Department Admin
permissions?.isDepartmentUser()  // Department User
```

## Permission Categories

### Documents
```typescript
Permission.DOCUMENTS_CREATE
Permission.DOCUMENTS_READ
Permission.DOCUMENTS_UPDATE
Permission.DOCUMENTS_DELETE
```

### Contracts
```typescript
Permission.CONTRACTS_CREATE
Permission.CONTRACTS_READ
Permission.CONTRACTS_UPDATE
Permission.CONTRACTS_DELETE
Permission.CONTRACTS_APPROVE
Permission.CONTRACTS_SUBMIT
```

### Team
```typescript
Permission.TEAM_VIEW
Permission.TEAM_MANAGE
Permission.TEAM_ASSIGN
```

### Analytics
```typescript
Permission.ANALYTICS_VIEW
```

### System
```typescript
Permission.SYSTEM_CONFIGURE
Permission.SYSTEM_MONITOR
```

### Users
```typescript
Permission.USERS_CREATE
Permission.USERS_READ
Permission.USERS_UPDATE
Permission.USERS_DELETE
```

### Roles
```typescript
Permission.ROLES_CREATE
Permission.ROLES_READ
Permission.ROLES_UPDATE
Permission.ROLES_DELETE
```

### Departments
```typescript
Permission.DEPARTMENTS_CREATE
Permission.DEPARTMENTS_READ
Permission.DEPARTMENTS_UPDATE
Permission.DEPARTMENTS_DELETE
```

## Conditional Rendering Patterns

### Simple Permission Check
```typescript
{permissions?.hasPermission(Permission.DOCUMENTS_CREATE) && (
  <button>Create Document</button>
)}
```

### Multiple Permission Check
```typescript
{permissions?.hasAnyPermission([
  Permission.DOCUMENTS_UPDATE,
  Permission.DOCUMENTS_DELETE
]) && (
  <div className="actions">
    {/* Edit/Delete buttons */}
  </div>
)}
```

### Role-Based Rendering
```typescript
{permissions?.isPlatformAdmin() && (
  <AdminPanel />
)}
```

### Complex Logic
```typescript
const canEdit = permissions?.hasPermission(Permission.DOCUMENTS_UPDATE);
const canDelete = permissions?.hasPermission(Permission.DOCUMENTS_DELETE);
const isAdmin = permissions?.hasAnyRole([
  RoleName.PLATFORM_ADMINISTRATOR,
  RoleName.LEGAL_ADMIN
]);

return (
  <div>
    {canEdit && <EditButton />}
    {canDelete && isAdmin && <DeleteButton />}
  </div>
);
```

## Auth Context Methods

### Get User Roles
```typescript
const { userRoles } = useAuth();
```

### Refresh Roles
```typescript
const { refreshRoles } = useAuth();
await refreshRoles();
```

### Get User Info
```typescript
const { user } = useAuth();
console.log(user.email, user.id);
```

## Route Protection

### Protect a Route
```typescript
<Route
  path="/admin"
  element={
    <ProtectedRoute requirePath="/admin">
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

## Navigation Filtering

Navigation items are automatically filtered in Layout.tsx:
```typescript
const navItems = permissions
  ? allNavItems.filter(item => permissions.canAccessRoute(item.path))
  : allNavItems;
```

## Adding New Route Permissions

1. **Add to routePermissions in permissions.ts:**
```typescript
{
  path: appRoutes.newFeature,
  roles: [RoleName.PLATFORM_ADMINISTRATOR],
  permissions: [Permission.NEW_FEATURE_READ],
}
```

2. **Protect the route in App.tsx:**
```typescript
<Route
  path={appRoutes.newFeature}
  element={
    <ProtectedRoute requirePath={appRoutes.newFeature}>
      <NewFeature />
    </ProtectedRoute>
  }
/>
```

## Role Hierarchy

From highest to lowest access:
1. Platform Administrator (full access)
2. Legal Admin (legal features + team management)
3. Department Admin (department features)
4. Department User (basic read/create)

## Common Patterns

### Admin-Only Section
```typescript
function AdminSection() {
  const { permissions } = useAuth();

  if (!permissions?.isPlatformAdmin()) {
    return null; // or <AccessDenied />
  }

  return <div>{/* Admin content */}</div>;
}
```

### Action Buttons Based on Permissions
```typescript
function DocumentActions({ document }) {
  const { permissions } = useAuth();

  return (
    <div className="actions">
      {permissions?.hasPermission(Permission.DOCUMENTS_READ) && (
        <button onClick={() => view(document)}>View</button>
      )}

      {permissions?.hasPermission(Permission.DOCUMENTS_UPDATE) && (
        <button onClick={() => edit(document)}>Edit</button>
      )}

      {permissions?.hasPermission(Permission.DOCUMENTS_DELETE) && (
        <button onClick={() => deleteDoc(document)}>Delete</button>
      )}
    </div>
  );
}
```

### Role Badge Display
```typescript
function UserBadge() {
  const { permissions } = useAuth();
  const role = permissions?.getHighestRole();

  const getBadgeColor = () => {
    switch (role) {
      case RoleName.PLATFORM_ADMINISTRATOR:
        return 'bg-purple-100 text-purple-800';
      case RoleName.LEGAL_ADMIN:
        return 'bg-blue-100 text-blue-800';
      case RoleName.DEPARTMENT_ADMIN:
        return 'bg-green-100 text-green-800';
      case RoleName.DEPARTMENT_USER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${getBadgeColor()}`}>
      {role}
    </span>
  );
}
```

### Disable Button Based on Permissions
```typescript
function CreateButton() {
  const { permissions } = useAuth();
  const canCreate = permissions?.hasPermission(Permission.DOCUMENTS_CREATE);

  return (
    <button
      disabled={!canCreate}
      className={!canCreate ? 'opacity-50 cursor-not-allowed' : ''}
      title={!canCreate ? 'You do not have permission to create documents' : ''}
    >
      Create Document
    </button>
  );
}
```

## Testing Checklist

- [ ] Login as Platform Admin → See all routes
- [ ] Login as Legal Admin → See legal features
- [ ] Login as Department Admin → See department features
- [ ] Login as Department User → See basic features
- [ ] Try accessing /admin without permission → Redirect to unauthorized
- [ ] Navigation shows only accessible routes
- [ ] UI elements hide/show based on permissions
- [ ] Direct URL access to unauthorized routes blocked

## Troubleshooting

### Problem: Permissions not loading
**Solution:** Check if roles are assigned in backend, verify API response

### Problem: All routes unauthorized
**Solution:** Check if user has active roles, call `refreshRoles()`

### Problem: Navigation not filtering
**Solution:** Ensure `permissions` object exists in Layout.tsx

### Problem: Stale permissions after role change
**Solution:** Call `await refreshRoles()` or re-login

## API Client Usage

### Fetch User Roles
```typescript
import { apiClient } from '../lib/apiClient';

const response = await apiClient.userRoles.getActiveByUserId(userId);
```

### Get All Roles
```typescript
const response = await apiClient.roles.getAll();
```

### Assign Role to User
```typescript
const response = await apiClient.userRoles.assign({
  user_id: userId,
  role_id: roleId,
  assigned_by: adminId,
  is_active: true
});
```

## Key Files

- `src/lib/permissions.ts` - Permission definitions and checker logic
- `src/contexts/AuthContext.tsx` - Auth state and role management
- `src/App.tsx` - Route protection with ProtectedRoute
- `src/components/Layout.tsx` - Navigation filtering
- `src/pages/Unauthorized.tsx` - Access denied page

## Remember

Frontend RBAC is for UX only. Always validate permissions on the backend for security.
