export interface LegalSource {
  id?: string;
  jurisdiction: string;
  source_type: 'law' | 'regulation' | 'case_law' | 'directive' | 'guideline' | 'commentary';
  title: string;
  reference_number: string;
  content: string;
  summary?: string;
  valid_from: string;
  valid_until?: string;
  parent_version_id?: string;
  source_url?: string;
  metadata?: {
    authority?: string;
    keywords?: string[];
    related_concepts?: string[];
    language?: string;
    [key: string]: any;
  };
}

export interface LegalUpdate {
  id?: string;
  source_id: string;
  change_type: 'new' | 'amended' | 'repealed' | 'clarified';
  change_summary: string;
  detected_at?: string;
  validated_by?: string;
  status: 'pending' | 'validated' | 'rejected' | 'archived';
  notification_sent: boolean;
}

export interface LegalTaxonomy {
  id?: string;
  concept_name: string;
  parent_id?: string;
  jurisdictions: string[];
  translations: {
    [language: string]: string;
  };
  related_sources: string[];
}

export interface ClauseSuggestion {
  id?: string;
  clause_text: string;
  clause_type: string;
  jurisdiction: string;
  industry?: string;
  risk_level: 'high' | 'medium' | 'low';
  alternatives: Array<{
    text: string;
    risk_level: string;
    notes: string;
  }>;
  negotiation_notes?: string;
  usage_count: number;
  success_rate: number;
}

class LegalKnowledgeService {
  async searchLegalSources(query: {
    jurisdiction?: string;
    source_type?: string;
    keywords?: string;
    valid_as_of?: string;
  }): Promise<LegalSource[]> {
    console.warn('LegalKnowledgeService: Backend API integration pending');
    return [];
  }

  async getLegalSourceById(id: string): Promise<LegalSource | null> {
    console.warn('LegalKnowledgeService: Backend API integration pending');
    return null;
  }

  async getLegalUpdates(jurisdiction?: string, status?: string): Promise<LegalUpdate[]> {
    console.warn('LegalKnowledgeService: Backend API integration pending');
    return [];
  }

  async getRecentLegalUpdates(jurisdiction?: string, limit: number = 20): Promise<LegalUpdate[]> {
    console.warn('LegalKnowledgeService: Backend API integration pending');
    return [];
  }

  async getClauseSuggestions(context: {
    clause_type: string;
    jurisdiction: string;
    industry?: string;
  }): Promise<ClauseSuggestion[]> {
    console.warn('LegalKnowledgeService: Backend API integration pending');
    return [];
  }

  async submitClauseFeedback(
    clauseId: string,
    userId: string,
    outcome: 'accepted' | 'rejected' | 'modified',
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    console.warn('LegalKnowledgeService: Backend API integration pending');
    return { success: false, error: 'Backend API integration pending' };
  }

  async getTaxonomy(parentId?: string): Promise<LegalTaxonomy[]> {
    console.warn('LegalKnowledgeService: Backend API integration pending');
    return [];
  }

  async findRelatedConcepts(conceptId: string): Promise<LegalTaxonomy[]> {
    console.warn('LegalKnowledgeService: Backend API integration pending');
    return [];
  }
}

export const legalKnowledgeService = new LegalKnowledgeService();
