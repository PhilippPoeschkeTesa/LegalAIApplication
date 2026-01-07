import { Router } from 'express';
import { roleController } from '../controllers/roleController';

const router = Router();

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: List of all roles
 *   post:
 *     summary: Create a new role
 *     tags:
 *       - Roles
 *     responses:
 *       201:
 *         description: Role created successfully
 */

router.get('/', (req, res) => roleController.getAllRoles(req, res));

router.get('/active', (req, res) => roleController.getActiveRoles(req, res));

router.get('/:id', (req, res) => roleController.getRoleById(req, res));

router.get('/name/:name', (req, res) => roleController.getRoleByName(req, res));

router.post('/', (req, res) => roleController.createRole(req, res));

router.put('/:id', (req, res) => roleController.updateRole(req, res));

router.delete('/:id', (req, res) => roleController.deleteRole(req, res));

export default router;
