# Cross-account ECR access role for production account (476114111588)
# This role allows the staging account IRSA role to assume it for ECR access

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_iam_role" "eks_cross_account_ecr_role" {
  name = "EKSCrossAccountECRRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::881490098269:role/production-app-irsa-role",
            "arn:aws:iam::881490098269:role/staging-todo-eks-eks-nodes"
          ]
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Environment = "production"
    Purpose     = "cross-account-ecr-access"
  }
}

resource "aws_iam_role_policy" "eks_cross_account_ecr_policy" {
  name = "EKSCrossAccountECRPolicy"
  role = aws_iam_role.eks_cross_account_ecr_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      }
    ]
  })
}

# Output the role ARN for verification
output "eks_cross_account_ecr_role_arn" {
  value       = aws_iam_role.eks_cross_account_ecr_role.arn
  description = "ARN of the EKS cross-account ECR role"
}