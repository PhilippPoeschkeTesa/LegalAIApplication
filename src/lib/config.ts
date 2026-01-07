/**
 * Global Application Configuration
 *
 * This file contains all centralized configuration values for the application.
 * All URLs, API endpoints, constants, and configuration values should be defined here
 * and referenced throughout the codebase.
 */

// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const apiEndpoints = {
  // Supabase Edge Functions base URL
  edgeFunctions: `${supabaseConfig.url}/functions/v1`,

  // Edge Function endpoints
  seedDemoData: `${supabaseConfig.url}/functions/v1/seed-demo-data`,

  // Add more edge function endpoints here as they are created
  // example: analyzeContract: `${supabaseConfig.url}/functions/v1/analyze-contract`,
  // example: generateClause: `${supabaseConfig.url}/functions/v1/generate-clause`,
} as const;

// ============================================================================
// APPLICATION ROUTES
// ============================================================================

export const appRoutes = {
  home: '/',
  auth: '/auth',
  legalai: '/legalai',
  review: '/review',
  draft: '/draft',
  builder: '/builder',
  repository: '/repository',
  intake: '/intake',
  search: '/search',
  clauses: '/clauses',
  playbooks: '/playbooks',
  workflows: '/workflows',
  analytics: '/analytics',
  partners: '/partners',
  discovery: '/discovery',
  research: '/research',
  admin: '/admin',
  settings: '/settings',
  help: '/help',
  legal: '/legal',
  notFound: '*',
} as const;

// ============================================================================
// DATABASE TABLE NAMES
// ============================================================================

export const dbTables = {
  // Core entities
  contracts: 'contracts',
  clauses: 'clauses',
  templates: 'templates',
  playbooks: 'playbooks',

  // User and access management
  userProfiles: 'user_profiles',
  accessRequests: 'access_requests',

  // Review and workflow
  reviews: 'reviews',
  reviewIssues: 'review_issues',
  workflows: 'workflows',
  workflowSteps: 'workflow_steps',

  // Analytics and tracking
  analytics: 'analytics',
  auditLogs: 'audit_logs',

  // Partners and integrations
  partners: 'partners',
  integrations: 'integrations',
} as const;

// ============================================================================
// AI MODEL CONFIGURATION
// ============================================================================

export interface AIModel {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  modelId: string;
  description?: string;
  jurisdictions: string[];
  regions: string[];
  capabilities: {
    summarization?: boolean;
    extraction?: boolean;
    analysis?: boolean;
    drafting?: boolean;
    translation?: boolean;
    multilingual?: boolean;
    longContext?: boolean;
    germanFocus?: boolean;
    usLaw?: boolean;
  };
  contextWindow: number;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

/**
 * AI Model Provider Endpoints
 */
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
  azure: {
    baseUrl: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
    deployments: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT
      ? `${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT}/openai/deployments`
      : '',
  },
} as const;

/**
 * AI Model Provider API Keys
 */
export const aiProviderKeys = {
  openai: import.meta.env.VITE_OPENAI_API_KEY || '',
  anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  huggingface: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
  deepl: import.meta.env.VITE_DEEPL_API_KEY || '',
  azure: import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
} as const;

/**
 * Legacy AI Models Configuration (for backward compatibility)
 */
export const aiModels = {
  default: {
    name: 'GPT-5-Turbo',
    id: 'gpt-5-turbo',
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
  },
  gpt5: {
    name: 'GPT-5',
    id: 'gpt-5',
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
  },
  turbo: {
    name: 'GPT-4-Turbo',
    id: 'gpt-4-turbo',
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
  },
  gpt4: {
    name: 'GPT-4',
    id: 'gpt-4',
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
  },
  claude: {
    name: 'Claude 3 Opus',
    id: 'claude-3-opus-20240229',
    provider: 'anthropic',
    endpoint: aiProviderEndpoints.anthropic.messages,
  },
  embedding: {
    name: 'text-embedding-3-large',
    id: 'text-embedding-3-large',
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.embeddings,
  },
} as const;

