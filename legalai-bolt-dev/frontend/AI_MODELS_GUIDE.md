# AI Models Integration Guide

This guide explains how to configure and use different AI models in the LegalAI application.

## Overview

The application supports multiple AI model providers with jurisdiction-specific configurations:

- **OpenAI**: GPT-5, GPT-5-Turbo (default), GPT-4, GPT-4 Turbo, GPT-4o Mini, GPT-3.5 Turbo
- **Anthropic**: Claude 3 Opus, Claude 3 Sonnet
- **HuggingFace**: Legal-BERT (specialized for legal text)
- **DeepL**: Translation services for German legal documents

## Database Schema

### AI Models Table

Models are stored in the `ai_models` table with the following fields:

- `name`: Internal unique identifier
- `display_name`: User-facing name
- `provider`: Provider (openai, anthropic, huggingface, deepl)
- `model_id`: Provider's model identifier
- `description`: Model description
- `jurisdictions`: Array of supported jurisdictions (DACH, EU, US, GLOBAL)
- `regions`: Array of supported regions (EU, US, APAC)
- `capabilities`: JSON object with capabilities
- `context_window`: Maximum context size
- `is_active`: Whether model is available
- `is_default`: Default model flag
- `sort_order`: Display order

### Pre-configured Models

The following models are pre-configured in the database:

1. **GPT-5-Turbo** (OpenAI) - DEFAULT
   - Latest GPT-5 model with optimized performance
   - 200K token context window
   - Fast inference and high quality
   - Best for most legal tasks
   - Jurisdictions: DACH, EU, US, GLOBAL

2. **GPT-5** (OpenAI)
   - Most advanced GPT-5 flagship model
   - 200K token context window
   - Maximum capabilities for complex legal analysis
   - Best for detailed contract reviews and legal research
   - Jurisdictions: DACH, EU, US, GLOBAL

3. **GPT-4o Mini** (OpenAI)
   - Fast and cost-effective
   - 128K token context
   - Good for quick queries
   - Jurisdictions: DACH, EU, US, GLOBAL

4. **GPT-4** (OpenAI)
   - Best for complex legal analysis
   - 8,192 token context
   - Jurisdictions: DACH, EU, US, GLOBAL

5. **GPT-4 Turbo** (OpenAI)
   - Faster with 128K context
   - Best for long documents
   - Jurisdictions: DACH, EU, US, GLOBAL

6. **GPT-3.5 Turbo** (OpenAI)
   - Fast and cost-effective
   - Good for simple tasks
   - Jurisdictions: DACH, EU, US, GLOBAL

7. **Claude 3 Opus** (Anthropic)
   - Excellent for German legal texts
   - 200K token context
   - Jurisdictions: DACH, EU

8. **Claude 3 Sonnet** (Anthropic)
   - Balanced performance
   - Good for EU compliance
   - Jurisdictions: DACH, EU

9. **GPT-4 (US)** (OpenAI)
   - Optimized for US legal standards
   - Jurisdiction: US

10. **LegalBERT** (HuggingFace)
   - Specialized for legal classification
   - Jurisdiction: GLOBAL

11. **DeepL Translation** (DeepL)
   - High-quality German translation
   - Jurisdictions: DACH, EU

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-openai-key

# Anthropic Configuration
VITE_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# HuggingFace Configuration
VITE_HUGGINGFACE_API_KEY=hf_your-huggingface-key

# DeepL Configuration
VITE_DEEPL_API_KEY=your-deepl-key

# Azure OpenAI (Optional)
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
VITE_AZURE_OPENAI_API_KEY=your-azure-key
```

### Provider Endpoints

All provider endpoints are configured in `src/lib/config.ts`:

```typescript
export const aiProviderEndpoints = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    chatCompletions: 'https://api.openai.com/v1/chat/completions',
    embeddings: 'https://api.openai.com/v1/embeddings',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    messages: 'https://api.anthropic.com/v1/messages',
  },
  huggingface: {
    baseUrl: 'https://api-inference.huggingface.co',
    inference: 'https://api-inference.huggingface.co/models',
  },
  deepl: {
    baseUrl: 'https://api-free.deepl.com/v2',
    translate: 'https://api-free.deepl.com/v2/translate',
  },
};
```

## Usage

### In the Copilot Interface

1. **View Available Models**
   - Click the model selector button (with Settings icon)
   - Models are filtered by your jurisdiction
   - See model description and capabilities

2. **Select a Model**
   - Click on any model to select it
   - The selected model is used for all subsequent queries
   - Model selection is preserved per conversation

3. **Model Information**
   - Each model shows supported jurisdictions
   - Default model is marked with a badge
   - Model description explains use cases

### Programmatic Usage

#### Using the AI Service

```typescript
import { aiService } from '../lib/aiService';

// Send a chat message
const response = await aiService.chat({
  model: selectedModel,
  messages: [
    { role: 'system', content: 'You are a legal assistant' },
    { role: 'user', content: 'Summarize this contract' }
  ],
  temperature: 0.7,
  maxTokens: 2000
});

console.log(response.content);
```

#### Loading Models from Database

```typescript
import { supabase } from '../lib/supabase';

// Get all active models
const { data: models } = await supabase
  .from('ai_models')
  .select('*')
  .eq('is_active', true)
  .order('sort_order');

// Get models for specific jurisdiction
const { data: dachModels } = await supabase
  .from('ai_models')
  .select('*')
  .contains('jurisdictions', ['DACH'])
  .eq('is_active', true);
```

#### Using Model Configuration

```typescript
import { getModelConfig, getModelEndpoint } from '../lib/config';

