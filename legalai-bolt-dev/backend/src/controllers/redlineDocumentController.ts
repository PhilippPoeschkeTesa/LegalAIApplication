import { Request, Response } from 'express';
import { redlineDocumentService } from '../services/redlineDocumentService';

export const redlineDocumentController = {
  async createDocument(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const document = await redlineDocumentService.createDocument({
        ...req.body,
        owner_id: userId,
      });

      res.status(201).json({ success: true, data: document });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }

      // Create document
      const document = await redlineDocumentService.createDocument({
        title: req.body.title || req.file.originalname,
        owner_id: userId,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        confidentiality_level: req.body.confidentiality_level || 'internal',
      });

      // Upload first version
      const version = await redlineDocumentService.uploadDocumentVersion(
        document.id,
        req.file,
        userId,
        'Initial version'
      );

      res.status(201).json({
        success: true,
        data: { document, version },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getDocuments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const filters = {
        search: req.query.search as string | undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        confidentiality: req.query.confidentiality
          ? (req.query.confidentiality as string).split(',')
          : undefined,
      };

      const documents = await redlineDocumentService.getUserDocuments(userId, filters);

      res.status(200).json({ success: true, data: documents });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getDocumentById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const document = await redlineDocumentService.getDocumentById(req.params.id, userId);

      if (!document) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
      }

      res.status(200).json({ success: true, data: document });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getDocumentVersions(req: Request, res: Response): Promise<void> {
    try {
      const versions = await redlineDocumentService.getDocumentVersions(req.params.id);

      res.status(200).json({ success: true, data: versions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
