# ECR Repository Policies to allow staging account nodes to pull images

resource "aws_ecr_repository_policy" "todo_frontend" {
  repository = "todo-frontend"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowStagingNodesPull"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::881490098269:role/staging-todo-eks-eks-nodes"
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
      }
    ]
  })
}

resource "aws_ecr_repository_policy" "todo_backend" {
  repository = "todo-backend"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowStagingNodesPull"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::881490098269:role/staging-todo-eks-eks-nodes"
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
      }
    ]
  })
}

resource "aws_ecr_repository_policy" "todo_ai_service" {
  repository = "todo-ai-service"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowStagingNodesPull"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::881490098269:role/staging-todo-eks-eks-nodes"
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
      }
    ]
  })
}