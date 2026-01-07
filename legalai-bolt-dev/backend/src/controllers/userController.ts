import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { CreateUserDTO, UpdateUserDTO } from '../types/UserTypes';
import { USER_MESSAGES } from '../constants/messages';

export class UserController {
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : USER_MESSAGES.FETCH_ALL_ERROR,
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: USER_MESSAGES.ID_REQUIRED,
        });
        return;
      }

      const user = await userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: USER_MESSAGES.NOT_FOUND,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : USER_MESSAGES.FETCH_ERROR,
      });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;

      const newUser = await userService.createUser(userData);

      res.status(201).json({
        success: true,
        data: newUser,
        message: USER_MESSAGES.CREATED_SUCCESS,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : USER_MESSAGES.CREATE_ERROR,
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateUserDTO = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: USER_MESSAGES.ID_REQUIRED,
        });
        return;
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          error: USER_MESSAGES.NO_UPDATE_DATA,
        });
        return;
      }


      const updatedUser = await userService.updateUser(id, updates);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: USER_MESSAGES.NOT_FOUND,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: USER_MESSAGES.UPDATED_SUCCESS,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : USER_MESSAGES.UPDATE_ERROR,
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: USER_MESSAGES.ID_REQUIRED,
        });
        return;
      }

      const user = await userService.getUserById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: USER_MESSAGES.NOT_FOUND,
        });
        return;
      }

      await userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: USER_MESSAGES.DELETED_SUCCESS,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : USER_MESSAGES.DELETE_ERROR,
      });
    }
  }
}

export const userController = new UserController();
