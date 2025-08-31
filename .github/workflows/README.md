# Automated Infrastructure Management

This directory contains GitHub Actions workflows for automated deployment and destruction of the todo-table infrastructure to minimize cloud costs.

## Workflows

### 1. Deploy (deploy.yml)
- **Schedule**: Runs at 9:00 AM JST (Monday-Friday)
- **Actions**: 
  - Deploys Terraform infrastructure
  - Applies Kubernetes application

### 2. Destroy (destroy.yml)
- **Schedule**: Runs at 6:00 PM JST (Monday-Friday)
- **Actions**:
  - Deletes Kubernetes application
  - Destroys Terraform infrastructure (with proper ordering)

## Required GitHub Secrets

Add these secrets in your GitHub repository settings:

```
AWS_ACCESS_KEY_ID - Your AWS access key
AWS_SECRET_ACCESS_KEY - Your AWS secret key
```

## Manual Triggers

Both workflows can be triggered manually via GitHub Actions web interface using `workflow_dispatch`.

## Cost Savings

- **Runtime**: ~9 hours/day (weekdays only)
- **Downtime**: ~15 hours/day + weekends
- **Estimated savings**: ~70-80% of infrastructure costs

## Monitoring

- Check GitHub Actions logs for deployment/destruction status
- Add notification integrations in the workflow files for alerts
- Verify resource cleanup in AWS console after destruction

## Timezone Note

Cron schedules use UTC time:
- `0 9 * * 1-5` = 9:00 AM JST (0:00 UTC + 9 hours)
- `0 18 * * 1-5` = 6:00 PM JST (9:00 UTC + 9 hours)