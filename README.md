# Legal AI Application - Tesa Legal Document Redlining Platform

![Tesa Logo](tesa-logo.png)

## Overview

Enterprise-grade Legal Document Redlining Platform with AI-powered contract analysis, collaborative editing, and risk assessment. Built for legal teams to streamline contract review workflows with Azure OpenAI integration.

## Features

- **Document Management**: Upload, version control, and organize legal documents (DOCX/PDF)
- **AI-Powered Redlining**: Two-stage analysis pipeline (Primary Analysis + Verifier) using Azure OpenAI
- **Real-time Collaboration**: ONLYOFFICE Document Server integration for simultaneous editing
- **Risk Dashboard**: Visual risk scoring, findings distribution, and compliance tracking
- **Intelligent Findings**: Severity-based issue detection (High/Medium/Low) with evidence and suggestions
- **User Decisions**: Accept/reject findings with audit trail
- **Multi-language Support**: English and German
- **Role-Based Access Control**: Granular permissions system
- **Dark Mode**: Full theme support

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Context API
- **Icons**: Lucide React
- **UI Components**: Custom components with dark mode support

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Sequelize
- **Authentication**: JWT
- **File Storage**: Azure Blob Storage
- **AI Integration**: Azure OpenAI API (GPT-4)
- **Document Processing**: Mammoth (DOCX), pdf-parse (PDF)

### Infrastructure
- **Document Server**: ONLYOFFICE Document Server (Docker)
- **Container Orchestration**: Docker Compose
- **Deployment**: Azure Container Apps / Azure App Service

## Project Structure

```
LegalAIApplication/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   ├── contexts/                 # React contexts (Auth, Theme, Locale)
│   ├── pages/                    # Page components
│   │   ├── Dashboard.tsx         # Risk visualization dashboard
│   │   ├── Repository.tsx        # Document management
│   │   ├── Review.tsx            # Document review interface
│   │   └── ...
│   ├── lib/                      # Utilities and API client
│   │   ├── apiClient.ts          # Centralized API communication
│   │   └── config.ts             # App configuration
│   └── App.tsx                   # Main app component
│
├── legalai-bolt-dev/
│   ├── backend/
│   │   ├── migrations/           # Database migrations
│   │   │   ├── 006_create_documents_and_versions.sql
│   │   │   ├── 007_create_redline_tables.sql
│   │   │   └── 008_create_editor_sessions.sql
│   │   ├── src/
│   │   │   ├── models/           # Sequelize models
│   │   │   │   ├── Document.ts
│   │   │   │   ├── DocumentVersion.ts
│   │   │   │   ├── RedlineRun.ts
│   │   │   │   ├── Finding.ts
│   │   │   │   └── UserDecision.ts
│   │   │   ├── services/         # Business logic
│   │   │   │   ├── redlineDocumentService.ts
│   │   │   │   ├── azureOpenAIService.ts
│   │   │   │   ├── redlineService.ts  # Core AI pipeline
│   │   │   │   └── editorSessionService.ts
│   │   │   ├── controllers/      # Request handlers
│   │   │   ├── routes/           # API routes
│   │   │   ├── middlewares/      # Auth, error handling
│   │   │   └── app.ts            # Express app setup
│   │   ├── .env.example          # Environment variables template
│   │   └── package.json
│   └── docker-compose.yml        # ONLYOFFICE Docker setup
│
├── IMPLEMENTATION_GUIDE.md       # Detailed setup instructions
├── TRANSLATION_GUIDE.md          # Localization documentation
└── README.md                     # This file
```

## Prerequisites

- **Node.js**: v18 or higher
- **PostgreSQL**: v15 or higher
- **Docker**: For ONLYOFFICE Document Server
- **Azure Account**: For OpenAI and Blob Storage
- **Git**: For version control

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/PhilippPoeschkeTesa/LegalAIApplication.git
cd LegalAIApplication
```

### 2. Backend Configuration

Create `.env` file in `legalai-bolt-dev/backend/`:

```bash
cd legalai-bolt-dev/backend
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=legalai_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_SSL=false

# JWT Authentication
JWT_SECRET=your_random_jwt_secret_min_32_chars

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your_account;AccountKey=your_key;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER=legal-documents

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# ONLYOFFICE Document Server
ONLYOFFICE_URL=http://localhost:8080
ONLYOFFICE_JWT_SECRET=your_random_onlyoffice_secret

# Application URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE legalai_db;

