export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  document_type: string;
  category: string;
  jurisdictions: string[];
  languages: string[];
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export interface TemplateSection {
  id: string;
  template_id: string;
  name: string;
  description: string;
  display_order: number;
  is_required: boolean;
  section_type: string;
  placeholder_text: string;
  help_text: string;
  metadata: Record<string, unknown>;
}

export interface SectionClauseOption {
  id: string;
  section_id: string;
  clause_id: string;
  display_order: number;
  is_recommended: boolean;
  risk_level: string;
  usage_frequency: number;
  compatibility_notes: string;
  metadata: Record<string, unknown>;
  clause?: {
    id: string;
    title: string;
    content: string;
    category: string;
    jurisdiction: string;
    language: string;
    tags: string[];
    usage_count: number;
  };
}

export interface GeneratedDocument {
  id?: string;
  template_id: string;
  user_id: string;
  title: string;
  document_type: string;
  jurisdiction: string;
  language: string;
  status: string;
  content_html: string;
  content_json: Record<string, unknown>;
  selected_clauses: SelectedClause[];
  metadata: Record<string, unknown>;
  party_a?: string;
  party_b?: string;
  effective_date?: string;
  completeness_score: number;
  risk_assessment: Record<string, unknown>;
  contract_id?: string;
  version: number;
}

export interface SelectedClause {
  section_id: string;
  section_name: string;
  clause_id: string;
  clause_title: string;
  clause_content: string;
  customizations?: string;
}

export const documentBuilderService = {
  async getActiveTemplates(): Promise<DocumentTemplate[]> {
    console.warn('documentBuilderService: Backend API integration pending');
    return [];
  },

  async getTemplateById(templateId: string): Promise<DocumentTemplate | null> {
    console.warn('documentBuilderService: Backend API integration pending');
    return null;
  },

  async getTemplateSections(templateId: string): Promise<TemplateSection[]> {
    console.warn('documentBuilderService: Backend API integration pending');
    return [];
  },

  async getSectionClauseOptions(sectionId: string): Promise<SectionClauseOption[]> {
    console.warn('documentBuilderService: Backend API integration pending');
    return [];
  },

  async saveGeneratedDocument(document: GeneratedDocument): Promise<{ success: boolean; id?: string; error?: string }> {
    console.warn('documentBuilderService: Backend API integration pending');
    return { success: false, error: 'Backend API integration pending' };
  },

  async getUserDocuments(userId: string): Promise<GeneratedDocument[]> {
    console.warn('documentBuilderService: Backend API integration pending');
    return [];
  },

  async getDocumentById(documentId: string): Promise<GeneratedDocument | null> {
    console.warn('documentBuilderService: Backend API integration pending');
    return null;
  },

  async updateDocument(documentId: string, updates: Partial<GeneratedDocument>): Promise<{ success: boolean; error?: string }> {
    console.warn('documentBuilderService: Backend API integration pending');
    return { success: false, error: 'Backend API integration pending' };
  },

  async deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    console.warn('documentBuilderService: Backend API integration pending');
    return { success: false, error: 'Backend API integration pending' };
  },
};
