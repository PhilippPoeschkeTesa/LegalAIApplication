# Role-Based Access Control (RBAC) Guide

## Overview

This document describes the Role-Based Access Control (RBAC) system implemented for the Legal AI application. The RBAC system provides fine-grained access control based on user roles and their associated permissions.

## Architecture

### Database Schema

The RBAC system consists of three main tables:

1. **users** - Stores user information
2. **roles** - Stores role definitions and permissions
3. **user_roles** - Maps users to their assigned roles (many-to-many relationship)

### Predefined Roles

The system comes with four predefined roles:

1. **Platform Administrator**
   - Full system access
   - Can manage all users, roles, and system settings
   - Has all permissions across the application

2. **Legal Admin**
   - Legal department administrator
   - Full access to legal documents and contracts
   - Can manage team members within legal department
   - Access to analytics and reporting

3. **Department Admin**
   - Department-level administrator
   - Can create, read, and update department documents
   - Can submit contracts for approval
   - Can view and assign team members
   - Access to department analytics

4. **Department User**
   - Standard user with basic access
   - Can create and read documents
   - Can create and read contracts (cannot update or delete)
   - Limited analytics access

## API Endpoints

### Role Management APIs

#### 1. Get All Roles
```
GET /api/roles
```
Returns all roles in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Legal Admin",
      "description": "Legal department administrator",
      "permissions": {...},
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 4
}
```

#### 2. Get Active Roles
```
GET /api/roles/active
```
Returns only active roles.

#### 3. Get Role by ID
```
GET /api/roles/:id
```
Returns a specific role by its ID.

#### 4. Get Role by Name
```
GET /api/roles/name/:name
```
Returns a specific role by its name.

#### 5. Create Role
```
POST /api/roles
```
Creates a new role.

**Request Body:**
```json
{
  "name": "Custom Role",
  "description": "Description of the role",
  "permissions": {
    "documents": {
      "create": true,
      "read": true,
      "update": false,
      "delete": false
    }
  },
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Role created successfully"
}
```

#### 6. Update Role
```
PUT /api/roles/:id
```
Updates an existing role.

**Request Body:**
```json
{
  "name": "Updated Role Name",
  "description": "Updated description",
  "permissions": {...},
  "is_active": true
}
```

#### 7. Delete Role
```
DELETE /api/roles/:id
```
Deletes a role. Note: This will cascade delete all user-role mappings.

### User-Role Mapping APIs

#### 1. Get All User-Role Assignments
```
GET /api/user-roles
```
Returns all user-role assignments with user and role details.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "role_id": "uuid",
      "assigned_at": "2024-01-01T00:00:00Z",
      "assigned_by": "uuid",
      "is_active": true,
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "role": {
        "id": "uuid",
        "name": "Legal Admin",
        "description": "...",
        "permissions": {...}
      }
    }
  ],
  "count": 10
}
```

#### 2. Get User-Role Assignment by ID
```
GET /api/user-roles/:id
```
Returns a specific user-role assignment.

#### 3. Get Roles by User ID
```
GET /api/user-roles/user/:userId
```
Returns all roles assigned to a specific user.

#### 4. Get Active Roles by User ID
```
GET /api/user-roles/user/:userId/active
```
Returns only active roles assigned to a specific user.

#### 5. Get Users by Role ID
```
GET /api/user-roles/role/:roleId
```
Returns all users assigned to a specific role.

#### 6. Assign Role to User
```
POST /api/user-roles
```
Assigns a role to a user.

**Request Body:**
```json
{
  "user_id": "uuid",
  "role_id": "uuid",
  "assigned_by": "uuid",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Role assigned to user successfully"
}
```

#### 7. Update User-Role Assignment
```
PUT /api/user-roles/:id
```
Updates a user-role assignment (e.g., activate/deactivate).

**Request Body:**
```json
{
  "is_active": false
}
```

#### 8. Remove Role from User by Assignment ID
```
DELETE /api/user-roles/:id
```
Removes a role assignment by its ID.

#### 9. Remove Role from User by User and Role IDs
```
DELETE /api/user-roles/user/:userId/role/:roleId
```
Removes a specific role from a user using both IDs.

## Permissions Structure

Permissions are stored as JSON objects with nested properties:

