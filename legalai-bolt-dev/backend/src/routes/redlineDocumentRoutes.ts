import { Router } from 'express';
import { redlineDocumentController } from '../controllers/redlineDocumentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(authMiddleware);

router.post('/upload', upload.single('file'), (req, res) => redlineDocumentController.uploadDocument(req, res));
router.get('/', (req, res) => redlineDocumentController.getDocuments(req, res));
router.get('/:id', (req, res) => redlineDocumentController.getDocumentById(req, res));
router.get('/:id/versions', (req, res) => redlineDocumentController.getDocumentVersions(req, res));

export default router;
