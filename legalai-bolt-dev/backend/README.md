# Legal AI Backend

Backend API for the Legal AI application with comprehensive Role-Based Access Control (RBAC).

## Features

- RESTful API built with Express.js and TypeScript
- PostgreSQL database with Sequelize ORM
- Comprehensive Role-Based Access Control (RBAC) system
- User management APIs
- Role management APIs
- User-role mapping APIs
- JWT authentication ready
- Swagger API documentation
- Comprehensive error handling
- Security middleware (Helmet, CORS)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Sequelize
- **Testing**: Jest
- **Security**: Helmet, CORS

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── userController.ts
│   │   ├── roleController.ts
│   │   └── userRoleController.ts
│   ├── models/           # Database models
│   │   ├── User.ts
│   │   ├── Role.ts
│   │   └── UserRole.ts
│   ├── services/         # Business logic
│   │   ├── userService.ts
│   │   ├── roleService.ts
│   │   └── userRoleService.ts
│   ├── repository/       # Data access layer
│   │   ├── sequelize.ts
│   │   ├── userRepository.ts
│   │   ├── roleRepository.ts
│   │   └── userRoleRepository.ts
│   ├── routes/          # API routes
│   │   ├── userRoutes.ts
│   │   ├── roleRoutes.ts
│   │   └── userRoleRoutes.ts
│   ├── types/           # TypeScript type definitions
│   │   ├── UserTypes.ts
│   │   ├── RoleTypes.ts
│   │   └── UserRoleTypes.ts
│   ├── constants/       # Application constants
│   │   └── messages.ts
│   ├── middlewares/     # Express middlewares
│   │   └── errorHandler.ts
│   ├── config/          # Configuration files
│   │   ├── database.ts
│   │   └── swagger.ts
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── migrations/          # Database migrations
│   ├── 001_create_users_table.sql
│   └── 002_create_roles_and_user_roles.sql
├── __tests__/          # Test files
├── RBAC_GUIDE.md       # Comprehensive RBAC documentation
├── RBAC_API_QUICK_REFERENCE.md  # Quick API reference
└── package.json
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update database connection details

3. Run database migrations:
   - Execute `migrations/001_create_users_table.sql`
   - Execute `migrations/002_create_roles_and_user_roles.sql`

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Running Tests
```bash
npm test
```

## API Endpoints

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Role Management
- `GET /api/roles` - Get all roles
- `GET /api/roles/active` - Get active roles
- `GET /api/roles/:id` - Get role by ID
- `GET /api/roles/name/:name` - Get role by name
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### User-Role Management
- `GET /api/user-roles` - Get all user-role assignments
- `GET /api/user-roles/:id` - Get assignment by ID
- `GET /api/user-roles/user/:userId` - Get roles for user
- `GET /api/user-roles/user/:userId/active` - Get active roles for user
- `GET /api/user-roles/role/:roleId` - Get users with role
- `POST /api/user-roles` - Assign role to user
- `PUT /api/user-roles/:id` - Update assignment
- `DELETE /api/user-roles/:id` - Remove assignment

## RBAC System

The application includes a comprehensive Role-Based Access Control system with four predefined roles:

1. **Platform Administrator** - Full system access
2. **Legal Admin** - Legal department administrator
3. **Department Admin** - Department-level administrator
4. **Department User** - Standard user

For detailed information about the RBAC system, see:
- [RBAC_GUIDE.md](./RBAC_GUIDE.md) - Comprehensive guide
- [RBAC_API_QUICK_REFERENCE.md](./RBAC_API_QUICK_REFERENCE.md) - Quick API reference

## Environment Variables

Required environment variables:

```env
PORT=5000
DATABASE_URL=your_database_url
NODE_ENV=development
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation
- Error handling middleware
- Password hashing (bcrypt ready)
- JWT authentication ready

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts
- `roles` - Role definitions with permissions
- `user_roles` - Many-to-many mapping between users and roles

All tables include Row Level Security (RLS) policies for data protection.

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

MIT
