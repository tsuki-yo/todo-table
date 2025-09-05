# Artifact Promotion Workflow

## Overview
This document describes the artifact promotion workflow implemented for the todo-table application, enabling safe deployment of tested artifacts from staging to production.

## Architecture

### Current Setup
- **Staging Account**: 881490098269 (AWS Organization Master)
- **Production Account**: 476114111588 (AWS Organization Member)  
- **Shared Access**: iamadmin user with cross-account permissions

### Workflow Process
```
dev branch push → build & test → staging ECR → ArgoCD deploy to staging
                                    ↓
                              test in staging ✅
                                    ↓
                    merge dev → main → promotion workflow
                                    ↓
                  copy exact artifacts → production ECR → ArgoCD deploy to prod
```

## Implementation Details

### 1. Development Workflow (build.yaml)
- **Trigger**: Push to `dev` branch
- **Process**: 
  - Run tests (Jest + React Testing Library)
  - Build Docker images for all services
  - Tag images with semantic version (e.g., `0.1.5`)
  - Push to staging ECR (881490098269)
  - Create git tag with same version
- **Services**: frontend, backend, ai-service

### 2. Promotion Workflow (promote-prod.yaml)
- **Trigger**: Push to `main` branch
- **Process**:
  - Read latest git tag from main branch
  - Pull tagged images from staging ECR
  - Re-tag and push to production ECR (476114111588)  
  - Provide promotion summary
- **Key Feature**: Uses exact same image SHA across environments

## Usage Instructions

### Testing the Workflow

#### Step 1: Development and Staging
1. Make changes in a feature branch
2. Create PR to `dev` branch and merge
3. GitHub Actions will automatically:
   - Run tests
   - Build images with version tag (e.g., `0.1.6`)
   - Deploy to staging environment
   - Create git tag `0.1.6`

#### Step 2: Staging Validation
1. Test the application at `https://staging.natsuki-cloud.dev`
2. Verify all functionality works correctly
3. Check AI service performance with Japanese/English text processing

#### Step 3: Production Promotion
1. Create PR from `dev` to `main` branch
2. Merge the PR (this triggers promotion workflow)
3. GitHub Actions will automatically:
   - Find latest tag (e.g., `0.1.6`)
   - Copy staging images to production ECR
   - ArgoCD will deploy to production environment

#### Step 4: Production Verification
1. Verify deployment at `https://app.natsuki-cloud.dev`
2. Confirm same functionality as tested in staging
3. Check that image SHAs match between environments

### Manual Testing Commands

#### Check Image Tags in ECR
```bash
# List staging images
aws ecr describe-images --repository-name todo-frontend --query 'imageDetails[*].{tags:imageTags,pushed:imagePushedAt}' --output table

# List production images  
aws ecr describe-images --repository-name todo-frontend --query 'imageDetails[*].{tags:imageTags,pushed:imagePushedAt}' --output table --profile prod
```

#### Verify Image SHA Consistency
```bash
# Get staging image SHA
aws ecr describe-images --repository-name todo-frontend --image-ids imageTag=0.1.6 --query 'imageDetails[0].imageDigest'

# Get production image SHA (should match)
aws ecr describe-images --repository-name todo-frontend --image-ids imageTag=0.1.6 --query 'imageDetails[0].imageDigest' --profile prod
```

## Benefits

### For SRE/DevOps Resume
- **Artifact Promotion**: Demonstrates understanding of deployment safety
- **GitOps Integration**: Shows modern deployment practices
- **Cross-Account Management**: AWS Organizations expertise
- **Microservices Deployment**: Managing multiple service dependencies
- **Version Control**: Git-based release management

### For Production Reliability
- **Identical Artifacts**: Same tested images deployed everywhere
- **Reduced Risk**: No rebuild differences between environments
- **Audit Trail**: Clear version history via git tags
- **Quick Rollback**: Easy to promote previous versions
- **Automated Process**: Reduces human error

## Troubleshooting

### Common Issues
1. **No version tags found**: Ensure git tags are pushed from dev workflow
2. **ECR login failures**: Verify AWS credentials and cross-account permissions
3. **Image not found**: Check that staging build completed successfully
4. **ArgoCD not updating**: Verify image updater configuration

### Rollback Procedure
To rollback to a previous version:
1. Identify last known good version (e.g., `0.1.5`)
2. Create new tag pointing to that version
3. Push to main branch to trigger promotion of the older version

## Security Considerations

### Current Implementation
- Uses shared iamadmin credentials for both environments
- Relies on AWS Organizations cross-account trust
- Suitable for development/demo environments

### Production Recommendations
- Implement separate IAM roles per environment
- Use OIDC for GitHub Actions authentication  
- Apply principle of least privilege
- Enable CloudTrail for audit logging

---

**Implementation Status**: ✅ Complete and ready for testing
**Next Steps**: Add monitoring and canary deployment capabilities