
data "aws_secretsmanager_secret_version" "secretmanager_encryption_key" {
  secret_id = "arn:aws:secretsmanager:ap-northeast-1:881490098269:secret:secretmanager_encryption_key-EqyIxH"
}

locals {
  key_data = {
    "tls.key" = base64decode(jsondecode(data.aws_secretsmanager_secret_version.secretmanager_encryption_key.secret_string)["tls.key"])
    "tls.crt" = base64decode(jsondecode(data.aws_secretsmanager_secret_version.secretmanager_encryption_key.secret_string)["tls.crt"])
  }
}

resource "kubernetes_secret" "sealed_secrets_tls" {
  metadata {
    name      = "sealed-secrets-tls"
    namespace = "kube-system"
    labels = {
      "sealedsecrets.bitnami.com/sealed-secrets-key" = "active"
    }
    annotations = {
      "sealedsecrets.bitnami.com/cluster-wide" = "true"
    }
  }
  data = {
    "tls.key" = local.key_data["tls.key"]
    "tls.crt" = local.key_data["tls.crt"]
  }
  type = "kubernetes.io/tls"
}


resource "helm_release" "sealed_secrets" {
  name = "sealed-secrets"

  repository       = "https://bitnami-labs.github.io/sealed-secrets"
  chart            = "sealed-secrets"
  namespace        = "kube-system"
  create_namespace = true
  version          = "2.17.3"
  values = [file("${path.module}/values/sealed-secrets-tls.yaml")]
  depends_on = [kubernetes_secret.sealed_secrets_tls]
}