# Run migrations (in order)
cd legalai-bolt-dev/backend
psql -U postgres -d legalai_db -f migrations/001_create_users_table.sql
psql -U postgres -d legalai_db -f migrations/002_create_roles_and_user_roles.sql
psql -U postgres -d legalai_db -f migrations/004_seed_test_users.sql
psql -U postgres -d legalai_db -f migrations/005_create_user_permissions.sql
psql -U postgres -d legalai_db -f migrations/006_create_documents_and_versions.sql
psql -U postgres -d legalai_db -f migrations/007_create_redline_tables.sql
psql -U postgres -d legalai_db -f migrations/008_create_editor_sessions.sql
```

Verify tables:
```sql
\c legalai_db
\dt
-- Should show: users, roles, user_roles, permissions, documents, document_versions,
--              redline_runs, findings, user_decisions, editor_sessions
```

### 4. Backend Installation

```bash
cd legalai-bolt-dev/backend
npm install
npm install mammoth pdf-parse  # Document text extraction
npm run build
npm run dev
```

Verify backend: Navigate to http://localhost:3000 (should see "Tesa Legal Ai Backend is running 🚀")

### 5. ONLYOFFICE Document Server

```bash
cd legalai-bolt-dev
docker-compose up -d
```

Verify ONLYOFFICE:
```bash
docker ps  # Should show onlyoffice-documentserver running on port 8080
docker logs onlyoffice-documentserver  # Check for errors
```

Access ONLYOFFICE: http://localhost:8080

### 6. Frontend Installation

```bash
cd ../../  # Back to root
npm install
npm run dev
```

Access application: http://localhost:5173

## Development

### Running Locally

**Terminal 1 - Backend:**
```bash
cd legalai-bolt-dev/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - ONLYOFFICE:**
```bash
cd legalai-bolt-dev
docker-compose up
```

### Test Users

Default test users (created by migration 004):

- **Admin**: admin@tesalegalai.com / Admin123!
- **Legal Manager**: legal.manager@tesalegalai.com / Manager123!
- **Legal User**: legal.user@tesalegalai.com / User123!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Document Management
- `POST /api/redline-documents/upload` - Upload document (multipart/form-data)
- `GET /api/redline-documents` - List user's documents
- `GET /api/redline-documents/:id` - Get document details
- `GET /api/redline-documents/:id/versions` - Get version history

### Redlining Pipeline
- `POST /api/redline/run` - Start AI analysis
- `GET /api/redline/runs/:runId` - Get run status
- `GET /api/redline/runs/:runId/findings` - Get findings
- `POST /api/redline/findings/:findingId/decision` - Record user decision

### ONLYOFFICE Editor
- `POST /api/editor/session` - Create editor session
- `POST /api/editor/callback` - ONLYOFFICE save callback (no auth)

## AI Pipeline Architecture

### Two-Stage Analysis Process

**Stage 1: Primary Analysis**
- Document text extraction (DOCX/PDF)
- Azure OpenAI GPT-4 analysis with specialized legal prompt
- Identifies risks across severity levels:
  - **High**: Liability caps, IP ownership, unfavorable jurisdiction, indemnification
  - **Medium**: Payment terms, notice periods, warranty limitations, governing law
  - **Low**: Formatting issues, clarity improvements
- Returns structured findings with evidence and suggestions

**Stage 2: Verification**
- Each finding re-analyzed by verifier model
- Validates genuine risk vs false positive
- Confirms severity accuracy
- Sets verification_status: `verified_risky`, `verified_safe`, or `unverified`

**Risk Scoring**
- Weighted average: High=1.0, Medium=0.5, Low=0.2
- Overall score: 0-100
- Displayed in Dashboard as visual gauge

## Azure Deployment Guide

### Option 1: Azure Container Apps (Recommended)

**Prerequisites:**
- Azure CLI installed: `az login`
- Azure Container Registry (ACR)

**1. Create Azure Resources:**

```bash
# Set variables
RESOURCE_GROUP="rg-legalai-prod"
LOCATION="westeurope"
ACR_NAME="acrlegalai"
POSTGRES_SERVER="postgres-legalai"
STORAGE_ACCOUNT="stolegalai"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Container Registry
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic

# Create PostgreSQL
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --location $LOCATION \
  --admin-user legaladmin \
  --admin-password 'YourSecurePassword123!' \
  --sku-name Standard_B1ms \
  --version 15

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $POSTGRES_SERVER \
  --database-name legalai_db

# Create Storage Account
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS
```

**2. Build and Push Docker Images:**

Create `legalai-bolt-dev/backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

Create `Dockerfile` (frontend, root directory):

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Build and push:

```bash
# Login to ACR
az acr login --name $ACR_NAME

# Build backend
cd legalai-bolt-dev/backend
docker build -t $ACR_NAME.azurecr.io/legalai-backend:latest .
docker push $ACR_NAME.azurecr.io/legalai-backend:latest

# Build frontend
cd ../../
docker build -t $ACR_NAME.azurecr.io/legalai-frontend:latest .
docker push $ACR_NAME.azurecr.io/legalai-frontend:latest

# Build ONLYOFFICE (use official image)
docker pull onlyoffice/documentserver:latest
docker tag onlyoffice/documentserver:latest $ACR_NAME.azurecr.io/onlyoffice:latest
docker push $ACR_NAME.azurecr.io/onlyoffice:latest
```

**3. Deploy to Container Apps:**

```bash
# Create Container Apps environment
az containerapp env create \
  --name legalai-env \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Deploy backend
