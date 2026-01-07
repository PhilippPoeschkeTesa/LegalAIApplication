# API Integration Guide

This document provides an overview of the frontend-to-backend API integration setup after removing Supabase.

## Overview

The frontend has been updated to connect to the backend APIs instead of using Supabase directly. All Supabase dependencies have been removed and replaced with a custom API client layer.

## Changes Made

### 1. Removed Supabase Integration
- Removed `@supabase/supabase-js` dependency from package.json
- Deleted `src/lib/supabase.ts` file
- Removed all Supabase imports from components and pages
- Deleted `supabase/` migrations folder

### 2. Created API Client Layer

#### API Types (`src/types/api.ts`)
Comprehensive TypeScript types for backend API requests and responses:
- `User` - User entity
- `Role` - Role entity
- `UserRole` - User-Role mapping
- `ApiResponse<T>` - Generic API response wrapper
- Request/Update types for all entities

#### API Configuration (`src/lib/apiConfig.ts`)
- Configures base URL from environment variable `VITE_API_BASE_URL`
- Provides helper functions for building URLs and auth headers
- Default timeout of 30 seconds

#### API Client (`src/lib/apiClient.ts`)
A comprehensive API client with methods for:

**User APIs:**
- `users.getAll()` - Get all users
- `users.getById(id)` - Get user by ID
- `users.create(data)` - Create new user
- `users.update(id, data)` - Update user
- `users.delete(id)` - Delete user

**Role APIs:**
- `roles.getAll()` - Get all roles
- `roles.getActive()` - Get active roles
- `roles.getById(id)` - Get role by ID
- `roles.getByName(name)` - Get role by name
- `roles.create(data)` - Create new role
- `roles.update(id, data)` - Update role
- `roles.delete(id)` - Delete role

**User-Role APIs:**
- `userRoles.getAll()` - Get all user-role assignments
- `userRoles.getById(id)` - Get assignment by ID
- `userRoles.getByUserId(userId)` - Get roles for user
- `userRoles.getActiveByUserId(userId)` - Get active roles for user
- `userRoles.getByRoleId(roleId)` - Get users with role
- `userRoles.assign(data)` - Assign role to user
- `userRoles.update(id, data)` - Update assignment
- `userRoles.remove(id)` - Remove assignment
- `userRoles.removeByUserAndRole(userId, roleId)` - Remove by user and role IDs

### 3. Updated Service Files

All service files have been updated to remove Supabase dependencies while preserving their interfaces:

- `workflowService.ts` - Workflow and compliance management
- `securityService.ts` - Security and access control
- `documentBuilderService.ts` - Document template management
- `feedbackService.ts` - AI feedback and logging
- `legalKnowledgeService.ts` - Legal knowledge base
- `contextEngine.ts` - AI context management

These services currently return stub data or console warnings indicating that backend integration is pending.

### 4. Updated AuthContext

The authentication context has been simplified:
- Removed Supabase auth integration
- Kept demo login functionality
- Placeholder methods for `signIn`, `signUp` (throw errors until backend integration)
- Uses localStorage for demo user sessions

### 5. Environment Configuration

Updated `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000
```

## Usage Examples

### Using the API Client

```typescript
import { apiClient } from './lib/apiClient';

// Get all users
const response = await apiClient.users.getAll();
if (response.success) {
  console.log('Users:', response.data);
} else {
  console.error('Error:', response.error);
}

// Create a new user
const newUser = await apiClient.users.create({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  is_active: true,
});

// Set auth token (when implementing authentication)
apiClient.setToken('your-jwt-token');

// Get roles for a specific user
const userRoles = await apiClient.userRoles.getByUserId('user-id');
```

### API Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Next Steps

To fully integrate with the backend:

1. **Implement Authentication**
   - Add backend login/signup endpoints
   - Update `AuthContext` to use backend APIs
   - Handle JWT tokens and session management

2. **Connect Service Files**
   - Replace stub implementations in service files
   - Map service methods to corresponding backend APIs
   - Add error handling and loading states

3. **Add Backend Endpoints**
   - Implement any missing backend APIs for workflow, security, documents, etc.
   - Ensure consistent request/response formats
   - Add proper authentication middleware

4. **UI Integration**
   - Update pages and components to use the API client
   - Add loading states and error handling
   - Implement proper data refresh and caching

## Backend API Requirements

The backend should provide the following endpoints:

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Roles
- `GET /api/roles` - List all roles
- `GET /api/roles/active` - List active roles
- `GET /api/roles/:id` - Get role by ID
- `GET /api/roles/name/:name` - Get role by name
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### User-Roles
- `GET /api/user-roles` - List all assignments
- `GET /api/user-roles/:id` - Get assignment by ID
- `GET /api/user-roles/user/:userId` - Get roles for user
- `GET /api/user-roles/user/:userId/active` - Get active roles for user
- `GET /api/user-roles/role/:roleId` - Get users with role
- `POST /api/user-roles` - Assign role
- `PUT /api/user-roles/:id` - Update assignment
- `DELETE /api/user-roles/:id` - Remove assignment
- `DELETE /api/user-roles/user/:userId/role/:roleId` - Remove by IDs

## Configuration

The API base URL is configured via the `VITE_API_BASE_URL` environment variable. Update `.env` to point to your backend:

```env
VITE_API_BASE_URL=http://localhost:5000
# or for production
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Error Handling

The API client includes automatic error handling:
- Network errors return `{ success: false, error: 'Network error' }`
- API errors return `{ success: false, error: 'Error message from API' }`
- 30-second timeout for all requests

## Testing

After connecting to the backend, test the integration:

1. Start the backend server
2. Update `VITE_API_BASE_URL` in `.env`
3. Start the frontend: `npm run dev`
4. Test each API endpoint through the UI
5. Verify error handling and loading states

## Notes

- All service files currently log warnings when methods are called, indicating pending integration
- Demo login still works for testing UI without backend
- The `apiClient` instance is a singleton and can be imported anywhere in the app
- Auth token management is built into the client but not yet connected to authentication flow
