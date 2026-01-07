# OpenAI Integration

Die LegalAI-Anwendung nutzt die OpenAI API (ChatGPT) für alle AI-Funktionalitäten.

## Implementierte Features

### 1. Copilot Chat (Hauptseite)
- **Datei**: `src/pages/Copilot.tsx`
- **Funktionalität**: Vollständige Chat-Integration mit OpenAI
- **Features**:
  - Echtzeit-Chat mit GPT-5-Turbo (Standard)
  - Chat-Verlauf wird in Supabase gespeichert
  - Konversationen werden automatisch erstellt und gespeichert
  - Unterstützung für verschiedene AI-Modelle (wählbar über UI)
  - Vollständiger Chat-Verlauf mit Laden/Löschen von Konversationen

### 2. LiveChat Widget
- **Datei**: `src/components/LiveChatWidget.tsx`
- **Funktionalität**: Pop-up Chat-Widget für Support
- **Features**:
  - Echtzeit-Antworten über OpenAI API
  - Minimier- und Schließen-Funktionen
  - Persistenter Chat-Status im localStorage

### 3. Edge Function
- **Name**: `openai-chat`
- **Datei**: `supabase/functions/openai-chat/index.ts`
- **Funktionalität**: Sichere Server-seitige OpenAI API Integration
- **Features**:
  - JWT-Authentifizierung aktiviert
  - CORS-Header für Frontend-Zugriff
  - System-Prompt für Legal AI Assistant
  - Fehlerbehandlung und Logging
  - Verwendung von `OPENAI_API_KEY` aus Supabase Secrets

## API-Schlüssel

Der OpenAI API-Schlüssel ist als Secret `OPENAI_API_KEY` in Supabase konfiguriert und wird automatisch von der Edge Function verwendet.

## Verwendete AI-Modelle

Die verfügbaren Modelle werden in der Datenbank-Tabelle `ai_models` verwaltet:

- **GPT-5-Turbo** (Standard): `gpt-5-turbo` - Neuestes GPT-5 Modell mit optimierter Performance und 200K Context Window
- **GPT-5**: `gpt-5` - Fortschrittlichstes GPT-5 Flaggschiff-Modell für komplexe Analysen mit 200K Context Window
- **GPT-4o Mini**: `gpt-4o-mini` - Schnell und kosteneffektiv
- **GPT-4**: `gpt-4` - Höchste Qualität
- **GPT-4 Turbo**: `gpt-4-turbo-preview` - Balance zwischen Geschwindigkeit und Qualität
- **GPT-3.5 Turbo**: `gpt-3.5-turbo` - Schnell für einfache Aufgaben

Benutzer können das Modell über das Settings-Symbol im Copilot ändern.

## Datenbank-Schema

### Tabelle: `copilot_conversations`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `title` (text)
- `model_name` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabelle: `copilot_messages`
- `id` (uuid, primary key)
- `conversation_id` (uuid, foreign key)
- `role` (text: 'user' oder 'assistant')
- `content` (text)
- `citations` (jsonb, optional)
- `created_at` (timestamp)

### Tabelle: `ai_models`
- `id` (uuid, primary key)
- `name` (text)
- `display_name` (text)
- `provider` (text)
- `model_id` (text)
- `description` (text)
- `jurisdictions` (text array)
- `regions` (text array)
- `capabilities` (jsonb)
- `context_window` (integer)
- `is_active` (boolean)
- `is_default` (boolean)
- `sort_order` (integer)

## API-Nutzung

### Copilot Chat Request
```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/openai-chat`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Your question here' }
    ],
    model: 'gpt-5-turbo',
    temperature: 0.7,
    max_tokens: 2000
  }),
});

const data = await response.json();
// data.message enthält die AI-Antwort
// data.usage enthält Token-Nutzungsinformationen
```

### Response Format
```json
{
  "message": "AI-generated response text",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 150,
    "total_tokens": 200
  }
}
```

## System-Prompt

Der Standard-System-Prompt für den Legal AI Assistant:

> "You are a helpful legal AI assistant specializing in contract review, drafting, and legal research. Provide clear, professional, and accurate legal information. Always remind users to consult with a qualified attorney for specific legal advice."

## Fehlerbehandlung

Alle AI-Funktionen haben eine robuste Fehlerbehandlung:
- Netzwerkfehler werden abgefangen
- API-Fehler werden dem Benutzer angezeigt
- Fehlgeschlagene Requests werden geloggt
- Fallback-Nachrichten bei Fehler

## Sicherheit

- **JWT-Authentifizierung**: Alle Requests zur Edge Function erfordern einen gültigen JWT-Token
- **API-Schlüssel**: Wird sicher in Supabase Secrets gespeichert, nie im Frontend
- **RLS**: Row Level Security für alle Datenbanktabellen aktiv
- **CORS**: Korrekt konfiguriert für sichere Cross-Origin Requests
