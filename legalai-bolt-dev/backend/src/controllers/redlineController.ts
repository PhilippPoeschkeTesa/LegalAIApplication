import { Request, Response } from 'express';
import { redlineService } from '../services/redlineService';

export const redlineController = {
  async startRun(req: Request, res: Response): Promise<void> {
    try {
      const { documentId, versionId, profileId, primaryModel, verifierModel } = req.body;

      if (!documentId || !versionId) {
        res.status(400).json({
          success: false,
          error: 'documentId and versionId are required',
        });
        return;
      }

      const run = await redlineService.startRedlineRun(documentId, versionId, {
        profileId: profileId || 'default',
        primaryModel: primaryModel || 'gpt-4',
        verifierModel: verifierModel || 'gpt-4o',
      });

      res.status(201).json({ success: true, data: run });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getRunStatus(req: Request, res: Response): Promise<void> {
    try {
      const run = await redlineService.getRunById(req.params.runId);

      if (!run) {
        res.status(404).json({ success: false, error: 'Run not found' });
        return;
      }

      res.status(200).json({ success: true, data: run });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getRunFindings(req: Request, res: Response): Promise<void> {
    try {
      const findings = await redlineService.getRunFindings(req.params.runId);

      res.status(200).json({ success: true, data: findings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async recordDecision(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const decision = await redlineService.recordUserDecision({
        finding_id: req.params.findingId,
        user_id: userId,
        action: req.body.action,
        final_text: req.body.final_text,
        comment: req.body.comment,
      });

      res.status(201).json({ success: true, data: decision });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
