# Translation System Guide

This application uses a flexible translation system that supports both static translations and dynamic API-based translations.

## Overview

The translation system supports:
- **Static translations**: Hardcoded translations in `src/lib/i18n.ts`
- **Dynamic translations**: Real-time translation using external APIs
- **Multiple providers**: DeepL, Google Translate, Azure Translator, OpenAI
- **Automatic caching**: Reduces API calls and improves performance
- **Fallback mechanisms**: Ensures the app works even if APIs fail

## Configuration

All translation settings are centralized in `src/lib/config.ts` under `translationConfig`.

### Environment Variables

Add these to your `.env` file:

```env
# Translation Provider (local, deepl, google, azure, openai)
VITE_TRANSLATION_PROVIDER=local

# Enable automatic translation for missing keys
VITE_TRANSLATION_AUTO_FETCH=false

# API Keys (only needed if using that provider)
VITE_DEEPL_API_KEY=your_deepl_api_key
VITE_GOOGLE_TRANSLATE_API_KEY=your_google_api_key
VITE_AZURE_TRANSLATOR_KEY=your_azure_key
VITE_OPENAI_API_KEY=your_openai_key
```

## Translation Providers

### 1. Local (Default)
Uses static translations defined in `src/lib/i18n.ts`. No API calls, fastest performance.

```env
VITE_TRANSLATION_PROVIDER=local
```

**Pros:**
- Free
- Fast
- Works offline
- No API limits

**Cons:**
- Requires manual translation updates
- Limited to predefined languages

### 2. DeepL (Recommended for German/European languages)
High-quality neural machine translation, especially good for European languages.

```env
VITE_TRANSLATION_PROVIDER=deepl
VITE_DEEPL_API_KEY=your_key
```

**Setup:**
1. Sign up at https://www.deepl.com/pro-api
2. Get your API key
3. Add to `.env` file

**Pros:**
- Excellent quality for German ↔ English
- Supports formality levels
- Preserves formatting

**Cons:**
- Paid service (free tier available: 500,000 characters/month)
- Limited language support compared to Google

### 3. Google Cloud Translation
Supports 100+ languages with good quality.

```env
VITE_TRANSLATION_PROVIDER=google
VITE_GOOGLE_TRANSLATE_API_KEY=your_key
```

**Setup:**
1. Create project at https://console.cloud.google.com
2. Enable Cloud Translation API
3. Create API key
4. Add to `.env` file

**Pros:**
- Wide language support
- Reliable service
- Good quality

**Cons:**
- Paid service
- Quality varies by language pair

### 4. Azure Translator
Microsoft's translation service with good performance.

```env
VITE_TRANSLATION_PROVIDER=azure
VITE_AZURE_TRANSLATOR_KEY=your_key
```

**Setup:**
1. Create Azure account
2. Create Translator resource
3. Get subscription key
4. Add to `.env` file

**Pros:**
- Enterprise-grade reliability
- Good documentation
- Integrated with Microsoft ecosystem

**Cons:**
- Paid service
- More complex setup

### 5. OpenAI (Context-Aware)
Uses GPT models for context-aware, high-quality translations.

```env
VITE_TRANSLATION_PROVIDER=openai
VITE_OPENAI_API_KEY=your_key
```

**Setup:**
1. Sign up at https://platform.openai.com
2. Get API key
3. Add to `.env` file

**Pros:**
- Best quality for legal/technical content
- Understands context
- Maintains tone and style

**Cons:**
- Most expensive option
- Slower than other providers
- Requires careful prompt engineering

## Usage Examples

### Basic Translation (Using Static Translations)

```typescript
import { useLocale } from '../contexts/LocaleContext';

function MyComponent() {
  const { t } = useLocale();

  return <h1>{t.home.welcome}</h1>;
}
```

### Dynamic Translation (Custom Text)

```typescript
import { translateText } from '../lib/i18n';
import { useLocale } from '../contexts/LocaleContext';

async function translateCustomText() {
  const { locale } = useLocale();

  const result = await translateText(
    'This contract needs review',
    locale,
    'en',
    'Legal document context'
  );

  console.log(result);
}
```

### Translate Specific Key

```typescript
import { translateKey } from '../lib/i18n';

async function getTranslation() {
  const translation = await translateKey(
    'nav.home',
    'de', // target language
    'en'  // source language
  );

  console.log(translation); // 'Startseite'
}
```

### Batch Translation

