interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  apiVersion: string;
}

export class AzureOpenAIService {
  private config: AzureOpenAIConfig;

  constructor() {
    this.config = {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
    };

    if (!this.config.endpoint || !this.config.apiKey) {
      console.warn('Azure OpenAI configuration is incomplete. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.');
    }
  }

  async analyzeLegalDocument(
    documentText: string,
    systemPrompt: string,
    deploymentName?: string
  ): Promise<any[]> {
    if (!this.config.endpoint || !this.config.apiKey) {
      throw new Error('Azure OpenAI is not configured');
    }

    const url = `${this.config.endpoint}/openai/deployments/${
      deploymentName || this.config.deploymentName
    }/chat/completions?api-version=${this.config.apiVersion}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: documentText },
          ],
          temperature: 0.3,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Azure OpenAI API error: ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        const parsed = JSON.parse(content);
        return parsed.findings || [];
      } catch {
        console.error('Failed to parse AI response as JSON');
        return [];
      }
    } catch (error) {
      console.error('Azure OpenAI API call failed:', error);
      throw error;
    }
  }

  async verifyFinding(
    verificationPrompt: string,
    deploymentName?: string
  ): Promise<{ verification_status: string; notes: string }> {
    if (!this.config.endpoint || !this.config.apiKey) {
      throw new Error('Azure OpenAI is not configured');
    }

    const url = `${this.config.endpoint}/openai/deployments/${
      deploymentName || this.config.deploymentName
    }/chat/completions?api-version=${this.config.apiVersion}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: verificationPrompt }],
          temperature: 0.2,
          max_tokens: 500,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Azure OpenAI API error: ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch {
        return { verification_status: 'unverified', notes: 'Failed to parse verification' };
      }
    } catch (error) {
      console.error('Azure OpenAI verification failed:', error);
      return { verification_status: 'unverified', notes: 'Verification API call failed' };
    }
  }
}

export const azureOpenAIService = new AzureOpenAIService();
