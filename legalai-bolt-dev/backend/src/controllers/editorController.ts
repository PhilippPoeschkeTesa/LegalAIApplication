import { Request, Response } from 'express';
import { editorSessionService } from '../services/editorSessionService';

export const editorController = {
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const userName = req.user?.email || 'User';

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { versionId } = req.body;

      if (!versionId) {
        res.status(400).json({ success: false, error: 'versionId is required' });
        return;
      }

      const config = await editorSessionService.createEditorSession(versionId, userId, userName);

      res.status(200).json({ success: true, data: config });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const result = await editorSessionService.handleCallback(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: 1 });
    }
  },
};
