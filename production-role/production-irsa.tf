# IRSA role for production backend pods
# This role is created in the production account (476114111588)
# and trusted by the staging EKS cluster's OIDC provider

# We need to get the OIDC provider info from the staging account
# This requires cross-account data source access
variable "staging_oidc_provider_arn" {
  description = "OIDC provider ARN from staging EKS cluster"
  type        = string
  default     = "arn:aws:iam::881490098269:oidc-provider/oidc.eks.ap-northeast-1.amazonaws.com/id/550F221F124EABB69F97898007A7EC0B"
}

variable "staging_oidc_provider_url" {
  description = "OIDC provider URL from staging EKS cluster (without https://)"
  type        = string
  default     = "oidc.eks.ap-northeast-1.amazonaws.com/id/550F221F124EABB69F97898007A7EC0B"
}

resource "aws_iam_role" "production_backend_irsa" {
  name = "production-backend-irsa-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "arn:aws:iam::881490098269:oidc-provider/oidc.eks.ap-northeast-1.amazonaws.com/id/550F221F124EABB69F97898007A7EC0B"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "oidc.eks.ap-northeast-1.amazonaws.com/id/550F221F124EABB69F97898007A7EC0B:sub" = "system:serviceaccount:production:backend-sa"
            "oidc.eks.ap-northeast-1.amazonaws.com/id/550F221F124EABB69F97898007A7EC0B:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

# Policy for production DynamoDB access
resource "aws_iam_role_policy" "production_backend_policy" {
  name = "production-backend-dynamodb-policy"
  role = aws_iam_role.production_backend_irsa.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:DeleteItem"
        ]
        Resource = "arn:aws:dynamodb:ap-northeast-1:476114111588:table/TodoTasks-Production"
      }
    ]
  })
}

output "production_backend_irsa_role_arn" {
  value       = aws_iam_role.production_backend_irsa.arn
  description = "ARN of the production backend IRSA role"
}