az containerapp create \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --environment legalai-env \
  --image $ACR_NAME.azurecr.io/legalai-backend:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --env-vars \
    DB_HOST=$POSTGRES_SERVER.postgres.database.azure.com \
    DB_NAME=legalai_db \
    DB_USER=legaladmin \
    DB_PASSWORD=YourSecurePassword123! \
    DB_SSL=true \
    JWT_SECRET=your_jwt_secret_min_32_chars \
    AZURE_OPENAI_ENDPOINT=https://your-openai.openai.azure.com \
    AZURE_OPENAI_API_KEY=your_api_key \
    NODE_ENV=production

# Deploy ONLYOFFICE
az containerapp create \
  --name legalai-onlyoffice \
  --resource-group $RESOURCE_GROUP \
  --environment legalai-env \
  --image $ACR_NAME.azurecr.io/onlyoffice:latest \
  --target-port 80 \
  --ingress external \
  --env-vars JWT_ENABLED=true JWT_SECRET=your_onlyoffice_secret

# Deploy frontend
az containerapp create \
  --name legalai-frontend \
  --resource-group $RESOURCE_GROUP \
  --environment legalai-env \
  --image $ACR_NAME.azurecr.io/legalai-frontend:latest \
  --target-port 80 \
  --ingress external
```

**4. Run Migrations:**

```bash
# Get backend URL
BACKEND_URL=$(az containerapp show \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

# Connect to PostgreSQL and run migrations
psql "host=$POSTGRES_SERVER.postgres.database.azure.com port=5432 dbname=legalai_db user=legaladmin password=YourSecurePassword123! sslmode=require"

# Then run each migration file...
```

### Option 2: Azure App Service

**Deploy Backend:**

```bash
az webapp up \
  --name legalai-backend-app \
  --resource-group $RESOURCE_GROUP \
  --runtime "NODE:18-lts" \
  --location $LOCATION
```

**Deploy Frontend:**

```bash
az staticwebapp create \
  --name legalai-frontend \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

## Environment Variables for Production

```env
# Production .env
NODE_ENV=production
DB_SSL=true
DB_HOST=your-postgres-server.postgres.database.azure.com
AZURE_STORAGE_CONNECTION_STRING=<from Azure Portal>
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=<from Azure Portal>
BACKEND_URL=https://your-backend.azurecontainerapps.io
FRONTEND_URL=https://your-frontend.azurecontainerapps.io
ONLYOFFICE_URL=https://your-onlyoffice.azurecontainerapps.io
```

## Security Best Practices

- **Secrets Management**: Use Azure Key Vault for production secrets
- **SSL/TLS**: Enable HTTPS for all endpoints
- **CORS**: Configure allowed origins in production
- **Database**: Enable SSL connections, use strong passwords
- **ONLYOFFICE**: Always enable JWT authentication
- **File Upload**: Validate file types and sizes
- **API Rate Limiting**: Implement rate limiting middleware
- **JWT**: Use strong secrets (min 32 chars), set appropriate expiration

## Monitoring and Logging

**Azure Application Insights Integration:**

```bash
npm install applicationinsights
```

Add to backend `src/app.ts`:

```typescript
import * as appInsights from 'applicationinsights';

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .start();
}
```

## Troubleshooting

### Common Issues

**Database Connection Fails:**
- Check `DB_HOST`, `DB_PORT`, `DB_NAME` in `.env`
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT version();"`
- Check firewall rules for Azure PostgreSQL

**ONLYOFFICE Not Accessible:**
```bash
docker-compose down
docker-compose up -d
docker logs onlyoffice-documentserver
```

**Azure OpenAI Errors:**
- Verify `AZURE_OPENAI_ENDPOINT` and `AZURE_OPENAI_API_KEY`
- Check deployment name matches your Azure OpenAI resource
- Verify quota limits in Azure Portal

**File Upload Fails:**
- Check Azure Storage connection string
- Verify container exists: `legal-documents`
- Check blob permissions

## Performance Optimization

- **Database**: Add indexes on frequently queried columns
- **Caching**: Implement Redis for session storage
- **CDN**: Use Azure CDN for static assets
- **Background Jobs**: Use Bull/Redis for async redlining tasks
- **Database Pooling**: Configure Sequelize connection pool
- **Compression**: Enable gzip compression in Express

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Testing

```bash
# Backend tests
cd legalai-bolt-dev/backend
npm test

# Frontend tests
cd ../../
npm test

# E2E tests
npm run test:e2e
```

## License

Proprietary - Tesa SE

## Support

For technical issues or questions:
- **Email**: support@tesalegalai.com
- **Documentation**: [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- **Issues**: GitHub Issues

## Roadmap

- [ ] PDF Report Generation
- [ ] Advanced Analytics Dashboard
- [ ] Microsoft Entra ID (Azure AD) SSO
- [ ] Bulk Document Processing
- [ ] Custom Playbook Management UI
- [ ] Compliance Templates Library
- [ ] E-Signature Integration
- [ ] Mobile App (React Native)

## Acknowledgments

- Azure OpenAI for AI capabilities
- ONLYOFFICE for document editing
- React and TypeScript communities

---

**Version**: 1.0.0
**Last Updated**: 2026-01-08
**Maintained by**: Tesa Legal AI Team
