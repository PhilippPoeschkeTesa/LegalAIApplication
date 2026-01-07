import { Router } from 'express';
import { userController } from '../controllers/userController';
import { userPermissionController } from '../controllers/userPermissionController';

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     responses:
 *       201:
 *         description: User created
 */

router.get('/', (req, res) => userController.getAllUsers(req, res));

router.get('/:id', (req, res) => userController.getUserById(req, res));

router.post('/', (req, res) => userController.createUser(req, res));

router.put('/:id', (req, res) => userController.updateUser(req, res));

router.delete('/:id',  (req, res) => userController.deleteUser(req, res));

// User permission routes
router.get('/:userId/permissions', (req, res) => userPermissionController.getUserPermissions(req, res));

router.put('/:userId/permissions', (req, res) => userPermissionController.setUserPermissions(req, res));

router.post('/:userId/permissions', (req, res) => userPermissionController.addUserPermission(req, res));

router.delete('/:userId/permissions/:permission', (req, res) => userPermissionController.removeUserPermission(req, res));

export default router;

 