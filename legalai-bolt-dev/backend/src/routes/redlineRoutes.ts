import { Router } from 'express';
import { redlineController } from '../controllers/redlineController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/run', (req, res) => redlineController.startRun(req, res));
router.get('/runs/:runId', (req, res) => redlineController.getRunStatus(req, res));
router.get('/runs/:runId/findings', (req, res) => redlineController.getRunFindings(req, res));
router.post('/findings/:findingId/decision', (req, res) => redlineController.recordDecision(req, res));

export default router;
