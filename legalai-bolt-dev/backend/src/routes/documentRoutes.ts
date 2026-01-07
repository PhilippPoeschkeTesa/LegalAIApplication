import { Router } from 'express';
import { documentController } from '../controllers/documentController';

const router = Router();

router.post('/generate-preview', documentController.generatePreview);

export default router;