```json
{
  "documents": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true
  },
  "contracts": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true,
    "approve": true,
    "submit": true
  },
  "team": {
    "view": true,
    "manage": true,
    "assign": true
  },
  "analytics": {
    "view": true
  },
  "system": {
    "configure": true,
    "monitor": true
  },
  "users": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true
  },
  "roles": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true
  },
  "departments": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true
  }
}
```

## Implementation Details

### Key Features

1. **Many-to-Many Relationship**: Users can have multiple roles, and roles can be assigned to multiple users.

2. **Active/Inactive Roles**: Both roles and user-role assignments can be activated/deactivated without deletion.

3. **Audit Trail**: The system tracks who assigned roles and when they were assigned.

4. **Cascading Deletes**: Deleting a user or role will automatically remove associated mappings.

5. **Unique Constraints**: A user cannot be assigned the same role multiple times.

6. **Flexible Permissions**: Permissions are stored as JSON, allowing for complex permission structures.

### Database Indexes

The following indexes are created for optimal performance:
- `idx_user_roles_user_id` on user_roles(user_id)
- `idx_user_roles_role_id` on user_roles(role_id)
- `idx_user_roles_is_active` on user_roles(is_active)

### Security Considerations

1. **Row Level Security (RLS)**: Enabled on all tables with appropriate policies.
2. **Foreign Key Constraints**: Ensure data integrity across tables.
3. **Input Validation**: All endpoints validate required fields and data types.
4. **Error Handling**: Comprehensive error messages without exposing sensitive information.

## Usage Examples

### Example 1: Assigning a Role to a New User

```javascript
// 1. Create a user
POST /api/users
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "user"
}

// Response: { "success": true, "data": { "id": "user-uuid", ... } }

// 2. Get the Legal Admin role
GET /api/roles/name/Legal Admin

// Response: { "success": true, "data": { "id": "role-uuid", ... } }

// 3. Assign the role to the user
POST /api/user-roles
{
  "user_id": "user-uuid",
  "role_id": "role-uuid",
  "assigned_by": "admin-uuid"
}
```

### Example 2: Checking User Permissions

```javascript
// Get all active roles for a user
GET /api/user-roles/user/:userId/active

// Response contains all roles with their permissions
// You can then check if user has specific permissions
const userRoles = response.data;
const canCreateDocuments = userRoles.some(ur =>
  ur.role.permissions.documents?.create === true
);
```

### Example 3: Creating a Custom Role

```javascript
POST /api/roles
{
  "name": "Contract Manager",
  "description": "Specialized role for contract management",
  "permissions": {
    "contracts": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false,
      "submit": true
    },
    "documents": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false
    }
  },
  "is_active": true
}
```

## Migration Instructions

To apply the RBAC database schema:

1. Ensure your database connection is properly configured in `.env`
2. Run the migration:
   ```bash
   # Apply the migration using your migration tool
   # The migration file is located at: migrations/002_create_roles_and_user_roles.sql
   ```

3. The migration will:
   - Create the `roles` table
   - Create the `user_roles` table
   - Set up foreign key relationships
   - Create necessary indexes
   - Insert the four predefined roles
   - Enable Row Level Security

## Future Enhancements

Potential improvements to the RBAC system:

1. **Permission Inheritance**: Allow roles to inherit permissions from parent roles
2. **Time-based Access**: Add expiration dates for role assignments
3. **Context-based Permissions**: Add permissions based on resource ownership or department
4. **Permission Groups**: Group related permissions for easier management
5. **Audit Logging**: Track all permission changes and access attempts
6. **API Middleware**: Create middleware to automatically check permissions on routes
7. **Permission UI**: Build admin interface for managing roles and permissions

## Troubleshooting

### Common Issues

1. **"Role with this name already exists"**
   - Solution: Use a unique name or update the existing role

2. **"User already has this role assigned"**
   - Solution: Check existing assignments first or update the existing assignment

3. **"User not found" or "Role not found"**
   - Solution: Verify that the user/role exists before creating assignments

4. **Foreign key constraint violations**
   - Solution: Ensure referenced users and roles exist before creating mappings

## Testing

To test the RBAC system:

1. Create test users with different roles
2. Verify that permissions are correctly returned
3. Test role assignment and removal
4. Test activation/deactivation of roles and assignments
5. Verify cascading deletes work correctly
6. Test edge cases (duplicate assignments, non-existent users/roles)

## Conclusion

This RBAC system provides a robust foundation for managing user permissions in the Legal AI application. It's flexible enough to accommodate new roles and permissions as the application grows, while maintaining data integrity and security.
