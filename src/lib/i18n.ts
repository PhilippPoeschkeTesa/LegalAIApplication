import { translationService } from './translationService';
import { translationConfig } from './config';

export const locales = ['en', 'de'] as const;
export type Locale = typeof locales[number];

/**
 * Static translation definitions
 * These serve as the base translations and fallback when API translation is not available
 */
export const translations = {
  en: {
    nav: {
      home: 'Home',
      copilot: 'LegalAI',
      review: 'Review',
      draft: 'Draft',
      builder: 'Document Builder',
      repository: 'Repository',
      intake: 'Intake',
      search: 'Search',
      clauses: 'Clause Library',
      playbooks: 'Playbooks',
      workflows: 'Workflows',
      analytics: 'Analytics',
      partners: 'Partner 360',
      discovery: 'Discovery',
      research: 'Research Hub',
      admin: 'Admin',
      settings: 'Settings',
      help: 'Help',
      legal: 'Legal',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      upload: 'Upload',
      download: 'Download',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      noData: 'No data available',
    },
    home: {
      title: 'Dashboard',
      welcome: 'Welcome to LegalAI',
      myQueue: 'My Queue',
      quickActions: 'Quick Actions',
      recentPartners: 'Recent Partners',
    },
    legalai: {
      title: 'LegalAI',
      placeholder: 'Ask a legal question...',
      tools: {
        summarize: 'Summarize',
        extract: 'Extract',
        compare: 'Compare',
        risk: 'Risk Analysis',
        compose: 'Compose',
      },
    },
    review: {
      title: 'Document Review',
      analyze: 'Analyze',
      redline: 'Redline',
      uploadToCLM: 'Upload to CLM',
      issues: 'Issues',
      severity: 'Severity',
      playbook: 'Playbook',
    },
    intake: {
      title: 'Legal Intake',
      oneDrop: 'One-Drop',
      myRequests: 'My Requests',
      dropzone: 'Drop your document here or click to upload',
      extracting: 'Extracting metadata...',
      createRequest: 'Create CLM Request',
    },
    partners: {
      title: 'Partner 360',
      overview: 'Overview',
      contracts: 'Contracts',
      risks: 'Risks',
      obligations: 'Obligations',
      contacts: 'Contacts',
    },
    discovery: {
      title: 'Discovery',
      newProject: 'New Project',
      status: {
        queued: 'Queued',
        parsing: 'Parsing',
        embedding: 'Embedding',
        extraction: 'Extraction',
        risking: 'Risk Analysis',
        completed: 'Completed',
        failed: 'Failed',
      },
    },
    research: {
      title: 'Research Hub',
      query: 'Research Question',
      citations: 'Citations',
      confidence: 'Confidence',
      sources: 'Authoritative Sources',
    },
    auth: {
      welcome: 'Welcome to LegalAI',
      subtitle: 'Enterprise Legal AI Platform for tesa',
      ssoButton: 'Sign in with your company account',
      redirecting: 'Redirecting to identity provider...',
      or: 'or',
      requestAccess: 'Request access',
      havingTrouble: 'Having trouble?',
      emergencyAccessTitle: 'Emergency Admin Access',
      emergencyAccessWarning: 'IP-restricted. All access is logged and audited.',
      useEmergencyLogin: 'Use emergency login',
      emergencyOnly: 'Emergency Access Only',
      emergencyMonitored: 'This login is IP-restricted and monitored.',
      adminEmail: 'Admin Email',
      password: 'Password',
      emergencySignIn: 'Emergency Sign In',
      verifying: 'Verifying...',
      backToSSO: '← Back to SSO',
      requestTitle: "Don't have access? Request it from your LegalAI administrator.",
      fullName: 'Full Name',
      companyEmail: 'Company Email',
      department: 'Department',
      selectDepartment: 'Select department',
      deptLegal: 'Legal',
      deptCompliance: 'Compliance',
      deptProcurement: 'Procurement',
      deptSales: 'Sales',
      deptOther: 'Other',
      submitRequest: 'Submit Request',
      submitting: 'Submitting...',
      backToSignIn: '← Back to sign in',
      requestSubmittedTitle: 'Request Submitted',
      requestSubmittedMessage: "Your access request has been sent to the LegalAI administrators. You'll receive an email once your request is reviewed.",
      authorizedOnly: 'For authorized users only',
      activityLogged: 'Activity may be logged and audited',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
      byContinuing: 'By continuing you agree to the',
      and: 'and',
      invalidCredentials: 'Invalid credentials. Emergency access is IP-restricted and logged.',
    },
  },
  de: {
    nav: {
      home: 'Startseite',
      copilot: 'LegalAI',
      review: 'Prüfung',
      draft: 'Entwurf',
      builder: 'Dokumenten-Builder',
      repository: 'Repository',
      intake: 'Aufnahme',
      search: 'Suche',
      clauses: 'Klauselbibliothek',
      playbooks: 'Playbooks',
      workflows: 'Workflows',
      analytics: 'Analytik',
      partners: 'Partner 360',
      discovery: 'Discovery',
      research: 'Recherche',
      admin: 'Admin',
      settings: 'Einstellungen',
      help: 'Hilfe',
      legal: 'Rechtliches',
    },
    common: {
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      search: 'Suchen',
      filter: 'Filtern',
      export: 'Exportieren',
      import: 'Importieren',
      upload: 'Hochladen',
      download: 'Herunterladen',
      actions: 'Aktionen',
      status: 'Status',
      date: 'Datum',
      noData: 'Keine Daten verfügbar',
    },
    home: {
      title: 'Dashboard',
      welcome: 'Willkommen bei LegalAI',
      myQueue: 'Meine Warteschlange',
      quickActions: 'Schnellaktionen',
      recentPartners: 'Aktuelle Partner',
    },
    legalai: {
      title: 'LegalAI',
      placeholder: 'Stellen Sie eine rechtliche Frage...',
      tools: {
        summarize: 'Zusammenfassen',
        extract: 'Extrahieren',
        compare: 'Vergleichen',
        risk: 'Risikoanalyse',
        compose: 'Verfassen',
      },
    },
    review: {
      title: 'Dokumentenprüfung',
      analyze: 'Analysieren',
      redline: 'Redline',
      uploadToCLM: 'Zu CLM hochladen',
      issues: 'Probleme',
      severity: 'Schweregrad',
      playbook: 'Playbook',
    },
    intake: {
      title: 'Rechtliche Aufnahme',
      oneDrop: 'One-Drop',
      myRequests: 'Meine Anfragen',
      dropzone: 'Dokument hier ablegen oder klicken zum Hochladen',
      extracting: 'Metadaten extrahieren...',
      createRequest: 'CLM-Anfrage erstellen',
    },
    partners: {
      title: 'Partner 360',
      overview: 'Übersicht',
      contracts: 'Verträge',
      risks: 'Risiken',
      obligations: 'Verpflichtungen',
      contacts: 'Kontakte',
    },
    discovery: {
      title: 'Discovery',
      newProject: 'Neues Projekt',
      status: {
        queued: 'In Warteschlange',
        parsing: 'Analyse',
        embedding: 'Einbettung',
        extraction: 'Extraktion',
        risking: 'Risikoanalyse',
        completed: 'Abgeschlossen',
        failed: 'Fehlgeschlagen',
      },
    },
    research: {
      title: 'Recherche-Hub',
      query: 'Recherchefrage',
      citations: 'Zitate',
      confidence: 'Zuverlässigkeit',
      sources: 'Autoritative Quellen',
    },
    auth: {
      welcome: 'Willkommen bei LegalAI',
      subtitle: 'Enterprise Legal AI Plattform für tesa',
      ssoButton: 'Mit Ihrem Firmenkonto anmelden',
      redirecting: 'Weiterleitung zum Identitätsanbieter...',
      or: 'oder',
      requestAccess: 'Zugang anfordern',
      havingTrouble: 'Haben Sie Probleme?',
      emergencyAccessTitle: 'Notfall-Admin-Zugang',
      emergencyAccessWarning: 'IP-beschränkt. Alle Zugriffe werden protokolliert und geprüft.',
      useEmergencyLogin: 'Notfall-Login verwenden',
      emergencyOnly: 'Nur für Notfälle',
      emergencyMonitored: 'Dieser Login ist IP-beschränkt und wird überwacht.',
      adminEmail: 'Admin-E-Mail',
      password: 'Passwort',
      emergencySignIn: 'Notfall-Anmeldung',
      verifying: 'Überprüfung läuft...',
      backToSSO: '← Zurück zu SSO',
      requestTitle: 'Sie haben keinen Zugang? Fordern Sie ihn bei Ihrem LegalAI-Administrator an.',
      fullName: 'Vollständiger Name',
      companyEmail: 'Firmen-E-Mail',
      department: 'Abteilung',
      selectDepartment: 'Abteilung auswählen',
      deptLegal: 'Recht',
      deptCompliance: 'Compliance',
      deptProcurement: 'Beschaffung',
      deptSales: 'Vertrieb',
      deptOther: 'Sonstiges',
      submitRequest: 'Anfrage absenden',
      submitting: 'Wird gesendet...',
      backToSignIn: '← Zurück zur Anmeldung',
      requestSubmittedTitle: 'Anfrage gesendet',
      requestSubmittedMessage: 'Ihre Zugriffsanfrage wurde an die LegalAI-Administratoren gesendet. Sie erhalten eine E-Mail, sobald Ihre Anfrage geprüft wurde.',
      authorizedOnly: 'Nur für autorisierte Benutzer',
      activityLogged: 'Aktivitäten können protokolliert und geprüft werden',
      privacyPolicy: 'Datenschutzerklärung',
      termsOfUse: 'Nutzungsbedingungen',
      byContinuing: 'Durch Fortfahren stimmen Sie der',
      and: 'und',
      invalidCredentials: 'Ungültige Anmeldedaten. Notfallzugang ist IP-beschränkt und wird protokolliert.',
    },
  },
};