/**
 * Model Configuration by Provider
 */
export const modelConfigs = {
  'gpt-5': {
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
    maxTokens: 200000,
    temperature: 0.7,
  },
  'gpt-5-turbo': {
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
    maxTokens: 200000,
    temperature: 0.7,
  },
  'gpt-4': {
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
    maxTokens: 8192,
    temperature: 0.7,
  },
  'gpt-4-turbo': {
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
    maxTokens: 128000,
    temperature: 0.7,
  },
  'gpt-4-turbo-preview': {
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
    maxTokens: 128000,
    temperature: 0.7,
  },
  'gpt-4o-mini': {
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
    maxTokens: 128000,
    temperature: 0.7,
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    endpoint: aiProviderEndpoints.openai.chatCompletions,
    maxTokens: 16385,
    temperature: 0.7,
  },
  'claude-3-opus-20240229': {
    provider: 'anthropic',
    endpoint: aiProviderEndpoints.anthropic.messages,
    maxTokens: 200000,
    temperature: 0.7,
  },
  'claude-3-sonnet-20240229': {
    provider: 'anthropic',
    endpoint: aiProviderEndpoints.anthropic.messages,
    maxTokens: 200000,
    temperature: 0.7,
  },
  'nlpaueb/legal-bert-base-uncased': {
    provider: 'huggingface',
    endpoint: `${aiProviderEndpoints.huggingface.inference}/nlpaueb/legal-bert-base-uncased`,
    maxTokens: 512,
  },
  'deepl-api': {
    provider: 'deepl',
    endpoint: aiProviderEndpoints.deepl.translate,
  },
} as const;

/**
 * Get API endpoint for a specific model
 */
export function getModelEndpoint(modelId: string): string {
  const config = modelConfigs[modelId as keyof typeof modelConfigs];
  return config?.endpoint || aiProviderEndpoints.openai.chatCompletions;
}

/**
 * Get API key for a specific provider
 */
export function getProviderApiKey(provider: string): string {
  return aiProviderKeys[provider as keyof typeof aiProviderKeys] || '';
}

/**
 * Get model configuration
 */
export function getModelConfig(modelId: string) {
  return modelConfigs[modelId as keyof typeof modelConfigs];
}

/**
 * Get models filtered by jurisdiction
 */
export function getModelsByJurisdiction(jurisdiction: string): string[] {
  const jurisdictionMap: Record<string, string[]> = {
    'DACH': ['gpt-5', 'gpt-5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gpt-3.5-turbo', 'deepl-api'],
    'EU': ['gpt-5', 'gpt-5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gpt-3.5-turbo', 'deepl-api'],
    'US': ['gpt-5', 'gpt-5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus'],
    'GLOBAL': ['gpt-5', 'gpt-5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'],
  };
  return jurisdictionMap[jurisdiction] || jurisdictionMap['GLOBAL'];
}

/**
 * Get models filtered by region
 */
export function getModelsByRegion(region: string): string[] {
  const regionMap: Record<string, string[]> = {
    'EU': ['gpt-5', 'gpt-5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet', 'deepl-api'],
    'US': ['gpt-5', 'gpt-5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus'],
    'APAC': ['gpt-5', 'gpt-5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus'],
  };
  return regionMap[region] || regionMap['EU'];
}

// ============================================================================
// JURISDICTIONS
// ============================================================================

export const jurisdictions = {
  dach: {
    code: 'DACH',
    name: 'DACH',
    fullName: 'Germany, Austria, Switzerland',
    countries: ['Germany', 'Austria', 'Switzerland'],
  },
  eu: {
    code: 'EU',
    name: 'European Union',
    fullName: 'European Union',
    countries: ['All EU Member States'],
  },
  us: {
    code: 'US',
    name: 'United States',
    fullName: 'United States of America',
    countries: ['United States'],
  },
} as const;

