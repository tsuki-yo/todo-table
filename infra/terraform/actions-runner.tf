resource "helm_release" "actions" {
  name       = "actions"
  repository = "https://actions-runner-controller.github.io/actions-runner-controller"
  chart      = "actions-runner-controller"
  namespace = "actions"
  create_namespace = true
  version    = "0.23.7"
  depends_on = [helm_release.cert_manager]

  set {
    name  = "syncPeriod"
    value = "1m"
  }

}
