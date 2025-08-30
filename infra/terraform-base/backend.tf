terraform {
  backend "s3" {
    bucket         = "todo-table-terraform-state"
    key            = "staging/terraform.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
    dynamodb_table = "todo-table-terraform-locks"
  }
}