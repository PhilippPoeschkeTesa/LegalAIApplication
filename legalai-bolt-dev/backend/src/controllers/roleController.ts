import { Request, Response } from 'express';
import { roleService } from '../services/roleService';
import { CreateRoleDTO, UpdateRoleDTO } from '../types/RoleTypes';
import { ROLE_MESSAGES } from '../constants/messages';

export class RoleController {
  async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await roleService.getAllRoles();
      res.status(200).json({
        success: true,
        data: roles,
        count: roles.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : ROLE_MESSAGES.FETCH_ALL_ERROR,
      });
    }
  }

  async getActiveRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await roleService.getActiveRoles();
      res.status(200).json({
        success: true,
        data: roles,
        count: roles.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : ROLE_MESSAGES.FETCH_ALL_ERROR,
      });
    }
  }

  async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: ROLE_MESSAGES.ID_REQUIRED,
        });
        return;
      }

      const role = await roleService.getRoleById(id);

      if (!role) {
        res.status(404).json({
          success: false,
          error: ROLE_MESSAGES.NOT_FOUND,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : ROLE_MESSAGES.FETCH_ERROR,
      });
    }
  }

  async getRoleByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      if (!name) {
        res.status(400).json({
          success: false,
          error: ROLE_MESSAGES.NAME_REQUIRED,
        });
        return;
      }

      const role = await roleService.getRoleByName(name);

      if (!role) {
        res.status(404).json({
          success: false,
          error: ROLE_MESSAGES.NOT_FOUND,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : ROLE_MESSAGES.FETCH_ERROR,
      });
    }
  }

  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const roleData: CreateRoleDTO = req.body;

      if (!roleData.name) {
        res.status(400).json({
          success: false,
          error: ROLE_MESSAGES.NAME_REQUIRED,
        });
        return;
      }

      const newRole = await roleService.createRole(roleData);

      res.status(201).json({
        success: true,
        data: newRole,
        message: ROLE_MESSAGES.CREATED_SUCCESS,
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : ROLE_MESSAGES.CREATE_ERROR,
      });
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateRoleDTO = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: ROLE_MESSAGES.ID_REQUIRED,
        });
        return;
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          error: ROLE_MESSAGES.NO_UPDATE_DATA,
        });
        return;
      }

      const updatedRole = await roleService.updateRole(id, updates);

      if (!updatedRole) {
        res.status(404).json({
          success: false,
          error: ROLE_MESSAGES.NOT_FOUND,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedRole,
        message: ROLE_MESSAGES.UPDATED_SUCCESS,
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : ROLE_MESSAGES.UPDATE_ERROR,
      });
    }
  }

  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: ROLE_MESSAGES.ID_REQUIRED,
        });
        return;
      }

      const role = await roleService.getRoleById(id);
      if (!role) {
        res.status(404).json({
          success: false,
          error: ROLE_MESSAGES.NOT_FOUND,
        });
        return;
      }

      await roleService.deleteRole(id);

      res.status(200).json({
        success: true,
        message: ROLE_MESSAGES.DELETED_SUCCESS,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : ROLE_MESSAGES.DELETE_ERROR,
      });
    }
  }
}

export const roleController = new RoleController();
