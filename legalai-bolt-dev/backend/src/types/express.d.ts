import 'express';

declare global {
  namespace Express {
    export interface MulterFile {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }

    export interface Request {
      file?: MulterFile;
      files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
    }
  }
}

export {};
