# Quick Start Guide für DevOps Team

## Für sofortiges Azure-Deployment

### Option 1: Automatisches Deployment (Empfohlen)

```bash
# Repository klonen
git clone https://github.com/PhilippPoeschkeTesa/LegalAIApplication.git
cd LegalAIApplication

# Deployment-Script ausführen
./deploy-to-azure.sh
```

Das Script führt automatisch alle Schritte aus:
- Erstellt alle Azure-Ressourcen (Container Registry, PostgreSQL, Storage, Container Apps)
- Führt Datenbank-Migrationen aus
- Baut und deployed alle Container (Backend, Frontend, ONLYOFFICE)
- Konfiguriert alle Environment-Variablen
- Gibt am Ende alle URLs und Zugangsdaten aus

**Dauer: ca. 15-20 Minuten**

### Option 2: Manuelle Schritte

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für detaillierte manuelle Anleitung.

## Voraussetzungen

- Azure CLI installiert: `az --version`
- Docker installiert: `docker --version`
- PostgreSQL Client: `psql --version`
- Azure Subscription mit Contributor-Rechten
- Azure OpenAI Resource bereits erstellt

## Was Sie bereit haben müssen

1. **Azure OpenAI Credentials**
   - Endpoint URL (z.B. `https://your-resource.openai.azure.com`)
   - API Key
   - Deployment Name (z.B. `gpt-4`)

2. **Azure Subscription**
   - Subscription ID
   - Genug Quota für Container Apps, PostgreSQL

## Architektur-Übersicht

```
┌─────────────────────────────────────────────────┐
│         Azure Container Apps Environment        │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │   Frontend   │  │   Backend    │           │
│  │   (React)    │  │  (Node.js)   │           │
│  │   Port 80    │  │  Port 3000   │           │
│  └──────────────┘  └──────────────┘           │
│                           │                     │
│                           │                     │
│  ┌──────────────┐        │                     │
│  │ ONLYOFFICE   │        │                     │
│  │  Document    │◄───────┘                     │
│  │   Server     │                              │
│  │   Port 80    │                              │
│  └──────────────┘                              │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼────────┐  ┌────────▼───────┐
│   PostgreSQL   │  │  Blob Storage  │
│  Flexible      │  │   (Documents)  │
│   Server       │  │                │
└────────────────┘  └────────────────┘
        │
┌───────▼────────┐
│  Azure OpenAI  │
│   (GPT-4)      │
└────────────────┘
```

## Services

| Service | Zweck | Tech Stack |
|---------|-------|------------|
| **Frontend** | React SPA | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | REST API | Node.js, Express, TypeScript, Sequelize |
| **ONLYOFFICE** | Document Editor | ONLYOFFICE Document Server |
| **PostgreSQL** | Database | PostgreSQL 15 Flexible Server |
| **Blob Storage** | File Storage | Azure Blob Storage |
| **Azure OpenAI** | AI Analysis | GPT-4 for redlining |

## Nach dem Deployment

### 1. URLs notieren

Das Deployment-Script erstellt `deployment-info.txt` mit:
- Frontend URL
- Backend API URL
- ONLYOFFICE URL
- Datenbank-Credentials
- Test-User-Zugangsdaten

### 2. Erste Schritte testen

```bash
# Backend Health Check
curl https://your-backend-url.azurecontainerapps.io

# Frontend öffnen
open https://your-frontend-url.azurecontainerapps.io

# Login mit Test-User
# Email: admin@tesalegalai.com
# Password: Admin123!
```

### 3. Monitoring einrichten (Optional)

```bash
# Application Insights erstellen
az monitor app-insights component create \
  --app legalai-insights \
  --location westeurope \
  --resource-group rg-legalai-prod

# Instrumentation Key abrufen und im Backend konfigurieren
```

### 4. Custom Domain (Optional)

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) Abschnitt "Configure Custom Domain"

## Wichtige Befehle

```bash
# Logs ansehen
az containerapp logs show --name legalai-backend --resource-group rg-legalai-prod --follow

# Status aller Services
az containerapp list --resource-group rg-legalai-prod --output table

# Service neu starten
az containerapp revision restart --name legalai-backend --resource-group rg-legalai-prod

# Secrets aktualisieren
az containerapp secret set --name legalai-backend --resource-group rg-legalai-prod --secrets openai-key=new_key

# Autoscaling konfigurieren
az containerapp update --name legalai-backend --resource-group rg-legalai-prod --min-replicas 2 --max-replicas 10
```

## Kosten

Geschätzte monatliche Kosten (EUR):
- Container Apps: €50-150
- PostgreSQL Flexible Server: €15
- Blob Storage: €1
- Container Registry: €4
- Azure OpenAI: Pay-per-use (variiert)

**Total: ca. €70-170/Monat**

## Support & Dokumentation

- **Vollständige Setup-Anleitung**: [README.md](README.md)
- **Azure Deployment Details**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Implementation Guide**: [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- **Lokale Entwicklung**: Siehe README.md Abschnitt "Development"

## Troubleshooting Quick Tips

**Container startet nicht:**
```bash
az containerapp revision list --name legalai-backend --resource-group rg-legalai-prod
```

**Datenbank-Verbindung fehlgeschlagen:**
```bash
az postgres flexible-server firewall-rule list --name postgres-legalai-xxxx --resource-group rg-legalai-prod
```

**Hohe Kosten:**
```bash
# Scale to Zero wenn nicht genutzt
az containerapp update --name legalai-backend --resource-group rg-legalai-prod --min-replicas 0
```

## Rollback

```bash
# Vorherige Revision aktivieren
az containerapp revision list --name legalai-backend --resource-group rg-legalai-prod
az containerapp revision activate --revision legalai-backend--<revision-name> --resource-group rg-legalai-prod
```

## Cleanup (Alles löschen)

```bash
# WARNUNG: Löscht alle Ressourcen unwiderruflich!
az group delete --name rg-legalai-prod --yes
```

---

**Bei Fragen:** Siehe ausführliche Dokumentation in README.md und DEPLOYMENT.md
