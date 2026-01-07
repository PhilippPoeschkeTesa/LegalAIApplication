/**
 * Translation Service
 *
 * Provides dynamic translation capabilities with support for multiple
 * translation API providers including DeepL, Google Translate, Azure Translator,
 * and OpenAI.
 *
 * Features:
 * - Multi-provider support with easy switching
 * - Automatic caching to reduce API calls
 * - Fallback mechanisms for reliability
 * - Batch translation support
 * - Context-aware translations (OpenAI)
 */

import { translationConfig } from './config';
import { Locale } from './i18n';

interface TranslationCache {
  [key: string]: {
    text: string;
    timestamp: number;
  };
}

interface TranslateOptions {
  context?: string;
  formality?: 'formal' | 'informal';
  preserveFormatting?: boolean;
}

class TranslationService {
  private cache: TranslationCache = {};
  private cacheKey = 'legalai_translation_cache';

  constructor() {
    this.loadCache();
  }

  /**
   * Load translation cache from localStorage
   */
  private loadCache(): void {
    if (!translationConfig.enableCache) return;

    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        this.cache = JSON.parse(cached);
        this.cleanExpiredCache();
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error);
    }
  }

  /**
   * Save translation cache to localStorage
   */
  private saveCache(): void {
    if (!translationConfig.enableCache) return;

    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  /**
   * Remove expired entries from cache
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    let hasChanges = false;

    for (const key in this.cache) {
      if (now - this.cache[key].timestamp > translationConfig.cacheExpiration) {
        delete this.cache[key];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.saveCache();
    }
  }

  /**
   * Generate cache key for a translation request
   */
  private getCacheKey(text: string, from: Locale, to: Locale, context?: string): string {
    return `${from}-${to}-${context || 'default'}-${text}`;
  }

  /**
   * Get cached translation if available
   */
  private getCached(key: string): string | null {
    const cached = this.cache[key];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > translationConfig.cacheExpiration) {
      delete this.cache[key];
      this.saveCache();
      return null;
    }

    return cached.text;
  }

  /**
   * Store translation in cache
   */
  private setCached(key: string, text: string): void {
    this.cache[key] = {
      text,
      timestamp: Date.now(),
    };
    this.saveCache();
  }

  /**
   * Translate text using the configured provider
   */
  async translate(
    text: string,
    from: Locale,
    to: Locale,
    options: TranslateOptions = {}
  ): Promise<string> {
    if (from === to) return text;

    const cacheKey = this.getCacheKey(text, from, to, options.context);
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    if (translationConfig.provider === 'local' || !translationConfig.autoFetch) {
      return text;
    }

    try {
      let translated: string;

      switch (translationConfig.provider) {
        case 'deepl':
          translated = await this.translateWithDeepL(text, from, to, options);
          break;
        case 'google':
          translated = await this.translateWithGoogle(text, from, to);
          break;
        case 'azure':
          translated = await this.translateWithAzure(text, from, to);
          break;
        case 'openai':
          translated = await this.translateWithOpenAI(text, from, to, options);
          break;
        default:
          translated = text;
      }

      this.setCached(cacheKey, translated);
      return translated;
    } catch (error) {
      console.error(`Translation failed with ${translationConfig.provider}:`, error);
      return text;
    }
  }

  /**
   * Translate using DeepL API
   */
  private async translateWithDeepL(
    text: string,
    from: Locale,
    to: Locale,
    options: TranslateOptions
  ): Promise<string> {
    const apiKey = translationConfig.apiKeys.deepl;
    if (!apiKey) throw new Error('DeepL API key not configured');

    const mapping = translationConfig.languageMapping.deepl;
    const response = await fetch(translationConfig.endpoints.deepl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        source_lang: mapping[from] || from.toUpperCase(),
        target_lang: mapping[to] || to.toUpperCase(),
        ...(options.formality && { formality: options.formality }),
        ...(options.preserveFormatting && { preserve_formatting: '1' }),
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translations[0].text;
  }

  /**
   * Translate using Google Cloud Translation API
   */
  private async translateWithGoogle(
    text: string,
    from: Locale,
    to: Locale
  ): Promise<string> {
    const apiKey = translationConfig.apiKeys.google;
    if (!apiKey) throw new Error('Google Translate API key not configured');

    const mapping = translationConfig.languageMapping.google;
    const url = `${translationConfig.endpoints.google}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: mapping[from] || from,
        target: mapping[to] || to,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  }

  /**
   * Translate using Azure Translator API
   */
  private async translateWithAzure(
    text: string,
    from: Locale,
    to: Locale
  ): Promise<string> {
    const apiKey = translationConfig.apiKeys.azure;
    if (!apiKey) throw new Error('Azure Translator API key not configured');

    const mapping = translationConfig.languageMapping.azure;
    const url = `${translationConfig.endpoints.azure}?api-version=3.0&from=${mapping[from] || from}&to=${mapping[to] || to}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text }]),
    });

    if (!response.ok) {
      throw new Error(`Azure Translator API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0].translations[0].text;
  }

  /**
   * Translate using OpenAI API (context-aware translation)
   */
  private async translateWithOpenAI(
    text: string,
    from: Locale,
    to: Locale,
    options: TranslateOptions
  ): Promise<string> {
    const apiKey = translationConfig.apiKeys.openai;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const mapping = translationConfig.languageMapping.openai;
    const fromLang = mapping[from] || from;
    const toLang = mapping[to] || to;

    const systemPrompt = `You are a professional translator specializing in legal and business terminology.
Translate the following text from ${fromLang} to ${toLang}.
Maintain the original formatting, tone, and technical accuracy.
${options.context ? `Context: ${options.context}` : ''}
${options.formality ? `Formality level: ${options.formality}` : ''}
Only respond with the translated text, no explanations.`;

    const response = await fetch(translationConfig.endpoints.openai, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  /**
   * Translate multiple texts in a batch
   */
  async translateBatch(
    texts: string[],
    from: Locale,
    to: Locale,
    options: TranslateOptions = {}
  ): Promise<string[]> {
    return Promise.all(
      texts.map(text => this.translate(text, from, to, options))
    );
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache = {};
    localStorage.removeItem(this.cacheKey);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { total: number; size: string } {
    const total = Object.keys(this.cache).length;
    const size = new Blob([JSON.stringify(this.cache)]).size;
    return {
      total,
      size: `${(size / 1024).toFixed(2)} KB`,
    };
  }
}

export const translationService = new TranslationService();