// ============================================================================
// CONTRACT TYPES
// ============================================================================

export const contractTypes = {
  nda: {
    code: 'NDA',
    name: 'Non-Disclosure Agreement',
    category: 'confidentiality',
  },
  msa: {
    code: 'MSA',
    name: 'Master Service Agreement',
    category: 'service',
  },
  sow: {
    code: 'SOW',
    name: 'Statement of Work',
    category: 'service',
  },
  employment: {
    code: 'EMPLOYMENT',
    name: 'Employment Contract',
    category: 'hr',
  },
  license: {
    code: 'LICENSE',
    name: 'License Agreement',
    category: 'ip',
  },
} as const;

// ============================================================================
// ISSUE SEVERITY LEVELS
// ============================================================================

export const issueSeverity = {
  high: {
    level: 'High',
    priority: 1,
    color: 'red',
  },
  medium: {
    level: 'Medium',
    priority: 2,
    color: 'orange',
  },
  low: {
    level: 'Low',
    priority: 3,
    color: 'yellow',
  },
} as const;

// ============================================================================
// WORKFLOW STATUSES
// ============================================================================

export const workflowStatus = {
  pending: {
    status: 'pending',
    displayName: 'Pending',
    color: 'gray',
  },
  inProgress: {
    status: 'in_progress',
    displayName: 'In Progress',
    color: 'blue',
  },
  review: {
    status: 'review',
    displayName: 'In Review',
    color: 'orange',
  },
  approved: {
    status: 'approved',
    displayName: 'Approved',
    color: 'green',
  },
  rejected: {
    status: 'rejected',
    displayName: 'Rejected',
    color: 'red',
  },
  completed: {
    status: 'completed',
    displayName: 'Completed',
    color: 'green',
  },
} as const;

// ============================================================================
// USER ROLES
// ============================================================================

export const userRoles = {
  admin: {
    role: 'admin',
    displayName: 'Administrator',
    permissions: ['all'],
  },
  legalCounsel: {
    role: 'legal_counsel',
    displayName: 'Legal Counsel',
    permissions: ['read', 'write', 'review', 'approve'],
  },
  user: {
    role: 'user',
    displayName: 'User',
    permissions: ['read', 'write'],
  },
  viewer: {
    role: 'viewer',
    displayName: 'Viewer',
    permissions: ['read'],
  },
} as const;

// ============================================================================
// FILE TYPES AND EXTENSIONS
// ============================================================================

export const fileTypes = {
  documents: {
    extensions: ['.docx', '.doc', '.pdf', '.txt'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/pdf',
      'text/plain',
    ],
    maxSizeMB: 50,
  },
  spreadsheets: {
    extensions: ['.xlsx', '.xls', '.csv'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ],
    maxSizeMB: 25,
  },
} as const;

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const pagination = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
} as const;

// ============================================================================
// DATE AND TIME FORMATS
// ============================================================================

export const dateTimeFormats = {
  short: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  full: 'EEEE, MMMM d, yyyy',
  time: 'h:mm a',
  dateTime: 'MMM d, yyyy h:mm a',
  iso: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// ============================================================================
// LOCALIZATION
// ============================================================================

export const supportedLocales = {
  english: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  german: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
  },
} as const;

// ============================================================================
// TRANSLATION API CONFIGURATION
// ============================================================================

/**
 * Translation API Configuration
 *
 * Supports multiple translation providers:
 * - 'deepl': DeepL API (recommended for German/European languages)
 * - 'google': Google Cloud Translation API
 * - 'azure': Microsoft Azure Translator
 * - 'openai': OpenAI GPT models for context-aware translation
 * - 'local': Use local translation files only (default)
 */
