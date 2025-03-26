resource "aws_iam_role" "irsa_role" {
  name = "todo-app-irsa-role"

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
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:todo-app:backend-sa"
          }
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "irsa_policy" {
  name = "todo-app-policy"
  role = aws_iam_role.irsa_role.id

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
      }
    ]
  })
}

