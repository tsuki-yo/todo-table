resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
    labels = {
      monitoring = "prometheus"
    }
  }
} 