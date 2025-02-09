provider "aws" {
  region = "us-east-1"  # Change to your preferred region
}

resource "aws_db_instance" "postgres" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine              = "postgres"
  engine_version      = "14"
  instance_class      = "db.t3.micro"
  username           = var.db_username
  password           = var.db_password
  publicly_accessible = false
  skip_final_snapshot = true
}
