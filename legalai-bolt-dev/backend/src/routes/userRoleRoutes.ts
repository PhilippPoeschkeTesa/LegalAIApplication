import { Router } from 'express';
import { userRoleController } from '../controllers/userRoleController';

const router = Router();

/**
 * @openapi
 * /api/user-roles:
 *   get:
 *     summary: Get all user-role assignments
 *     tags:
 *       - User Roles
 *     responses:
 *       200:
 *         description: List of all user-role assignments
 *   post:
 *     summary: Assign a role to a user
 *     tags:
 *       - User Roles
 *     responses:
 *       201:
 *         description: Role assigned successfully
 */

router.get('/', (req, res) => userRoleController.getAllUserRoles(req, res));

router.get('/:id', (req, res) => userRoleController.getUserRoleById(req, res));

router.get('/user/:userId', (req, res) => userRoleController.getRolesByUserId(req, res));

router.get('/user/:userId/active', (req, res) => userRoleController.getActiveRolesByUserId(req, res));

router.get('/role/:roleId', (req, res) => userRoleController.getUsersByRoleId(req, res));

router.post('/', (req, res) => userRoleController.assignRoleToUser(req, res));

router.put('/:id', (req, res) => userRoleController.updateUserRole(req, res));

router.delete('/:id', (req, res) => userRoleController.removeRoleFromUser(req, res));

router.delete('/user/:userId/role/:roleId', (req, res) => userRoleController.removeRoleFromUserByIds(req, res));

export default router;
