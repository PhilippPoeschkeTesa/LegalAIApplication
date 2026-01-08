#!/bin/bash

# Legal AI Application - Azure Deployment Script
# This script automates the deployment of the Legal AI Application to Azure Container Apps

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Legal AI Application - Azure Deployment${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
command -v az >/dev/null 2>&1 || { echo -e "${RED}Azure CLI is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo -e "${RED}PostgreSQL client (psql) is required but not installed. Aborting.${NC}" >&2; exit 1; }

echo -e "${GREEN}✓ All prerequisites met${NC}\n"

# Configuration
read -p "Enter Azure Resource Group name (default: rg-legalai-prod): " RESOURCE_GROUP
RESOURCE_GROUP=${RESOURCE_GROUP:-rg-legalai-prod}

read -p "Enter Azure Location (default: westeurope): " LOCATION
LOCATION=${LOCATION:-westeurope}

# Generate unique names
RANDOM_SUFFIX=$(openssl rand -hex 4)
ACR_NAME="acrlegalai${RANDOM_SUFFIX}"
POSTGRES_SERVER="postgres-legalai-${RANDOM_SUFFIX}"
STORAGE_ACCOUNT="stolegalai${RANDOM_SUFFIX}"
CONTAINER_ENV="env-legalai"

# Generate secrets
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
ONLYOFFICE_JWT_SECRET=$(openssl rand -base64 32)

# Azure OpenAI configuration
echo -e "\n${YELLOW}Azure OpenAI Configuration:${NC}"
read -p "Enter Azure OpenAI Endpoint (e.g., https://your-resource.openai.azure.com): " AZURE_OPENAI_ENDPOINT
read -p "Enter Azure OpenAI API Key: " AZURE_OPENAI_API_KEY
read -p "Enter Deployment Name (default: gpt-4): " AZURE_OPENAI_DEPLOYMENT
AZURE_OPENAI_DEPLOYMENT=${AZURE_OPENAI_DEPLOYMENT:-gpt-4}

echo -e "\n${BLUE}Configuration Summary:${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "Container Registry: $ACR_NAME"
echo "PostgreSQL Server: $POSTGRES_SERVER"
echo "Storage Account: $STORAGE_ACCOUNT"
echo ""

read -p "Proceed with deployment? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 0
fi

# Login to Azure
echo -e "\n${YELLOW}Logging into Azure...${NC}"
az login

# Create Resource Group
echo -e "\n${YELLOW}Creating Resource Group...${NC}"
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --output none

echo -e "${GREEN}✓ Resource Group created${NC}"

# Create Container Registry
echo -e "\n${YELLOW}Creating Container Registry...${NC}"
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true \
  --output none

ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

echo -e "${GREEN}✓ Container Registry created${NC}"

# Create PostgreSQL Server
echo -e "\n${YELLOW}Creating PostgreSQL Flexible Server (this may take a few minutes)...${NC}"
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
  --public-access 0.0.0.0 \
  --output none

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $POSTGRES_SERVER \
  --database-name legalai_db \
  --output none

echo -e "${GREEN}✓ PostgreSQL Server created${NC}"

# Create Storage Account
echo -e "\n${YELLOW}Creating Storage Account...${NC}"
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --allow-blob-public-access false \
  --output none

STORAGE_KEY=$(az storage account keys list \
  --resource-group $RESOURCE_GROUP \
  --account-name $STORAGE_ACCOUNT \
  --query '[0].value' -o tsv)

az storage container create \
  --name legal-documents \
  --account-name $STORAGE_ACCOUNT \
  --account-key $STORAGE_KEY \
  --output none

STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
  --resource-group $RESOURCE_GROUP \
  --name $STORAGE_ACCOUNT \
  --query connectionString -o tsv)

echo -e "${GREEN}✓ Storage Account created${NC}"

# Run Database Migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
MY_IP=$(curl -s https://api.ipify.org)
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --rule-name AllowDeploymentIP \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP \
  --output none

export PGHOST="$POSTGRES_SERVER.postgres.database.azure.com"
export PGDATABASE="legalai_db"
export PGUSER="legaladmin"
export PGPASSWORD="$DB_PASSWORD"
export PGSSLMODE="require"

for migration in legalai-bolt-dev/backend/migrations/*.sql; do
    echo "Running $(basename $migration)..."
    psql -f "$migration" -q
done

echo -e "${GREEN}✓ Database migrations completed${NC}"

# Build and Push Docker Images
echo -e "\n${YELLOW}Building and pushing Docker images...${NC}"
az acr login --name $ACR_NAME

echo "Building backend..."
cd legalai-bolt-dev/backend
docker build -t $ACR_NAME.azurecr.io/legalai-backend:latest . --quiet
docker push $ACR_NAME.azurecr.io/legalai-backend:latest --quiet

echo "Building frontend..."
cd ../../
docker build --build-arg VITE_API_BASE_URL=/api -t $ACR_NAME.azurecr.io/legalai-frontend:latest . --quiet
docker push $ACR_NAME.azurecr.io/legalai-frontend:latest --quiet

echo "Pulling ONLYOFFICE..."
docker pull onlyoffice/documentserver:latest --quiet
docker tag onlyoffice/documentserver:latest $ACR_NAME.azurecr.io/legalai-onlyoffice:latest
docker push $ACR_NAME.azurecr.io/legalai-onlyoffice:latest --quiet

echo -e "${GREEN}✓ Docker images pushed to registry${NC}"

# Create Container Apps Environment
echo -e "\n${YELLOW}Creating Container Apps Environment...${NC}"
az containerapp env create \
  --name $CONTAINER_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --output none

echo -e "${GREEN}✓ Container Apps Environment created${NC}"

# Deploy Backend
echo -e "\n${YELLOW}Deploying Backend Container App...${NC}"
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
    AZURE_OPENAI_DEPLOYMENT_NAME=$AZURE_OPENAI_DEPLOYMENT \
    AZURE_OPENAI_API_VERSION=2024-02-15-preview \
    ONLYOFFICE_JWT_SECRET=secretref:onlyoffice-jwt \
  --output none

BACKEND_URL=$(az containerapp show \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo -e "${GREEN}✓ Backend deployed at: https://$BACKEND_URL${NC}"

# Deploy ONLYOFFICE
echo -e "\n${YELLOW}Deploying ONLYOFFICE Container App...${NC}"
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
    JWT_HEADER=Authorization \
  --output none

ONLYOFFICE_URL=$(az containerapp show \
  --name legalai-onlyoffice \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo -e "${GREEN}✓ ONLYOFFICE deployed at: https://$ONLYOFFICE_URL${NC}"

# Update backend with ONLYOFFICE URL
az containerapp update \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    ONLYOFFICE_URL=https://$ONLYOFFICE_URL \
    BACKEND_URL=https://$BACKEND_URL \
  --output none

# Deploy Frontend
echo -e "\n${YELLOW}Deploying Frontend Container App...${NC}"
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
  --registry-password $ACR_PASSWORD \
  --output none

FRONTEND_URL=$(az containerapp show \
  --name legalai-frontend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo -e "${GREEN}✓ Frontend deployed at: https://$FRONTEND_URL${NC}"

# Update backend with frontend URL for CORS
az containerapp update \
  --name legalai-backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars FRONTEND_URL=https://$FRONTEND_URL \
  --output none

# Save deployment info
echo -e "\n${YELLOW}Saving deployment information...${NC}"
cat > deployment-info.txt <<EOF
Legal AI Application - Deployment Information
Generated: $(date)

Resource Group: $RESOURCE_GROUP
Location: $LOCATION

Application URLs:
- Frontend: https://$FRONTEND_URL
- Backend API: https://$BACKEND_URL
- ONLYOFFICE: https://$ONLYOFFICE_URL

Azure Resources:
- Container Registry: $ACR_NAME
- PostgreSQL Server: $POSTGRES_SERVER
- Storage Account: $STORAGE_ACCOUNT

Test Users (from migrations):
- Admin: admin@tesalegalai.com / Admin123!
- Legal Manager: legal.manager@tesalegalai.com / Manager123!
- Legal User: legal.user@tesalegalai.com / User123!

Database Credentials:
- Host: $POSTGRES_SERVER.postgres.database.azure.com
- Database: legalai_db
- User: legaladmin
- Password: $DB_PASSWORD

Important: Keep this file secure and do not commit it to version control!
EOF

echo -e "${GREEN}✓ Deployment info saved to deployment-info.txt${NC}"

# Deployment summary
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}         DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}================================================${NC}\n"

echo -e "${BLUE}Application URLs:${NC}"
echo -e "  Frontend:  ${GREEN}https://$FRONTEND_URL${NC}"
echo -e "  Backend:   ${GREEN}https://$BACKEND_URL${NC}"
echo -e "  ONLYOFFICE: ${GREEN}https://$ONLYOFFICE_URL${NC}"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Visit the frontend URL to access the application"
echo "2. Login with test user: admin@tesalegalai.com / Admin123!"
echo "3. Configure custom domain (optional, see DEPLOYMENT.md)"
echo "4. Set up monitoring and alerts"
echo "5. Review deployment-info.txt for all credentials"

echo -e "\n${YELLOW}Useful Commands:${NC}"
echo "  View logs:    az containerapp logs show --name legalai-backend --resource-group $RESOURCE_GROUP --follow"
echo "  View status:  az containerapp list --resource-group $RESOURCE_GROUP --output table"
echo "  Delete all:   az group delete --name $RESOURCE_GROUP --yes"

echo -e "\n${BLUE}For detailed documentation, see DEPLOYMENT.md${NC}\n"