/**
 * Hook to get translations for a specific locale
 */
export function useTranslation(locale: Locale = 'en') {
  return {
    t: translations[locale],
    locale,
  };
}

/**
 * Get a translated value from a nested object path
 * Example: getNestedTranslation(translations.en, 'nav.home') => 'Home'
 */
function getNestedTranslation(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Dynamically translate a key using API if configured
 * Falls back to static translations if API is not available
 */
export async function translateKey(
  key: string,
  targetLocale: Locale,
  sourceLocale: Locale = 'en'
): Promise<string> {
  const staticTranslation = getNestedTranslation(translations[targetLocale], key);

  if (staticTranslation) {
    return staticTranslation;
  }

  if (translationConfig.provider === 'local' || !translationConfig.autoFetch) {
    const fallback = getNestedTranslation(translations[sourceLocale], key);
    return fallback || key;
  }

  const sourceText = getNestedTranslation(translations[sourceLocale], key);
  if (!sourceText) return key;

  try {
    const translated = await translationService.translate(
      sourceText,
      sourceLocale,
      targetLocale,
      { context: 'Legal AI application interface' }
    );
    return translated;
  } catch (error) {
    console.error(`Failed to translate key "${key}":`, error);
    return sourceText;
  }
}

/**
 * Translate a custom text string (not from static translations)
 */
export async function translateText(
  text: string,
  targetLocale: Locale,
  sourceLocale: Locale = 'en',
  context?: string
): Promise<string> {
  if (sourceLocale === targetLocale) return text;

  if (translationConfig.provider === 'local' || !translationConfig.autoFetch) {
    return text;
  }

  try {
    return await translationService.translate(text, sourceLocale, targetLocale, {
      context: context || 'Legal AI application',
      formality: 'formal',
      preserveFormatting: true,
    });
  } catch (error) {
    console.error('Translation failed:', error);
    return text;
  }
}

/**
 * Batch translate multiple keys
 */
export async function translateKeys(
  keys: string[],
  targetLocale: Locale,
  sourceLocale: Locale = 'en'
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  await Promise.all(
    keys.map(async (key) => {
      results[key] = await translateKey(key, targetLocale, sourceLocale);
    })
  );

  return results;
}
