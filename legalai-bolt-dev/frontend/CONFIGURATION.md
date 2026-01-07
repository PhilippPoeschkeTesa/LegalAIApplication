# Global Configuration Guide

This application uses a centralized configuration system to manage all constants, endpoints, routes, and configuration values.

## Location

All global configuration is defined in `/src/lib/config.ts`

## Configuration Categories

### 1. Supabase Configuration

```typescript
import { supabaseConfig } from '../lib/config';

// Access Supabase credentials
const url = supabaseConfig.url;
const key = supabaseConfig.anonKey;
```

### 2. API Endpoints

```typescript
import { apiEndpoints, buildApiUrl } from '../lib/config';

// Use predefined endpoints
const response = await fetch(apiEndpoints.seedDemoData);

// Build custom endpoint URL
const url = buildApiUrl('my-function');
```

### 3. Application Routes

**Never hardcode routes!** Always use `appRoutes`:

```typescript
import { appRoutes } from '../lib/config';
import { Link } from 'react-router-dom';

// In components
<Link to={appRoutes.copilot}>Go to Copilot</Link>

// In navigation
<Route path={appRoutes.home} element={<Home />} />

// In redirects
<Navigate to={appRoutes.auth} />
```

**Available Routes:**
- `appRoutes.home` - `/`
- `appRoutes.auth` - `/auth`
- `appRoutes.copilot` - `/copilot`
- `appRoutes.review` - `/review`
- `appRoutes.draft` - `/draft`
- `appRoutes.repository` - `/repository`
- `appRoutes.intake` - `/intake`
- `appRoutes.search` - `/search`
- `appRoutes.clauses` - `/clauses`
- `appRoutes.playbooks` - `/playbooks`
- `appRoutes.workflows` - `/workflows`
- `appRoutes.analytics` - `/analytics`
- `appRoutes.partners` - `/partners`
- `appRoutes.discovery` - `/discovery`
- `appRoutes.research` - `/research`
- `appRoutes.admin` - `/admin`
- `appRoutes.settings` - `/settings`
- `appRoutes.help` - `/help`
- `appRoutes.legal` - `/legal`

### 4. Database Tables

```typescript
import { dbTables } from '../lib/config';

// Query tables
const { data } = await supabase
  .from(dbTables.contracts)
  .select('*');
```

**Available Tables:**
- `dbTables.contracts`
- `dbTables.clauses`
- `dbTables.templates`
- `dbTables.playbooks`
- `dbTables.userProfiles`
- `dbTables.accessRequests`
- `dbTables.reviews`
- `dbTables.reviewIssues`
- `dbTables.workflows`
- `dbTables.workflowSteps`
- `dbTables.analytics`
- `dbTables.auditLogs`
- `dbTables.partners`
- `dbTables.integrations`

### 5. AI Models

```typescript
import { aiModels } from '../lib/config';

// Display model name
<span>{aiModels.default.name}</span> // "GPT-4"
<span>{aiModels.turbo.name}</span>   // "GPT-4-Turbo"
<span>{aiModels.embedding.name}</span> // "text-embedding-3-large"
```

### 6. Jurisdictions

```typescript
import { jurisdictions } from '../lib/config';

// Use jurisdiction data
<span>{jurisdictions.dach.code}</span>      // "DACH"
<span>{jurisdictions.dach.fullName}</span>  // "Germany, Austria, Switzerland"
<span>{jurisdictions.eu.name}</span>        // "European Union"
```

### 7. Contract Types

```typescript
import { contractTypes } from '../lib/config';

// Access contract type info
const ndaName = contractTypes.nda.name;           // "Non-Disclosure Agreement"
const msaCategory = contractTypes.msa.category;   // "service"
```

### 8. Issue Severity

```typescript
import { issueSeverity } from '../lib/config';

// Get severity info
const highPriority = issueSeverity.high.priority; // 1
const mediumColor = issueSeverity.medium.color;   // "orange"
```

### 9. Workflow Statuses

```typescript
import { workflowStatus } from '../lib/config';

// Display status
<span>{workflowStatus.inProgress.displayName}</span> // "In Progress"
<span className={`text-${workflowStatus.approved.color}-600`}>
  {workflowStatus.approved.displayName}
</span>
```

### 10. User Roles

```typescript
import { userRoles } from '../lib/config';

// Check role
const isAdmin = user.role === userRoles.admin.role;
const permissions = userRoles.legalCounsel.permissions;
```

### 11. Mock Data

```typescript
import { mockData } from '../lib/config';

// Use mock data for demos
const user = mockData.demoUser;
console.log(user.email); // "demo@tesa.com"
console.log(user.name);  // "Demo User"

const playbook = mockData.defaultPlaybook;
console.log(playbook.name); // "Standard NDA Review"

const docs = mockData.sampleDocuments;
// ["NDA_EN_2024_v3.docx", "MSA_Template_2024.docx", ...]
```

### 12. Helper Functions

```typescript
import {
  getApiHeaders,
  buildApiUrl,
  isFeatureEnabled,
  getContractTypeName,
  getJurisdictionName
} from '../lib/config';

// Get API headers
const headers = getApiHeaders(); // Includes auth

// Build API URL
const url = buildApiUrl('my-function');

// Check feature flags
if (isFeatureEnabled('enableAnalytics')) {
  // Show analytics
}

// Get display names
const typeName = getContractTypeName('NDA');       // "Non-Disclosure Agreement"
const jurisdictionName = getJurisdictionName('DACH'); // "Germany, Austria, Switzerland"
```

## Best Practices

### ✅ DO:
- Always import from `../lib/config`
- Use descriptive constant names from config
- Add new constants to config file
- Use helper functions when available

### ❌ DON'T:
- Hardcode routes like `"/copilot"`
- Hardcode API endpoints
- Hardcode table names
- Hardcode mock data values
- Duplicate configuration values

## Adding New Configuration

To add new configuration values:

1. Open `/src/lib/config.ts`
2. Add your constants to the appropriate section
3. Export them using `as const` for type safety
4. Document the new values in this file
5. Use them throughout the application

Example:

```typescript
// In config.ts
export const myNewConfig = {
  setting1: 'value1',
  setting2: 'value2',
} as const;

// In your component
import { myNewConfig } from '../lib/config';

const value = myNewConfig.setting1;
```

## Type Safety

All configuration values are strongly typed using TypeScript's `as const` assertion, providing:
- Autocomplete in your IDE
- Compile-time error checking
- Prevents typos and mistakes
- Better refactoring support

## Benefits

1. **Single Source of Truth** - All configuration in one place
2. **Easy Maintenance** - Change once, updates everywhere
3. **Type Safety** - TypeScript catches errors at compile time
4. **Discoverability** - Easy to find what values are available
5. **Consistency** - No duplicate or conflicting values
6. **Refactoring** - Rename routes/endpoints easily
7. **Documentation** - Self-documenting code

## Migration Guide

When you find hardcoded values:

**Before:**
```typescript
<Link to="/copilot">Copilot</Link>
const user = { email: 'demo@tesa.com', name: 'Demo User' };
```

**After:**
```typescript
import { appRoutes, mockData } from '../lib/config';

<Link to={appRoutes.copilot}>Copilot</Link>
const user = mockData.demoUser;
```

## Environment Variables

Environment variables are accessed through the config file:

```typescript
// Automatically loaded from .env
supabaseConfig.url    // from VITE_SUPABASE_URL
supabaseConfig.anonKey // from VITE_SUPABASE_ANON_KEY
```

Never access `import.meta.env` directly in components. Always go through the config file.
