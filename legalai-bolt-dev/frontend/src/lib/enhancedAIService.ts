import { aiService, type ChatMessage, type ChatCompletionRequest, type ChatCompletionResponse } from './aiService';
import { feedbackService } from './feedbackService';
import { contextEngine, type UserContext, type QueryContext } from './contextEngine';
import { type AIModel } from './config';

export interface EnhancedChatRequest extends ChatCompletionRequest {
  conversationId: string;
  messageId: string;
  userContext?: UserContext;
  queryContext?: QueryContext;
  enableQualityChecks?: boolean;
}

export interface EnhancedChatResponse extends ChatCompletionResponse {
  confidenceScore: number;
  citations: Array<{
    source: string;
    reference: string;
    url?: string;
  }>;
  hallucinationFlags: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  qualityScore: number;
  warnings: string[];
  responseTimeMs: number;
}

export interface QualityCheckResult {
  passed: boolean;
  score: number;
  issues: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
  }>;
  recommendations: string[];
}

class EnhancedAIService {
  async chat(request: EnhancedChatRequest): Promise<EnhancedChatResponse> {
    const startTime = performance.now();

    let messages = request.messages;

    if (request.userContext && request.queryContext) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === 'user') {
        const contextualPrompt = await contextEngine.buildContextualPrompt(
          request.userContext,
          request.queryContext,
          lastUserMessage.content
        );

        messages = [
          { role: 'system', content: contextualPrompt.system_prompt },
          ...messages.slice(0, -1),
          { role: 'user', content: contextualPrompt.user_prompt },
        ];
      }
    }

    const baseResponse = await aiService.chat({
      ...request,
      messages,
    });

    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);

    const citations = this.extractCitations(baseResponse.content);

    const hallucinationFlags = await feedbackService.detectHallucinations(
      baseResponse.content,
      citations
    );

    const confidenceScore = await feedbackService.calculateConfidenceScore(
      baseResponse.content,
      citations,
      request.model.modelId
    );

    const qualityScore = this.calculateQualityScore(
      baseResponse.content,
      citations,
      hallucinationFlags,
      confidenceScore
    );

    const warnings = this.generateWarnings(
      hallucinationFlags,
      confidenceScore,
      qualityScore
    );

    await feedbackService.logAIResponse({
      conversation_id: request.conversationId,
      message_id: request.messageId,
      prompt_tokens: baseResponse.usage?.promptTokens || 0,
      completion_tokens: baseResponse.usage?.completionTokens || 0,
      response_time_ms: responseTimeMs,
      confidence_score: confidenceScore,
      citations,
      hallucination_flags: hallucinationFlags,
    });

    return {
      ...baseResponse,
      confidenceScore,
      citations,
      hallucinationFlags,
      qualityScore,
      warnings,
      responseTimeMs,
    };
  }

  private extractCitations(text: string): Array<{
    source: string;
    reference: string;
    url?: string;
  }> {
    const citations: Array<{ source: string; reference: string; url?: string }> = [];

    const patterns = [
      /\(([A-Z]+)\s+(?:Art\.|§|Article)\s*(\d+[a-z]?)\)/gi,
      /according to ([A-Z][A-Za-z\s]+),?\s+(?:Art\.|§|Article)\s*(\d+[a-z]?)/gi,
      /as stated in ([A-Z][A-Za-z\s]+),?\s+(?:Art\.|§|Article)\s*(\d+[a-z]?)/gi,
      /pursuant to ([A-Z][A-Za-z\s]+),?\s+(?:Art\.|§|Article)\s*(\d+[a-z]?)/gi,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        citations.push({
          source: match[1].trim(),
          reference: match[2].trim(),
        });
      }
    });

    const deduplicatedCitations = citations.filter((citation, index, self) =>
      index === self.findIndex(c =>
        c.source === citation.source && c.reference === citation.reference
      )
    );

    return deduplicatedCitations;
  }

  private calculateQualityScore(
    content: string,
    citations: any[],
    hallucinationFlags: any[],
    confidenceScore: number
  ): number {
    let score = 100;

    if (citations.length === 0 && content.length > 200) {
      score -= 10;
    }

    hallucinationFlags.forEach(flag => {
      if (flag.severity === 'high') score -= 20;
      else if (flag.severity === 'medium') score -= 10;
      else if (flag.severity === 'low') score -= 5;
    });

    if (confidenceScore < 0.5) {
      score -= 15;
    } else if (confidenceScore < 0.7) {
      score -= 10;
    }

    const sentenceCount = (content.match(/[.!?]+/g) || []).length;
    const wordCount = content.split(/\s+/).length;
    const avgWordsPerSentence = wordCount / (sentenceCount || 1);

    if (avgWordsPerSentence < 10 || avgWordsPerSentence > 40) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateWarnings(
    hallucinationFlags: any[],
    confidenceScore: number,
    qualityScore: number
  ): string[] {
    const warnings: string[] = [];

    if (confidenceScore < 0.6) {
      warnings.push('Low confidence score - consider validating this response with a legal professional');
    }

    if (qualityScore < 60) {
      warnings.push('Quality score below threshold - response may require human review');
    }

    const highSeverityFlags = hallucinationFlags.filter(f => f.severity === 'high');
    if (highSeverityFlags.length > 0) {
      warnings.push('Potential hallucination detected - verify all factual claims independently');
    }

    const contradictionFlags = hallucinationFlags.filter(f => f.type === 'contradiction');
    if (contradictionFlags.length > 0) {
      warnings.push('Internal contradictions detected in response - review carefully');
    }

    return warnings;
  }

  async runQualityChecks(
    response: EnhancedChatResponse,
    expectedContext?: QueryContext
  ): Promise<QualityCheckResult> {
    const issues: Array<{
      type: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      message: string;
    }> = [];

    const recommendations: string[] = [];

    if (response.confidenceScore < 0.5) {
      issues.push({
        type: 'low_confidence',
        severity: 'high',
        message: 'Response has very low confidence score',
      });
      recommendations.push('Consider requesting clarification or using a different model');
    }

    if (response.hallucinationFlags.length > 0) {
      response.hallucinationFlags.forEach(flag => {
        issues.push({
          type: flag.type,
          severity: flag.severity as any,
          message: flag.description,
        });
      });
      recommendations.push('Verify all factual claims with authoritative sources');
    }

    if (response.citations.length === 0 && response.content.length > 300) {
      issues.push({
        type: 'missing_citations',
        severity: 'medium',
        message: 'Long response without any legal citations',
      });
      recommendations.push('Request specific legal references to support the analysis');
    }

    if (expectedContext?.jurisdiction) {
      const jurisdictionMentioned = response.content.toLowerCase().includes(
        expectedContext.jurisdiction.toLowerCase()
      );

      if (!jurisdictionMentioned) {
        issues.push({
          type: 'jurisdiction_mismatch',
          severity: 'medium',
          message: `Expected jurisdiction ${expectedContext.jurisdiction} not explicitly mentioned`,
        });
        recommendations.push('Verify that the response applies to the correct jurisdiction');
      }
    }

    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;

    let score = 100;
    score -= criticalIssues * 30;
    score -= highIssues * 20;
    score -= issues.filter(i => i.severity === 'medium').length * 10;
    score -= issues.filter(i => i.severity === 'low').length * 5;

    score = Math.max(0, Math.min(100, score));

    const passed = criticalIssues === 0 && highIssues === 0 && score >= 60;

    return {
      passed,
      score,
      issues,
      recommendations,
    };
  }

  async validateAgainstLegalSources(
    response: string,
    citations: Array<{ source: string; reference: string }>
  ): Promise<{
    validated: boolean;
    mismatches: Array<{
      citation: string;
      issue: string;
    }>;
  }> {
    const mismatches: Array<{ citation: string; issue: string }> = [];

    for (const citation of citations) {
      const validLegalSources = ['BGB', 'HGB', 'GDPR', 'BDSG', 'UCC', 'CISG', 'ABGB', 'OR'];

      if (!validLegalSources.some(source => citation.source.includes(source))) {
        mismatches.push({
          citation: `${citation.source} ${citation.reference}`,
          issue: 'Citation source may not be a valid legal reference',
        });
      }
    }

    return {
      validated: mismatches.length === 0,
      mismatches,
    };
  }

  async compareMultipleModels(
    request: EnhancedChatRequest,
    models: AIModel[]
  ): Promise<Array<{
    model: AIModel;
    response: EnhancedChatResponse;
    qualityCheck: QualityCheckResult;
  }>> {
    const results = [];

    for (const model of models) {
      try {
        const response = await this.chat({
          ...request,
          model,
        });

        const qualityCheck = await this.runQualityChecks(response, request.queryContext);

        results.push({
          model,
          response,
          qualityCheck,
        });
      } catch (error) {
        console.error(`Error with model ${model.modelId}:`, error);
      }
    }

    return results;
  }

  selectBestResponse(
    results: Array<{
      model: AIModel;
      response: EnhancedChatResponse;
      qualityCheck: QualityCheckResult;
    }>
  ): {
    model: AIModel;
    response: EnhancedChatResponse;
    qualityCheck: QualityCheckResult;
  } | null {
    if (results.length === 0) return null;

    const scored = results.map(result => ({
      ...result,
      combinedScore:
        result.response.qualityScore * 0.4 +
        result.response.confidenceScore * 100 * 0.3 +
        result.qualityCheck.score * 0.3,
    }));

    scored.sort((a, b) => b.combinedScore - a.combinedScore);

    return scored[0];
  }

  async getConsensusResponse(
    request: EnhancedChatRequest,
    models: AIModel[]
  ): Promise<{
    consensus: string;
    individualResponses: Array<{
      model: string;
      response: string;
      confidence: number;
    }>;
    agreementScore: number;
  }> {
    const results = await this.compareMultipleModels(request, models);

    const responses = results.map(r => ({
      model: r.model.displayName,
      response: r.response.content,
      confidence: r.response.confidenceScore,
    }));

    const commonThemes = this.extractCommonThemes(responses.map(r => r.response));

    let consensusText = 'Based on analysis from multiple AI models:\n\n';
    consensusText += commonThemes.join('\n');

    consensusText += '\n\nNote: This consensus was generated from ' + results.length + ' different AI models.';

    const agreementScore = this.calculateAgreementScore(responses.map(r => r.response));

    return {
      consensus: consensusText,
      individualResponses: responses,
      agreementScore,
    };
  }

  private extractCommonThemes(responses: string[]): string[] {
    const themes: string[] = [];

    if (responses.length === 0) return themes;

    const allSentences = responses.flatMap(r =>
      r.match(/[^.!?]+[.!?]+/g) || []
    );

    const sentenceFrequency = new Map<string, number>();

    allSentences.forEach(sentence => {
      const normalized = sentence.trim().toLowerCase();
      sentenceFrequency.set(normalized, (sentenceFrequency.get(normalized) || 0) + 1);
    });

    const commonSentences = Array.from(sentenceFrequency.entries())
      .filter(([_, count]) => count >= Math.ceil(responses.length / 2))
      .map(([sentence]) => sentence);

    return commonSentences.slice(0, 5);
  }

  private calculateAgreementScore(responses: string[]): number {
    if (responses.length < 2) return 100;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        totalSimilarity += this.calculateTextSimilarity(responses[i], responses[j]);
        comparisons++;
      }
    }

    return Math.round((totalSimilarity / comparisons) * 100);
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}

export const enhancedAIService = new EnhancedAIService();
