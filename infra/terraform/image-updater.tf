# helm repo add argo https://argoproj.github.io/argo-helm
# helm repo update
# helm install updater -n argocd argo/argocd-image-updater --version 0.8.4 -f terraform/values/image-updater.yaml
resource "helm_release" "updater" {
  name = "updater"

  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argocd-image-updater"
  namespace        = "argocd"
  create_namespace = true
  version          = "0.12.1"
  
  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = aws_iam_role.image_updater_irsa_role.arn
    type  = "string"
  }

  set {
    name  = "config.logLevel" # The path within Helm values
    value = "debug"           # The desired value
    type  = "string"          # Value type
  }
  
  values = [file("${path.module}/values/image-updater.yaml")]

  depends_on = [
    aws_iam_role.image_updater_irsa_role
  ]
}