import request from 'supertest';
import app from '../app';
import { userService } from '../services/userService';

jest.mock('../services/userService');

const mockUserService = userService as jest.Mocked<typeof userService>;

describe('User API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User One',
          role: 'admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          email: 'user2@example.com',
          name: 'User Two',
          role: 'user',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockUserService.getAllUsers.mockResolvedValue(mockUsers as any);

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      mockUserService.getAllUsers.mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a specific user', async () => {
      const mockUser = {
        id: '1',
        email: 'user1@example.com',
        name: 'User One',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserService.getUserById.mockResolvedValue(mockUser as any);

      const response = await request(app).get('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
      expect(response.body.data.email).toBe('user1@example.com');
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if user not found', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      const response = await request(app).get('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });

    it('should return error if no ID provided', async () => {
      const response = await request(app).get('/api/users/');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUserData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'user',
      };

      const mockCreatedUser = {
        id: '3',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserService.createUser.mockResolvedValue(mockCreatedUser as any);

      const response = await request(app).post('/api/users').send(newUserData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('3');
      expect(response.body.data.email).toBe('newuser@example.com');
      expect(mockUserService.createUser).toHaveBeenCalledWith(newUserData);
    });

  });

  describe('PUT /api/users/:id', () => {
    it('should update an existing user', async () => {
      const updateData = {
        name: 'Updated Name',
        role: 'admin',
      };

      const mockUpdatedUser = {
        id: '1',
        email: 'user1@example.com',
        name: 'Updated Name',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserService.updateUser.mockResolvedValue(mockUpdatedUser as any);

      const response = await request(app).put('/api/users/1').send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.role).toBe('admin');
      expect(mockUserService.updateUser).toHaveBeenCalledWith('1', updateData);
    });

    it('should return 404 if user not found', async () => {
      mockUserService.updateUser.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/users/999')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 if no data provided', async () => {
      const response = await request(app).put('/api/users/1').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No update data provided');
    });

  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const mockUser = {
        id: '1',
        email: 'user1@example.com',
        name: 'User One',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserService.getUserById.mockResolvedValue(mockUser as any);
      mockUserService.deleteUser.mockResolvedValue(true);

      const response = await request(app).delete('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
    });

    it('should return 404 if user not found', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      const response = await request(app).delete('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });

    it('should return error if no ID provided', async () => {
      const response = await request(app).delete('/api/users/');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
