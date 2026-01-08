# Azure Deployment Guide - Legal AI Application

Complete step-by-step guide for deploying the Legal AI Application to Azure Container Apps.

## Prerequisites

- Azure CLI installed: `az --version`
- Docker installed: `docker --version`
- Access to Azure subscription with Contributor role
- Azure OpenAI resource already created
- Domain name (optional, for custom domain)

## Quick Start Deployment

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Run deployment script
chmod +x deploy-to-azure.sh
./deploy-to-azure.sh
```

## Manual Deployment Steps

### 1. Set Environment Variables

```bash
# Configuration
export RESOURCE_GROUP="rg-legalai-prod"
export LOCATION="westeurope"
export ACR_NAME="acrlegalai$(openssl rand -hex 4)"  # Must be globally unique
export POSTGRES_SERVER="postgres-legalai-$(openssl rand -hex 4)"
export STORAGE_ACCOUNT="stolegalai$(openssl rand -hex 4)"
export CONTAINER_ENV="env-legalai"

# Secrets (generate secure values)
export DB_PASSWORD="$(openssl rand -base64 32)"
export JWT_SECRET="$(openssl rand -base64 32)"
export ONLYOFFICE_JWT_SECRET="$(openssl rand -base64 32)"
```

### 2. Create Azure Resources

```bash
# Create Resource Group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create Container Registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --location $LOCATION \
  --admin-user legaladmin \
  --admin-password "$DB_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15 \
  --storage-size 32 \
  --public-access 0.0.0.0

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
  --sku Standard_LRS \
  --allow-blob-public-access false

# Create Blob Container
STORAGE_KEY=$(az storage account keys list \
  --resource-group $RESOURCE_GROUP \
  --account-name $STORAGE_ACCOUNT \
  --query '[0].value' -o tsv)

az storage container create \
  --name legal-documents \
  --account-name $STORAGE_ACCOUNT \
  --account-key $STORAGE_KEY

# Get Storage Connection String
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
  --resource-group $RESOURCE_GROUP \
  --name $STORAGE_ACCOUNT \
  --query connectionString -o tsv)