// Get model configuration
const config = getModelConfig('gpt-4');
console.log(config.maxTokens); // 8192

// Get model endpoint
const endpoint = getModelEndpoint('claude-3-opus-20240229');
console.log(endpoint); // https://api.anthropic.com/v1/messages
```

## Adding New Models

### 1. Add to Database

```sql
INSERT INTO ai_models (
  name,
  display_name,
  provider,
  model_id,
  description,
  jurisdictions,
  regions,
  capabilities,
  context_window,
  is_active,
  is_default,
  sort_order
) VALUES (
  'gpt-6',
  'GPT-6',
  'openai',
  'gpt-6',
  'Next generation model',
  ARRAY['GLOBAL'],
  ARRAY['EU', 'US', 'APAC'],
  '{"summarization": true, "analysis": true}'::jsonb,
  32000,
  true,
  false,
  15
);
```

### 2. Add Configuration (if needed)

If the model requires special configuration, add to `src/lib/config.ts`:

```typescript
export const modelConfigs = {
  // ... existing configs
  'gpt-6': {
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
    maxTokens: 32000,
    temperature: 0.7,
  },
};
```

### 3. Update AI Service (if new provider)

If adding a new provider, add a method to `src/lib/aiService.ts`:

```typescript
private async chatNewProvider(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  // Implementation for new provider
}
```

## Model Capabilities

Models can have the following capabilities:

- `summarization`: Can summarize documents
- `extraction`: Can extract key information
- `analysis`: Can perform deep legal analysis
- `drafting`: Can draft legal documents
- `translation`: Translation services
- `multilingual`: Supports multiple languages
- `longContext`: Supports very long documents
- `germanFocus`: Optimized for German language
- `usLaw`: Optimized for US legal standards

Check capabilities programmatically:

```typescript
if (model.capabilities.analysis) {
  // Use model for legal analysis
}
```

## Jurisdiction Filtering

Models are automatically filtered by jurisdiction in the UI. To filter programmatically:

```typescript
import { getModelsByJurisdiction } from '../lib/config';

const dachModels = getModelsByJurisdiction('DACH');
// Returns: ['gpt-5', 'gpt-5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gpt-3.5-turbo', 'deepl-api']
```

## Cost Considerations

### Pricing (Approximate)

- **GPT-5**: Contact OpenAI for pricing
- **GPT-5-Turbo**: Contact OpenAI for pricing
- **GPT-4o Mini**: $0.00015/1K input tokens, $0.0006/1K output tokens
- **GPT-4**: $0.03/1K input tokens, $0.06/1K output tokens
- **GPT-4 Turbo**: $0.01/1K input tokens, $0.03/1K output tokens
- **GPT-3.5 Turbo**: $0.0005/1K input tokens, $0.0015/1K output tokens
- **Claude 3 Opus**: $0.015/1K input tokens, $0.075/1K output tokens
- **Claude 3 Sonnet**: $0.003/1K input tokens, $0.015/1K output tokens
- **LegalBERT**: Free (HuggingFace Inference API has rate limits)
- **DeepL**: Free tier (500K chars/month), then $5.49/month

### Cost Optimization

1. Use GPT-4o Mini or GPT-3.5 Turbo for simple queries
2. Use GPT-5-Turbo for most legal tasks (optimized performance)
3. Use GPT-5 only for highly complex analysis
4. Leverage caching for repeated queries
5. Use streaming for long responses
6. Monitor token usage in responses

## Best Practices

### Model Selection

1. **For Most Legal Tasks**: Use GPT-5-Turbo (default, optimized performance)
2. **For Complex Analysis**: Use GPT-5 (maximum capabilities)
3. **For German Contracts**: Use Claude 3 Opus or DeepL for translation
4. **For Long Documents**: Use GPT-5, GPT-5-Turbo, GPT-4 Turbo or Claude 3 (200K context)
5. **For Quick Queries**: Use GPT-4o Mini or GPT-3.5 Turbo
6. **For Legal Classification**: Use Legal-BERT
7. **For US Legal Standards**: Use GPT-4 (US) or GPT-5

### Error Handling

Always wrap AI calls in try-catch:

```typescript
try {
  const response = await aiService.chat(request);
  return response.content;
} catch (error) {
  console.error('AI service error:', error);
  return 'Unable to generate response. Please try again.';
}
```

### Rate Limiting

Implement rate limiting to avoid API limits:

```typescript
// Track requests per minute
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 50;

async function rateLimitedChat(request: ChatCompletionRequest) {
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Rate limit exceeded');
  }
  requestCount++;
  setTimeout(() => requestCount--, 60000);

  return aiService.chat(request);
}
```

### Context Management

For long conversations, manage context size:

```typescript
function truncateMessages(messages: ChatMessage[], maxTokens: number) {
  // Keep system message and recent messages
  const systemMsg = messages.find(m => m.role === 'system');
  const recent = messages.slice(-10); // Keep last 10 messages

  return systemMsg ? [systemMsg, ...recent] : recent;
}
```

## Troubleshooting

### Models Not Showing

1. Check database connection
2. Verify models are in `ai_models` table
3. Check `is_active` is true
4. Look at browser console for errors

### API Errors

1. Verify API keys are set in `.env`
2. Check API key has sufficient credits
3. Verify endpoint URLs are correct
4. Check network connectivity

### Performance Issues

1. Use streaming for long responses
2. Reduce max_tokens if possible
3. Use faster models for simple tasks
4. Implement caching for repeated queries

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate API keys regularly
- Monitor API usage for anomalies
- Implement rate limiting
- Validate all user inputs before sending to AI
