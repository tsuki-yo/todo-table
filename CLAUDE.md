# Project Information

## Application Architecture

### Access Flow
- App available at: `todo-app.natsuki-cloud.dev`
- CloudFront → Load Balancer internal domain → Ingress → K8s service
- Fallback: If load balancer unavailable → S3 static site hosting

## Application Workflow

### Development Flow
1. Push to `dev` branch
2. GitHub Action builds image and pushes to ECR
3. ArgoCD Image Updater catches the change and pushes new tag to the deploy branch
4. ArgoCD catches the change in deploy branch and deploys application on K8s cluster

### Production Flow
1. Push to `main` branch
2. Triggers promotion workflow
3. Promotes the dev ECR image to the production account ECR image