export const translationConfig = {
  // Active provider - set to 'local' to use static translation files
  provider: (import.meta.env.VITE_TRANSLATION_PROVIDER || 'local') as 'deepl' | 'google' | 'azure' | 'openai' | 'local',

  // Enable automatic translation fetching for missing keys
  autoFetch: import.meta.env.VITE_TRANSLATION_AUTO_FETCH === 'true',

  // Cache translated strings in localStorage
  enableCache: true,

  // Cache expiration time in milliseconds (7 days)
  cacheExpiration: 7 * 24 * 60 * 60 * 1000,

  // Fallback to English if translation is missing
  fallbackToEnglish: true,

  // API endpoints for different providers
  endpoints: {
    deepl: 'https://api-free.deepl.com/v2/translate',
    google: 'https://translation.googleapis.com/language/translate/v2',
    azure: 'https://api.cognitive.microsofttranslator.com/translate',
    openai: 'https://api.openai.com/v1/chat/completions',
  },

  // API keys (loaded from environment variables)
  apiKeys: {
    deepl: import.meta.env.VITE_DEEPL_API_KEY || '',
    google: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '',
    azure: import.meta.env.VITE_AZURE_TRANSLATOR_KEY || '',
    openai: import.meta.env.VITE_OPENAI_API_KEY || '',
  },

  // Language mapping for APIs (some APIs use different codes)
  languageMapping: {
    deepl: {
      'en': 'EN-US',
      'de': 'DE',
    },
    google: {
      'en': 'en',
      'de': 'de',
    },
    azure: {
      'en': 'en',
      'de': 'de',
    },
    openai: {
      'en': 'English',
      'de': 'German',
    },
  },
} as const;

// ============================================================================
// BRAND COLORS (Non-theme specific brand colors)
// ============================================================================

export const brandColors = {
  tesaRed: '#E30613',
  tesaBlue: '#009FE3',
  tesaBlueGradientStart: '#009FE3',
  tesaBlueGradientEnd: 'rgb(59, 130, 246)', // blue-500
} as const;

// ============================================================================
// ANIMATION DURATIONS (in milliseconds)
// ============================================================================

export const animationDurations = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;

// ============================================================================
// TOAST/NOTIFICATION DURATIONS (in milliseconds)
// ============================================================================

export const notificationDurations = {
  short: 2000,
  normal: 4000,
  long: 6000,
  persistent: 0, // Won't auto-close
} as const;

// ============================================================================
// MOCK DATA (for demo purposes)
// ============================================================================

export const mockData = {
  demoUser: {
    email: 'demo@tesa.com',
    name: 'Demo User',
    role: 'Legal Counsel',
    avatar: 'D',
  },
  defaultPlaybook: {
    name: 'Standard NDA Review',
    version: 'v2.3',
  },
  sampleDocuments: [
    'NDA_EN_2024_v3.docx',
    'MSA_Template_2024.docx',
    'Employment_Contract_DE.docx',
    'License_Agreement_2024.pdf',
    'SOW_Q1_2024.docx',
  ],
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  },
  contractName: {
    minLength: 3,
    maxLength: 200,
    message: 'Contract name must be between 3 and 200 characters',
  },
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const featureFlags = {
  enableAnalytics: true,
  enableAIAssistant: true,
  enableVersionControl: true,
  enableCollaboration: true,
  enableExport: true,
  enableImport: true,
  enableNotifications: true,
  enableDemoMode: true,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the full API endpoint URL with authorization headers
 */
export function getApiHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    headers['Authorization'] = `Bearer ${supabaseConfig.anonKey}`;
    headers['apikey'] = supabaseConfig.anonKey;
  }

  return headers;
}

/**
 * Build a full API endpoint URL
 */
export function buildApiUrl(endpoint: string): string {
  return `${apiEndpoints.edgeFunctions}/${endpoint}`;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Get contract type display name
 */
export function getContractTypeName(code: string): string {
  const contractType = Object.values(contractTypes).find(ct => ct.code === code);
  return contractType?.name || code;
}

/**
 * Get jurisdiction display name
 */
export function getJurisdictionName(code: string): string {
  const jurisdiction = Object.values(jurisdictions).find(j => j.code === code);
  return jurisdiction?.fullName || code;
}
