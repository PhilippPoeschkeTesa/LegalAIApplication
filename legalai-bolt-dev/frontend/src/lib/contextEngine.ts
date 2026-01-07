import { legalKnowledgeService } from './legalKnowledgeService';
import { feedbackService } from './feedbackService';

export interface UserContext {
  user_id: string;
  jurisdiction: string;
  language: string;
  role: string;
  industries: string[];
  contract_types: string[];
  expertise_level: 'beginner' | 'intermediate' | 'expert';
}

export interface QueryContext {
  contract_id?: string;
  contract_type?: string;
  jurisdiction: string;
  industry?: string;
  query_type: 'drafting' | 'review' | 'analysis' | 'research' | 'negotiation' | 'general';
  relevant_clauses?: string[];
  historical_context?: {
    similar_contracts: string[];
    previous_decisions: string[];
  };
}

export interface ContextualPrompt {
  system_prompt: string;
  user_prompt: string;
  context_metadata: {
    jurisdiction: string;
    contract_type?: string;
    user_role: string;
    query_type: string;
    relevant_sources: string[];
    precedents: string[];
  };
  suggested_models: string[];
  temperature: number;
}

class ContextEngine {
  async getUserContext(userId: string): Promise<UserContext | null> {
    console.warn('ContextEngine: Backend API integration pending');
    return {
      user_id: userId,
      jurisdiction: 'DACH',
      language: 'de',
      role: 'user',
      industries: [],
      contract_types: [],
      expertise_level: 'intermediate',
    };
  }

  async buildContextualPrompt(
    userContext: UserContext,
    queryContext: QueryContext,
    userQuery: string
  ): Promise<ContextualPrompt> {
    const systemPrompt = await this.generateSystemPrompt(userContext, queryContext);

    const relevantSources = await this.findRelevantLegalSources(queryContext);

    const precedents = await this.findRelevantPrecedents(queryContext);

    const suggestedModels = this.selectModels(queryContext.query_type, userContext.expertise_level);

    const temperature = this.determineTemperature(queryContext.query_type);

    return {
      system_prompt: systemPrompt,
      user_prompt: userQuery,
      context_metadata: {
        jurisdiction: queryContext.jurisdiction,
        contract_type: queryContext.contract_type,
        user_role: userContext.role,
        query_type: queryContext.query_type,
        relevant_sources: relevantSources,
        precedents: precedents,
      },
      suggested_models: suggestedModels,
      temperature,
    };
  }

  private async generateSystemPrompt(
    userContext: UserContext,
    queryContext: QueryContext
  ): Promise<string> {
    const roleDescription = this.getRoleDescription(userContext.role);
    const expertiseAdjustment = this.getExpertiseAdjustment(userContext.expertise_level);
    const jurisdictionContext = this.getJurisdictionContext(queryContext.jurisdiction);

    return `You are an AI legal assistant helping a ${roleDescription} with ${queryContext.query_type} tasks.

${jurisdictionContext}

${expertiseAdjustment}

Contract Type: ${queryContext.contract_type || 'General'}
Industry: ${queryContext.industry || 'Not specified'}

Always provide accurate, jurisdiction-specific advice based on current law and best practices.
Include citations and references where appropriate.
Clearly distinguish between legal requirements and best practices.
Flag any high-risk terms or clauses that require human legal review.`;
  }

  private getRoleDescription(role: string): string {
    const roles: Record<string, string> = {
      'admin': 'platform administrator',
      'legal_admin': 'legal department administrator',
      'lawyer': 'legal professional',
      'paralegal': 'paralegal',
      'business_user': 'business user',
      'user': 'general user',
    };
    return roles[role] || 'user';
  }

  private getExpertiseAdjustment(level: string): string {
    const adjustments: Record<string, string> = {
      'beginner': 'Provide detailed explanations of legal terms and concepts. Use plain language where possible.',
      'intermediate': 'Balance technical accuracy with clear explanations. Assume basic legal knowledge.',
      'expert': 'Use precise legal terminology. Focus on nuanced analysis and advanced considerations.',
    };
    return adjustments[level] || adjustments['intermediate'];
  }

  private getJurisdictionContext(jurisdiction: string): string {
    const contexts: Record<string, string> = {
      'DACH': 'Focus on German, Austrian, and Swiss law. Reference BGB, OR (Swiss), and ABGB (Austria) as appropriate.',
      'EU': 'Apply EU law including directives and regulations. Consider GDPR and other EU-wide legislation.',
      'UK': 'Apply UK law post-Brexit. Reference relevant Acts of Parliament and case law.',
      'US': 'Apply US federal and state law. Specify which jurisdiction when relevant.',
    };
    return contexts[jurisdiction] || `Focus on ${jurisdiction} law and regulations.`;
  }

  private async findRelevantLegalSources(queryContext: QueryContext): Promise<string[]> {
    console.warn('ContextEngine: Backend API integration pending');
    return [];
  }

  private async findRelevantPrecedents(queryContext: QueryContext): Promise<string[]> {
    console.warn('ContextEngine: Backend API integration pending');
    return [];
  }

  private selectModels(queryType: string, expertiseLevel: string): string[] {
    const modelMap: Record<string, string[]> = {
      'drafting': ['gpt-4', 'claude-3-opus'],
      'review': ['gpt-4-turbo', 'claude-3-sonnet'],
      'analysis': ['gpt-4', 'claude-3-opus'],
      'research': ['gpt-4-turbo', 'claude-3-sonnet'],
      'negotiation': ['gpt-4', 'claude-3-opus'],
      'general': ['gpt-3.5-turbo', 'claude-3-haiku'],
    };

    return modelMap[queryType] || modelMap['general'];
  }

  private determineTemperature(queryType: string): number {
    const temperatureMap: Record<string, number> = {
      'drafting': 0.3,
      'review': 0.2,
      'analysis': 0.4,
      'research': 0.3,
      'negotiation': 0.5,
      'general': 0.7,
    };

    return temperatureMap[queryType] || 0.5;
  }

  async enhanceQuery(
    userQuery: string,
    queryContext: QueryContext,
    userContext: UserContext
  ): Promise<string> {
    let enhancedQuery = userQuery;

    if (!userQuery.toLowerCase().includes(queryContext.jurisdiction.toLowerCase())) {
      enhancedQuery += `\n\nJurisdiction: ${queryContext.jurisdiction}`;
    }

    if (queryContext.contract_type && !userQuery.toLowerCase().includes(queryContext.contract_type.toLowerCase())) {
      enhancedQuery += `\nContract Type: ${queryContext.contract_type}`;
    }

    if (queryContext.industry) {
      enhancedQuery += `\nIndustry Context: ${queryContext.industry}`;
    }

    return enhancedQuery;
  }

  async recordQueryContext(
    conversationId: string,
    queryContext: QueryContext,
    userContext: UserContext
  ): Promise<void> {
    console.warn('ContextEngine: Backend API integration pending');
  }

  async getHistoricalContext(userId: string, queryType: string): Promise<{
    similar_queries: number;
    average_satisfaction: number;
    common_followups: string[];
  }> {
    console.warn('ContextEngine: Backend API integration pending');
    return {
      similar_queries: 0,
      average_satisfaction: 0,
      common_followups: [],
    };
  }
}

export const contextEngine = new ContextEngine();
