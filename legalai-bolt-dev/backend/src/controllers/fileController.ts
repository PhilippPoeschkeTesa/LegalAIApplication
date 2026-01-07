import { Request, Response } from 'express';
import azureStorage from '../utils/azureStorage';

export const fileController = {
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const file = req.file;
      const directory = req.body.directory || 'legal';
      const blobName = `${Date.now()}-${file.originalname}`;
      const url = await azureStorage.uploadBuffer(file.buffer, blobName, file.mimetype, directory);

      return res.status(201).json({ url });
    } catch (err: any) {
      console.error('Upload failed', err);
      return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
  },
};

export default fileController;
