resource "helm_release" "external_dns" {
  name = "external-dns"

  repository       = "https://kubernetes-sigs.github.io/external-dns"
  chart            = "external-dns"
  namespace        = "kube-system"
  create_namespace = true
  version          = "1.13.1"

  set {
    name  = "serviceAccount.name"
    value = "external-dns"
    type  = "string"
  }

  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = aws_iam_role.external_dns.arn
    type  = "string"
  }

  set {
    name  = "policy"
    value = "upsert-only"
    type  = "string"
  }

  set {
    name  = "registry"
    value = "txt"
    type  = "string"
  }

  set {
    name  = "txtOwnerId"
    value = "k8s"
    type  = "string"
  }

  set {
    name  = "domainFilters[0]"
    value = "natsuki-cloud.dev"
    type  = "string"
  }

  set {
    name  = "aws.zoneType"
    value = "public"
    type  = "string"
  }

  set {
    name  = "logLevel"
    value = "debug"
    type  = "string"
  }

  depends_on = [aws_iam_role.external_dns]
}

resource "aws_iam_role" "external_dns" {
  name = "${aws_eks_cluster.eks.name}-external-dns"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRoleWithWebIdentity"
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks.arn
        }
        Condition = {
          StringEquals = {
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:kube-system:external-dns"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "external_dns" {
  name = "${aws_eks_cluster.eks.name}-external-dns"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "route53:ChangeResourceRecordSets",
          "route53:ListResourceRecordSets",
          "route53:ListHostedZones",
          "route53:GetChange"
        ]
        Resource = ["*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "external_dns" {
  policy_arn = aws_iam_policy.external_dns.arn
  role       = aws_iam_role.external_dns.name
} 