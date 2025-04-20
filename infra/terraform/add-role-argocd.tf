# --- Define IAM Policy for ECR Access ---
# Grants permissions needed by Argo CD Image Updater to check ECR tags
resource "aws_iam_policy" "image_updater_ecr_policy" {
  name        = "ArgoCDImageUpdaterECRAccessPolicy" 
  description = "Allows Argo CD Image Updater to list and describe images in ECR"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "ecr:GetAuthorizationToken", # Needed to authenticate Docker client/SDK
          "ecr:DescribeImages",        # Needed to get image details/tags
          "ecr:ListImages",            # Needed to list images in a repository (or use ecr:ListTagsForResource)
          "ecr:BatchGetImage"          # Often used for efficiency fetching layers/manifests
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "image_updater_irsa_role" {
  name = "argocd-image-updater-irsa-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = "sts:AssumeRoleWithWebIdentity",
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks.arn
        },
        Condition = {
          StringEquals = {
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:argocd:updater-argocd-image-updater"
          }
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "image_updater_role_policy_attach" {
  role       = aws_iam_role.image_updater_irsa_role.name
  policy_arn = aws_iam_policy.image_updater_ecr_policy.arn
}

output "image_updater_irsa_role_arn" {
  description = "ARN of the IAM Role for the Argo CD Image Updater Service Account"
  value       = aws_iam_role.image_updater_irsa_role.arn
}