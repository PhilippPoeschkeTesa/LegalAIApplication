import { Router } from 'express';
import multer from 'multer';
import { fileController } from '../controllers/fileController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @openapi
 * /api/files/upload:
 *   post:
 *     summary: Upload a file to Azure Blob Storage
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */
router.post('/upload', upload.single('file'), (req, res) => fileController.uploadFile(req, res));

export default router;
