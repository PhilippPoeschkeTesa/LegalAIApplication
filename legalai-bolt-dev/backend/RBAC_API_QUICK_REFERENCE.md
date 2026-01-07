# RBAC API Quick Reference

## Roles API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | Get all roles |
| GET | `/api/roles/active` | Get active roles only |
| GET | `/api/roles/:id` | Get role by ID |
| GET | `/api/roles/name/:name` | Get role by name |
| POST | `/api/roles` | Create new role |
| PUT | `/api/roles/:id` | Update role |
| DELETE | `/api/roles/:id` | Delete role |

## User-Roles API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user-roles` | Get all user-role assignments |
| GET | `/api/user-roles/:id` | Get assignment by ID |
| GET | `/api/user-roles/user/:userId` | Get all roles for a user |
| GET | `/api/user-roles/user/:userId/active` | Get active roles for a user |
| GET | `/api/user-roles/role/:roleId` | Get all users with a role |
| POST | `/api/user-roles` | Assign role to user |
| PUT | `/api/user-roles/:id` | Update assignment |
| DELETE | `/api/user-roles/:id` | Remove assignment by ID |
| DELETE | `/api/user-roles/user/:userId/role/:roleId` | Remove specific role from user |

## Predefined Roles

1. **Platform Administrator** - Full system access
2. **Legal Admin** - Legal department administrator
3. **Department Admin** - Department-level administrator
4. **Department User** - Standard user with basic access

## Request Body Examples

### Create Role
```json
{
  "name": "Role Name",
  "description": "Role description",
  "permissions": {
    "documents": {"create": true, "read": true, "update": true, "delete": false}
  },
  "is_active": true
}
```

### Assign Role to User
```json
{
  "user_id": "uuid",
  "role_id": "uuid",
  "assigned_by": "uuid",
  "is_active": true
}
```

### Update User-Role Assignment
```json
{
  "is_active": false
}
```

## Response Format

All endpoints return responses in this format:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "count": 1
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error
