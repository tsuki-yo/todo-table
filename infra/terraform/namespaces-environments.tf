resource "kubernetes_namespace" "staging" {
  metadata {
    name = "staging"
    labels = {
      environment = "staging"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }
}

resource "kubernetes_namespace" "production" {
  metadata {
    name = "production"
    labels = {
      environment = "production"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }
}