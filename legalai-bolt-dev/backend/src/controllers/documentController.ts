import { Request, Response } from 'express';
import { documentService, BuilderState } from '../services/documentService';

export const documentController = {
  async generatePreview(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔵 Document Controller: Received preview generation request');

      const builderState: BuilderState = req.body;

      if (!builderState.document_type) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: document_type',
          message: 'Document type is required for preview generation'
        });
        return;
      }

      if (!builderState.jurisdiction) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: jurisdiction',
          message: 'Jurisdiction is required for preview generation'
        });
        return;
      }

      if (!builderState.selected_clauses || Object.keys(builderState.selected_clauses).length === 0) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: selected_clauses',
          message: 'At least one clause must be selected for preview generation'
        });
        return;
      }

      console.log('✅ Validation passed. Processing document preview...');

      const result = await documentService.generateDocumentPreview(builderState);

      console.log('✅ Document preview generated successfully');

      res.status(200).json({
        success: true,
        data: result,
        message: 'Document preview generated successfully'
      });
    } catch (error: any) {
      console.error('❌ Error in generatePreview:', error);

      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Failed to generate document preview'
      });
    }
  }
};
