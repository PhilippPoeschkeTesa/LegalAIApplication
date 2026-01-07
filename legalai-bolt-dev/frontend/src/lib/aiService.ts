/**
 * AI Service
 *
 * Handles communication with various AI model providers including:
 * - OpenAI (GPT-4, GPT-3.5)
 * - Anthropic (Claude 3)
 * - HuggingFace (Legal-BERT)
 * - DeepL (Translation)
 */

import {
  aiProviderEndpoints,
  aiProviderKeys,
  modelConfigs,
  getModelEndpoint,
  getProviderApiKey,
  getModelConfig,
  type AIModel
} from './config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: AIModel;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

class AIService {
  /**
   * Send a chat completion request to the specified model
   */
  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const { model } = request;

    switch (model.provider) {
      case 'openai':
        return this.chatOpenAI(request);
      case 'anthropic':
        return this.chatAnthropic(request);
      case 'huggingface':
        return this.chatHuggingFace(request);
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }
  }

  /**
   * OpenAI Chat Completion
   */
  private async chatOpenAI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const apiKey = aiProviderKeys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const config = getModelConfig(request.model.modelId);
    const endpoint = aiProviderEndpoints.openai.chatCompletions;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model.modelId,
        messages: request.messages,
        temperature: request.temperature ?? config?.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? config?.maxTokens ?? 2000,
        stream: request.stream ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      finishReason: data.choices[0].finish_reason,
    };
  }

  /**
   * Anthropic (Claude) Chat Completion
   */
  private async chatAnthropic(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const apiKey = aiProviderKeys.anthropic;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const config = getModelConfig(request.model.modelId);
    const endpoint = aiProviderEndpoints.anthropic.messages;

    const systemMessage = request.messages.find(m => m.role === 'system');
    const conversationMessages = request.messages.filter(m => m.role !== 'system');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: request.model.modelId,
        messages: conversationMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        system: systemMessage?.content,
        temperature: request.temperature ?? config?.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? config?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      model: data.model,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      finishReason: data.stop_reason,
    };
  }

  /**
   * HuggingFace Inference
   */
  private async chatHuggingFace(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const apiKey = aiProviderKeys.huggingface;
    if (!apiKey) {
      throw new Error('HuggingFace API key not configured');
    }

    const endpoint = `${aiProviderEndpoints.huggingface.inference}/${request.model.modelId}`;

    const prompt = request.messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: request.maxTokens ?? 512,
          temperature: request.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HuggingFace API error: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    const generatedText = Array.isArray(data) ? data[0].generated_text : data.generated_text;

    return {
      content: generatedText,
      model: request.model.modelId,
    };
  }

  /**
   * Translate text using DeepL
   */
  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string> {
    const apiKey = aiProviderKeys.deepl;
    if (!apiKey) {
      throw new Error('DeepL API key not configured');
    }

    const endpoint = aiProviderEndpoints.deepl.translate;

    const params = new URLSearchParams({
      text,
      target_lang: targetLanguage.toUpperCase(),
    });

    if (sourceLanguage) {
      params.append('source_lang', sourceLanguage.toUpperCase());
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepL API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.translations[0].text;
  }

  /**
   * Generate embeddings using OpenAI
   */
  async generateEmbeddings(
    texts: string[],
    model = 'text-embedding-3-large'
  ): Promise<number[][]> {
    const apiKey = aiProviderKeys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const endpoint = aiProviderEndpoints.openai.embeddings;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  }

  /**
   * Check if a provider API key is configured
   */
  isProviderConfigured(provider: string): boolean {
    const key = getProviderApiKey(provider);
    return Boolean(key && key.length > 0);
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    const providers: string[] = [];

    if (this.isProviderConfigured('openai')) providers.push('openai');
    if (this.isProviderConfigured('anthropic')) providers.push('anthropic');
    if (this.isProviderConfigured('huggingface')) providers.push('huggingface');
    if (this.isProviderConfigured('deepl')) providers.push('deepl');

    return providers;
  }
}

export const aiService = new AIService();
