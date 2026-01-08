import { Router } from 'express';
import { editorController } from '../controllers/editorController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/session', authMiddleware, (req, res) => editorController.createSession(req, res));
router.post('/callback', (req, res) => editorController.handleCallback(req, res)); // No auth - called by ONLYOFFICE

export default router;
