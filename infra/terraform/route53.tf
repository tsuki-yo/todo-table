data "aws_route53_zone" "primary" {
  name         = "natsuki-cloud.dev"
  private_zone = false
}

data "kubernetes_ingress_v1" "todo_ingress" {
  metadata {
    name      = "todo-ingress"
    namespace = "todo-app"
  }
}

resource "aws_route53_record" "ingress_cname" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "todo-app.natsuki-cloud.dev"
  type    = "CNAME"
  ttl     = 300
  records = [data.kubernetes_ingress_v1.todo_ingress.status[0].load_balancer[0].ingress[0].hostname]
  allow_overwrite = true

  depends_on = [helm_release.external_nginx]
}