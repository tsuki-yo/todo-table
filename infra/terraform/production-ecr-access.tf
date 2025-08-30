# IAM role for production ECR access (copying staging pattern)
resource "aws_iam_role" "production_irsa_role" {
  name = "production-app-irsa-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = "sts:AssumeRoleWithWebIdentity",
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks.arn,
        },
        Condition = {
          StringEquals = {
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = [
              "system:serviceaccount:production:backend-sa",
              "system:serviceaccount:production:default"
            ]
          }
        }
      },
    ]
  })
}

# Policy for production ECR cross-account access and DynamoDB
resource "aws_iam_role_policy" "production_irsa_policy" {
  name = "production-app-policy"
  role = aws_iam_role.production_irsa_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ],
        Resource = "arn:aws:dynamodb:ap-northeast-1:881490098269:table/TodoTasks"
      },
      {
        Effect = "Allow"
        Action = [
          "sts:AssumeRole"
        ]
        Resource = "arn:aws:iam::476114111588:role/EKSCrossAccountECRRole"
      }
    ]
  })
}

# Output the role ARN
output "production_irsa_role_arn" {
  value       = aws_iam_role.production_irsa_role.arn
  description = "ARN of the production IRSA role"
}