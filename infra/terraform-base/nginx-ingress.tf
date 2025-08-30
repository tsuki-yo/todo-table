resource "helm_release" "external_nginx" {
  name = "external"

  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress"
  create_namespace = true
  version          = "4.12.0"

  values = [file("${path.module}/values/nginx-ingress.yaml")]

  depends_on = [aws_eks_node_group.general, aws_eks_cluster.eks, helm_release.aws_lbc]
}
