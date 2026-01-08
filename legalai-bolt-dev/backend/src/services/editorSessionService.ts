import { DocumentVersion } from '../models/DocumentVersion';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

interface EditorConfig {
  documentKey: string;
  documentUrl: string;
  documentType: 'word' | 'pdf';
  editorType: 'desktop' | 'mobile' | 'embedded';
  user: {
    id: string;
    name: string;
  };
  permissions: {
    edit: boolean;
    download: boolean;
    review: boolean;
    comment: boolean;
  };
  callbackUrl: string;
  token?: string;
}

export class EditorSessionService {
  private jwtSecret: string;
  private onlyofficeUrl: string;

  constructor() {
    this.jwtSecret = process.env.ONLYOFFICE_JWT_SECRET || 'secret';
    this.onlyofficeUrl = process.env.ONLYOFFICE_URL || 'http://localhost:8080';
  }

  async createEditorSession(versionId: string, userId: string, userName: string): Promise<EditorConfig> {
    const version = await DocumentVersion.findByPk(versionId);
    if (!version) throw new Error('Version not found');

    // Generate unique document key (required by ONLYOFFICE)
    const documentKey = this.generateDocumentKey(versionId);

    // Generate JWT token for ONLYOFFICE
    const onlyofficeToken = this.generateOnlyOfficeToken({
      documentKey,
      url: version.blob_url,
    });

    const config: EditorConfig = {
      documentKey,
      documentUrl: version.blob_url,
      documentType: version.file_type === 'docx' ? 'word' : 'pdf',
      editorType: 'desktop',
      user: {
        id: userId,
        name: userName,
      },
      permissions: {
        edit: version.file_type === 'docx', // Only DOCX can be edited
        download: true,
        review: true,
        comment: true,
      },
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/editor/callback`,
      token: onlyofficeToken,
    };

    return config;
  }

  private generateDocumentKey(versionId: string): string {
    // ONLYOFFICE requires a unique key per document version
    // Key must not change during editing session
    return crypto.createHash('md5').update(versionId).digest('hex');
  }

  private generateOnlyOfficeToken(payload: any): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }

  async handleCallback(body: any): Promise<{ error: number }> {
    // ONLYOFFICE sends status updates:
    // 0 - no document with key found
    // 1 - document being edited
    // 2 - document ready for saving
    // 3 - document saving error
    // 4 - document closed with no changes
    // 6 - document being edited, but current is force saving
    // 7 - error force saving

    const { status, key, url } = body;

    console.log(`ONLYOFFICE callback: status=${status}, key=${key}, url=${url}`);

    if (status === 2 || status === 6) {
      // Document ready to save
      // TODO: Download edited document from url and save as new version
      console.log(`Saving document with key ${key} from ${url}`);
    }

    return { error: 0 }; // Success
  }
}

export const editorSessionService = new EditorSessionService();
