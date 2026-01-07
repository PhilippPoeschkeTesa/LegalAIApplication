export interface AIFeedback {
  id?: string;
  conversation_id: string;
  message_id: string;
  user_id: string;
  rating: number;
  feedback_type: 'accuracy' | 'relevance' | 'completeness' | 'clarity' | 'hallucination' | 'general';
  feedback_text?: string;
  context_metadata?: {
    jurisdiction?: string;
    contract_type?: string;
    user_role?: string;
    query_type?: string;
    [key: string]: any;
  };
  created_at?: string;
}

export interface AIResponseLog {
  id?: string;
  conversation_id: string;
  message_id: string;
  model_version_id?: string;
  prompt_tokens: number;
  completion_tokens: number;
  response_time_ms: number;
  confidence_score?: number;
  citations?: Array<{
    source: string;
    reference: string;
    url?: string;
  }>;
  hallucination_flags?: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
}

export interface ModelPerformanceMetrics {
  model_id: string;
  version: string;
  average_rating: number;
  total_feedback_count: number;
  accuracy_score: number;
  hallucination_rate: number;
  average_response_time: number;
  token_efficiency: number;
}

class FeedbackService {
  async submitFeedback(feedback: AIFeedback): Promise<{ success: boolean; error?: string }> {
    console.warn('FeedbackService: Backend API integration pending');
    return { success: false, error: 'Backend API integration pending' };
  }

  async getFeedbackForMessage(messageId: string): Promise<AIFeedback[]> {
    console.warn('FeedbackService: Backend API integration pending');
    return [];
  }

  async getUserFeedbackStats(userId: string): Promise<{
    total_feedback: number;
    average_rating: number;
    feedback_by_type: Record<string, number>;
  }> {
    console.warn('FeedbackService: Backend API integration pending');
    return {
      total_feedback: 0,
      average_rating: 0,
      feedback_by_type: {},
    };
  }

  async logAIResponse(log: AIResponseLog): Promise<{ success: boolean; error?: string }> {
    console.warn('FeedbackService: Backend API integration pending');
    return { success: false, error: 'Backend API integration pending' };
  }

  async getModelPerformanceMetrics(modelId: string, days: number = 30): Promise<ModelPerformanceMetrics | null> {
    console.warn('FeedbackService: Backend API integration pending');
    return null;
  }

  async detectHallucinations(responseText: string, citations: any[]): Promise<Array<{
    type: string;
    severity: string;
    description: string;
  }>> {
    const flags: Array<{ type: string; severity: string; description: string }> = [];

    if (citations.length === 0 && (responseText.includes('according to') || responseText.includes('as stated in'))) {
      flags.push({
        type: 'missing_citation',
        severity: 'medium',
        description: 'Response references sources without providing citations',
      });
    }

    const confidencePatterns = [
      /I'm not (sure|certain|confident)/i,
      /may (be|have|not)/i,
      /possibly|perhaps|might/i,
    ];

    const hasLowConfidenceIndicators = confidencePatterns.some(pattern => pattern.test(responseText));
    if (hasLowConfidenceIndicators) {
      flags.push({
        type: 'low_confidence',
        severity: 'low',
        description: 'Response contains uncertainty indicators',
      });
    }

    const contradictionPatterns = [
      { pattern: /(yes|no).{0,50}(but|however|although)/i, description: 'Contradictory statements detected' },
      { pattern: /(always).{0,100}(never|rarely)/i, description: 'Conflicting absolute statements' },
    ];

    contradictionPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(responseText)) {
        flags.push({
          type: 'contradiction',
          severity: 'high',
          description,
        });
      }
    });

    const specificDatePattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g;
    const dateMatches = responseText.match(specificDatePattern);
    if (dateMatches && dateMatches.length > 0 && citations.length === 0) {
      flags.push({
        type: 'unsupported_claim',
        severity: 'high',
        description: 'Specific dates mentioned without supporting citations',
      });
    }

    return flags;
  }

  async calculateConfidenceScore(
    responseText: string,
    citations: any[],
    modelId: string
  ): Promise<number> {
    let score = 0.7;

    if (citations.length > 0) {
      score += 0.15;
    }

    const hedgingPatterns = [
      /I believe|I think|probably|likely|seems|appears/gi,
    ];
    const hedgingCount = hedgingPatterns.reduce((count, pattern) => {
      const matches = responseText.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    if (hedgingCount === 0) {
      score += 0.05;
    } else if (hedgingCount > 3) {
      score -= 0.15;
    }

    const factualPatterns = [
      /according to|as stated in|pursuant to|under|per/gi,
    ];
    const factualIndicators = factualPatterns.reduce((count, pattern) => {
      const matches = responseText.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    if (factualIndicators > 0) {
      score += Math.min(0.1, factualIndicators * 0.02);
    }

    const wordCount = responseText.split(/\s+/).length;
    if (wordCount > 100 && wordCount < 500) {
      score += 0.05;
    } else if (wordCount > 1000) {
      score -= 0.05;
    }

    return Math.max(0, Math.min(1, score));
  }
}

export const feedbackService = new FeedbackService();