```

### 3. Run Database Migrations

```bash
# Allow your IP for PostgreSQL access
MY_IP=$(curl -s https://api.ipify.org)
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --rule-name AllowMyIP \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP

# Connect and run migrations
export PGHOST="$POSTGRES_SERVER.postgres.database.azure.com"
export PGDATABASE="legalai_db"
export PGUSER="legaladmin"
export PGPASSWORD="$DB_PASSWORD"
export PGSSLMODE="require"

# Run migrations in order
psql -f legalai-bolt-dev/backend/migrations/001_create_users_table.sql
psql -f legalai-bolt-dev/backend/migrations/002_create_roles_and_user_roles.sql
psql -f legalai-bolt-dev/backend/migrations/004_seed_test_users.sql
psql -f legalai-bolt-dev/backend/migrations/005_create_user_permissions.sql
psql -f legalai-bolt-dev/backend/migrations/006_create_documents_and_versions.sql
psql -f legalai-bolt-dev/backend/migrations/007_create_redline_tables.sql
psql -f legalai-bolt-dev/backend/migrations/008_create_editor_sessions.sql

# Verify tables
psql -c "\dt"
```

### 4. Build and Push Docker Images

```bash
# Login to ACR
az acr login --name $ACR_NAME

# Build and push backend
cd legalai-bolt-dev/backend
docker build -t $ACR_NAME.azurecr.io/legalai-backend:latest .
docker push $ACR_NAME.azurecr.io/legalai-backend:latest

# Build and push frontend
cd ../../
docker build --build-arg VITE_API_BASE_URL=/api -t $ACR_NAME.azurecr.io/legalai-frontend:latest .
docker push $ACR_NAME.azurecr.io/legalai-frontend:latest

# Pull and push ONLYOFFICE
docker pull onlyoffice/documentserver:latest
docker tag onlyoffice/documentserver:latest $ACR_NAME.azurecr.io/legalai-onlyoffice:latest
docker push $ACR_NAME.azurecr.io/legalai-onlyoffice:latest
```

### 5. Create Container Apps Environment

```bash
az containerapp env create \
  --name $CONTAINER_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

### 6. Deploy Backend Container App

```bash
az containerapp create \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_ENV \
  --image $ACR_NAME.azurecr.io/legalai-backend:latest \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --secrets \
    db-password=$DB_PASSWORD \
    jwt-secret=$JWT_SECRET \
    storage-connection=$STORAGE_CONNECTION_STRING \
    openai-key=$AZURE_OPENAI_API_KEY \
    onlyoffice-jwt=$ONLYOFFICE_JWT_SECRET \
  --env-vars \
    NODE_ENV=production \
    PORT=3000 \
    DB_HOST=$POSTGRES_SERVER.postgres.database.azure.com \
    DB_PORT=5432 \
    DB_NAME=legalai_db \
    DB_USER=legaladmin \
    DB_PASSWORD=secretref:db-password \
    DB_SSL=true \
    JWT_SECRET=secretref:jwt-secret \
    AZURE_STORAGE_CONNECTION_STRING=secretref:storage-connection \
    AZURE_STORAGE_CONTAINER=legal-documents \
    AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT \
    AZURE_OPENAI_API_KEY=secretref:openai-key \
    AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4 \
    AZURE_OPENAI_API_VERSION=2024-02-15-preview \
    ONLYOFFICE_JWT_SECRET=secretref:onlyoffice-jwt

# Get backend URL
BACKEND_URL=$(az containerapp show \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "Backend URL: https://$BACKEND_URL"
```

### 7. Deploy ONLYOFFICE Container App

```bash
az containerapp create \
  --name legalai-onlyoffice \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_ENV \
  --image $ACR_NAME.azurecr.io/legalai-onlyoffice:latest \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 2 \
  --cpu 1.0 \
  --memory 2.0Gi \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --secrets onlyoffice-jwt=$ONLYOFFICE_JWT_SECRET \
  --env-vars \
    JWT_ENABLED=true \
    JWT_SECRET=secretref:onlyoffice-jwt \
    JWT_HEADER=Authorization

# Get ONLYOFFICE URL
ONLYOFFICE_URL=$(az containerapp show \
  --name legalai-onlyoffice \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "ONLYOFFICE URL: https://$ONLYOFFICE_URL"
```

### 8. Update Backend with ONLYOFFICE URL

```bash
az containerapp update \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    ONLYOFFICE_URL=https://$ONLYOFFICE_URL \
    BACKEND_URL=https://$BACKEND_URL
```

### 9. Deploy Frontend Container App

```bash
az containerapp create \
  --name legalai-frontend \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_ENV \
  --image $ACR_NAME.azurecr.io/legalai-frontend:latest \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD

# Get frontend URL
FRONTEND_URL=$(az containerapp show \
  --name legalai-frontend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "Frontend URL: https://$FRONTEND_URL"

# Update backend with frontend URL for CORS
az containerapp update \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars FRONTEND_URL=https://$FRONTEND_URL
```

### 10. Verify Deployment

```bash
# Check backend health
curl https://$BACKEND_URL

# Check all container apps status
az containerapp list \
  --resource-group $RESOURCE_GROUP \
  --output table

# View logs
az containerapp logs show \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --follow
```

## Post-Deployment Configuration

### Configure Custom Domain (Optional)

```bash
# Add custom domain to frontend
az containerapp hostname add \
  --hostname your-domain.com \
  --resource-group $RESOURCE_GROUP \
  --name legalai-frontend

# Bind certificate
az containerapp hostname bind \
  --hostname your-domain.com \
  --resource-group $RESOURCE_GROUP \
  --name legalai-frontend \
  --environment $CONTAINER_ENV \
  --validation-method CNAME
```

### Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app legalai-insights \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP

# Get instrumentation key
INSIGHTS_KEY=$(az monitor app-insights component show \
  --app legalai-insights \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

# Update backend with insights key
az containerapp update \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=$INSIGHTS_KEY"
```

### Configure Autoscaling

```bash
# Configure CPU-based autoscaling
az containerapp update \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --min-replicas 2 \
  --max-replicas 10 \
  --scale-rule-name cpu-scale \
  --scale-rule-type cpu \
  --scale-rule-metadata "type=Utilization" "value=75"
```

## Monitoring and Maintenance

### View Logs

```bash
# Stream logs
az containerapp logs show \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --follow

# View logs from specific time
az containerapp logs show \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --since 1h
```

### Update Application

```bash
# Build new version
docker build -t $ACR_NAME.azurecr.io/legalai-backend:v1.1.0 .
docker push $ACR_NAME.azurecr.io/legalai-backend:v1.1.0

# Update container app
az containerapp update \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_NAME.azurecr.io/legalai-backend:v1.1.0
```

### Backup Database

```bash
# Automated backups are enabled by default
# To create manual backup:
az postgres flexible-server backup create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --backup-name manual-backup-$(date +%Y%m%d)
```

## Cost Optimization

### Estimated Monthly Costs (EUR)

- Container Apps: ~€50-150 (depending on scale)
- PostgreSQL Flexible Server (B1ms): ~€15
- Azure Storage (32GB): ~€1
- Container Registry (Basic): ~€4
- Azure OpenAI: Pay-per-use (varies)
- **Total Estimated: €70-170/month**

### Cost Saving Tips

```bash
# Scale down during off-hours
az containerapp update \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --min-replicas 0  # Scale to zero when idle

# Use cheaper PostgreSQL tier for dev
az postgres flexible-server update \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --sku-name Standard_B1ms  # Burstable tier
```

## Security Checklist

- [ ] Enable Azure Key Vault for secrets management
- [ ] Configure Private Endpoints for database
- [ ] Enable Microsoft Defender for Cloud
- [ ] Set up Azure AD authentication
- [ ] Configure network security groups
- [ ] Enable HTTPS only
- [ ] Implement rate limiting
- [ ] Regular security patches
- [ ] Enable audit logging
- [ ] Backup encryption

## Troubleshooting

### Container App Won't Start

```bash
# Check revision status
az containerapp revision list \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --output table

# View provisioning errors
az containerapp show \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --query properties.latestRevisionStatus
```

### Database Connection Issues

```bash
# Test connection from Cloud Shell
psql "host=$POSTGRES_SERVER.postgres.database.azure.com port=5432 dbname=legalai_db user=legaladmin sslmode=require"

# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER
```

### High Memory Usage

```bash
# Check metrics
az monitor metrics list \
  --resource /subscriptions/YOUR_SUB/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.App/containerApps/legalai-backend \
  --metric MemoryUsagePercentage \
  --start-time 2024-01-01T00:00:00Z

# Increase memory allocation
az containerapp update \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --memory 2.0Gi
```

## Rollback Procedure

```bash
# List revisions
az containerapp revision list \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP

# Activate previous revision
az containerapp revision activate \
  --revision legalai-backend--<revision-name> \
  --resource-group $RESOURCE_GROUP
```

## Cleanup (Delete Everything)

```bash
# WARNING: This will delete all resources!
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

## Support

For deployment issues:
- Check logs: `az containerapp logs show`
- Review Azure Portal: https://portal.azure.com
- Contact: devops@tesalegalai.com

## Additional Resources

- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [PostgreSQL Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/)
- [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/)

---

**Last Updated**: 2026-01-08
**Maintained by**: Tesa DevOps Team