```typescript
import { translateKeys } from '../lib/i18n';

async function translateMultiple() {
  const keys = ['nav.home', 'nav.copilot', 'nav.review'];
  const translations = await translateKeys(keys, 'de', 'en');

  console.log(translations);
  // { 'nav.home': 'Startseite', 'nav.copilot': 'LegalAI', ... }
}
```

### Using Translation Service Directly

```typescript
import { translationService } from '../lib/translationService';

async function translate() {
  const result = await translationService.translate(
    'Legal document review',
    'en',
    'de',
    {
      context: 'Legal software interface',
      formality: 'formal',
      preserveFormatting: true
    }
  );

  console.log(result);
}
```

## Caching

The translation service automatically caches all translations in `localStorage` to reduce API calls and improve performance.

### Cache Configuration

```typescript
// In config.ts
translationConfig: {
  enableCache: true,
  cacheExpiration: 7 * 24 * 60 * 60 * 1000, // 7 days
}
```

### Cache Management

```typescript
import { translationService } from '../lib/translationService';

// Clear cache
translationService.clearCache();

// Get cache stats
const stats = translationService.getCacheStats();
console.log(`Cache contains ${stats.total} entries, ${stats.size}`);
```

## Best Practices

### 1. Use Static Translations When Possible
Static translations are faster and free. Use them for UI elements that don't change.

### 2. Add Context for Better Quality
Always provide context when translating technical or legal terms:

```typescript
await translateText(
  'review',
  'de',
  'en',
  'Legal contract review process' // context improves accuracy
);
```

### 3. Use DeepL for German Content
For German translations, DeepL typically provides the best quality:

```env
VITE_TRANSLATION_PROVIDER=deepl
```

### 4. Batch Translations
When translating multiple strings, use batch translation to improve performance:

```typescript
// Good
const results = await translateKeys(['key1', 'key2', 'key3'], 'de');

// Avoid
const r1 = await translateKey('key1', 'de');
const r2 = await translateKey('key2', 'de');
const r3 = await translateKey('key3', 'de');
```

### 5. Handle Errors Gracefully
Always handle translation failures:

```typescript
try {
  const translated = await translateText(text, 'de');
  return translated;
} catch (error) {
  console.error('Translation failed:', error);
  return text; // fallback to original
}
```

### 6. Monitor API Usage
Most translation APIs have usage limits and costs. Monitor your usage:

- DeepL: 500,000 chars/month free tier
- Google: Pay per character
- Azure: Pay per character
- OpenAI: Pay per token (most expensive)

### 7. Use Formality Levels (DeepL)
For formal business communication, set formality:

```typescript
await translationService.translate(text, 'en', 'de', {
  formality: 'formal' // or 'informal'
});
```

## Adding New Languages

To add a new language:

1. **Add to supported locales** (`src/lib/config.ts`):
```typescript
export const supportedLocales = {
  // ...existing
  french: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
  },
} as const;
```

2. **Add static translations** (`src/lib/i18n.ts`):
```typescript
export const translations = {
  // ...existing
  fr: {
    nav: {
      home: 'Accueil',
      // ...
    },
  },
};
```

3. **Update language mapping** (if using APIs):
```typescript
languageMapping: {
  deepl: {
    'fr': 'FR',
  },
  // ...
}
```

## Troubleshooting

### Translations Not Working

1. Check environment variables are set correctly
2. Verify API keys are valid
3. Check browser console for errors
4. Verify `VITE_TRANSLATION_AUTO_FETCH=true` if using APIs

### API Errors

1. Check API key is valid
2. Verify you haven't exceeded rate limits
3. Check API service status
4. Review API-specific error messages

### Cache Issues

1. Clear cache: `translationService.clearCache()`
2. Check localStorage is not disabled
3. Verify cache expiration settings

## Cost Estimates

Based on typical usage:

- **DeepL Free**: Up to 500,000 chars/month (sufficient for most apps)
- **DeepL Pro**: $5.49/month for 1M chars
- **Google Translate**: ~$20 per 1M characters
- **Azure Translator**: ~$10 per 1M characters
- **OpenAI GPT-4**: ~$30 per 1M tokens (≈750,000 words)

## Performance Tips

1. Use static translations for fixed UI elements
2. Enable caching to reduce API calls
3. Batch translate when possible
4. Use DeepL or Google for best speed
5. Consider translating at build time for production
6. Monitor and optimize API usage

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate API keys regularly
- Monitor API usage for anomalies
- Use HTTPS for all API calls
- Implement rate limiting if exposing translation endpoints
