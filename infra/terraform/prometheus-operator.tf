# helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
# helm repo update
# helm install prometheus-operator prometheus-community/kube-prometheus-stack -n monitoring --create-namespace --version 55.5.0 -f values/prometheus-values.yaml
resource "helm_release" "prometheus_operator" {
  name = "prometheus-operator"

  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  namespace        = "monitoring"
  create_namespace = true
  version          = "55.5.0"

  values = [file("${path.module}/values/prometheus-values.yaml")]

  set {
    name  = "nodeExporter.enabled"
    value = "false"
  }

  depends_on = [kubernetes_namespace.monitoring]

  timeout = 1200  # 20 minutes
} 