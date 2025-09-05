# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- **Install all dependencies**: `npm run install-all` (installs root, backend, and frontend)
- **Start full application**: `npm start` (runs both backend and frontend concurrently)
- **Backend only**: `cd backend && npm start` (Node.js server on default port)
- **Frontend only**: `cd frontend && npm start` (React dev server)
- **Frontend build**: `cd frontend && npm run build`

### Testing
- **Frontend tests**: `cd frontend && npm test` (interactive mode)
- **Frontend CI tests**: `cd frontend && npm run test:ci` (non-interactive, used in CI)
- **AI service tests**: `cd ai-service && python test_spacy_japanese.py`
- **Run single frontend test**: `cd frontend && npm test -- --testNamePattern="specific test name"`
- **Run frontend tests with coverage**: `cd frontend && npm test -- --coverage --watchAll=false`

### AI Service
- **Start AI service**: `cd ai-service && python main.py` (FastAPI server)
- **Install AI dependencies**: `cd ai-service && pip install -r requirements.txt`
- **Install spaCy models**: `python -m spacy download ja_core_news_sm && python -m spacy download en_core_web_sm`
- **Test NLP functionality**: `cd ai-service && python test_spacy_japanese.py`

## Architecture Overview

This is a cloud-native enterprise SRE demonstration platform with three microservices:

### Application Components
- **Frontend**: React application with AWS Cognito authentication, served via nginx
- **Backend**: Node.js/Express API with Prometheus instrumentation and DynamoDB integration
- **AI Service**: Python FastAPI service using spaCy for Japanese/English NLP task processing

### Infrastructure Stack
- **Kubernetes**: Amazon EKS cluster (v1.32) in ap-northeast-1
- **Infrastructure as Code**: Terraform for AWS resources, Kustomize for K8s manifests
- **GitOps**: ArgoCD for automated deployments from the `deploy` branch
- **Observability**: Prometheus Operator, Grafana, AlertManager with comprehensive SRE monitoring

### SRE Implementation
The platform implements Google's Four Golden Signals with formal SLI/SLO definitions:
- Backend API: 99.95% availability, <200ms p95 latency
- AI Service: 99.5% availability, <2s p95 latency  
- Frontend: 99.9% availability, <2s load time

## Repository Structure

```
├── frontend/          # React application
├── backend/           # Node.js API server
├── ai-service/        # Python FastAPI NLP service
├── infra/
│   ├── terraform/     # AWS infrastructure (EKS, networking, IAM)
│   └── k8s/           # Kubernetes manifests and SRE configurations
├── production-role/   # Terraform for production IAM roles
└── .github/workflows/ # CI/CD pipelines
```

## Deployment Workflow

### CI/CD Pipeline
1. **Dev branch**: Push here to update deployments - runs tests, builds containers, deploys to staging environment
2. **Main branch**: Production-ready code, triggers promotion workflow  
3. **Deploy branch**: Used by ArgoCD for actual deployments (automatically updated by CI/CD)

### Key Workflows
- `build.yaml`: Tests, builds, and deploys to staging on dev branch pushes
- `promote.yml`: Promotes tested images from staging to production
- `deploy.yml`: Handles production deployments via ArgoCD

### Environment Management
- **Staging**: Uses `infra/k8s/environments/staging/` overlays
  - Namespace: `staging`
  - URLs: `staging-app.natsuki-cloud.dev`, `staging-grafana.natsuki-cloud.dev`
  - Lower resource limits, 1 replica per service
  - Uses separate ECR repository (881490098269.dkr.ecr.ap-northeast-1.amazonaws.com)
- **Production**: Uses `infra/k8s/environments/production/` overlays
  - Namespace: `production` 
  - URLs: `todo-app.natsuki-cloud.dev`, `grafana.natsuki-cloud.dev`
  - Production resource limits and DynamoDB table (`TodoTasks-Production`)
  - Uses main ECR repository (476114111588.dkr.ecr.ap-northeast-1.amazonaws.com)
- **Base**: Common resources in `infra/k8s/app-base/`

## AWS Integration

### Core Services
- **EKS**: Container orchestration with managed node groups
- **ECR**: Container registry for frontend, backend, and AI service images
- **DynamoDB**: NoSQL database for application data
- **Cognito**: User authentication and authorization
- **CloudFront**: CDN for frontend assets

### IAM Structure
- Service accounts use IAM Roles for Service Accounts (IRSA)
- Production and staging environments have separate IAM roles
- Least privilege access enforced across all components

## SRE and Monitoring

### Key Files
- `infra/k8s/app-base/sre-slis-slos.yaml`: Formal SLI/SLO definitions
- `infra/k8s/app-base/sre-alert-rules.yaml`: Prometheus alerting rules
- `infra/k8s/app-base/sre-runbooks.yaml`: Incident response procedures
- `infra/k8s/app-base/golden-signals-*.yaml`: Monitoring configuration

### Observability Stack
- **Prometheus**: Metrics collection with ServiceMonitors
- **Grafana**: SRE dashboards with error budget visualization
- **AlertManager**: Intelligent alert routing and suppression
- **Blackbox Exporter**: External synthetic monitoring

## Important Notes

### Version Management
- Application versions are automatically managed via git tags in CI/CD
- Images are tagged with semantic versions and promoted between environments
- ArgoCD Image Updater automates staging deployments

### Security Practices
- All secrets managed via Kubernetes Sealed Secrets
- HTTPS enforced across all endpoints with cert-manager
- Network policies and pod security standards implemented
- Regular security scanning in CI/CD pipeline

### Development Guidelines
- All services include Prometheus instrumentation
- Tests are required for frontend changes (enforced in CI)
- Infrastructure changes require Terraform plan review
- SRE metrics must be maintained for all new features

## Component-Specific Notes

### Frontend (React)
- Uses React 19 with AWS Cognito authentication via `react-oidc-context`
- Jest configuration includes custom transforms for axios
- Emotion.js for styled components
- Guest mode supported alongside authenticated users

### Backend (Node.js)
- Express server with prom-client for Prometheus metrics
- AWS SDK integration for DynamoDB
- JWT verification via aws-jwt-verify
- CORS enabled for frontend integration

### AI Service (Python/FastAPI)  
- spaCy-based NLP with Japanese (`ja_core_news_sm`) and English (`en_core_web_sm`) models
- Dateparser for intelligent date extraction
- Custom Japanese date patterns (今日, 明日, etc.)
- Prometheus FastAPI instrumentator for metrics