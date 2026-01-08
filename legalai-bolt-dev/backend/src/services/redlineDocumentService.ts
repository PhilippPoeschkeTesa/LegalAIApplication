import { Document, DocumentCreationAttributes } from '../models/Document';
import { DocumentVersion, DocumentVersionCreationAttributes } from '../models/DocumentVersion';
import azureStorage from '../utils/azureStorage';
import { Op } from 'sequelize';

export class RedlineDocumentService {
  async createDocument(data: DocumentCreationAttributes): Promise<Document> {
    const document = await Document.create(data);
    return document;
  }

  async getDocumentById(id: string, userId: string): Promise<Document | null> {
    // TODO: Add permission check based on user role and confidentiality_level
    return await Document.findByPk(id);
  }

  async getUserDocuments(
    userId: string,
    filters?: {
      search?: string;
      tags?: string[];
      confidentiality?: string[];
    }
  ): Promise<Document[]> {
    const where: any = { owner_id: userId };

    if (filters?.search) {
      where.title = { [Op.iLike]: `%${filters.search}%` };
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { [Op.overlap]: filters.tags };
    }

    if (filters?.confidentiality && filters.confidentiality.length > 0) {
      where.confidentiality_level = { [Op.in]: filters.confidentiality };
    }

    return await Document.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  }

  async uploadDocumentVersion(
    documentId: string,
    file: Express.Multer.File,
    userId: string,
    changeSummary?: string
  ): Promise<DocumentVersion> {
    // Mark all previous versions as not current
    await DocumentVersion.update({ is_current: false }, { where: { document_id: documentId } });

    // Get next version number
    const lastVersion = await DocumentVersion.findOne({
      where: { document_id: documentId },
      order: [['version_number', 'DESC']],
    });

    const versionNumber = (lastVersion?.version_number || 0) + 1;

    // Upload to Azure Blob Storage
    const blobName = `documents/${documentId}/v${versionNumber}-${Date.now()}-${file.originalname}`;
    const blobUrl = await azureStorage.uploadBuffer(file.buffer, blobName, file.mimetype, 'documents');

    // Create version record
    const version = await DocumentVersion.create({
      document_id: documentId,
      version_number: versionNumber,
      file_type: file.originalname.endsWith('.pdf') ? 'pdf' : 'docx',
      blob_url: blobUrl,
      file_size: file.size,
      created_by: userId,
      is_current: true,
      change_summary: changeSummary,
    });

    // Update document's updated_at
    await Document.update({ updated_at: new Date() }, { where: { id: documentId } });

    return version;
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    return await DocumentVersion.findAll({
      where: { document_id: documentId },
      order: [['version_number', 'DESC']],
    });
  }

  async getCurrentVersion(documentId: string): Promise<DocumentVersion | null> {
    return await DocumentVersion.findOne({
      where: { document_id: documentId, is_current: true },
    });
  }
}

export const redlineDocumentService = new RedlineDocumentService();
