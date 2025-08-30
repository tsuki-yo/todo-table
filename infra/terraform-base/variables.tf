variable "env" {
  description = "Environment name"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "zone1" {
  description = "First availability zone"
  type        = string
  default     = "ap-northeast-1a"
}

variable "zone2" {
  description = "Second availability zone" 
  type        = string
  default     = "ap-northeast-1c"
}

variable "eks_name" {
  description = "EKS cluster name"
  type        = string
}

variable "eks_version" {
  description = "EKS cluster version"
  type        = string
  default     = "1.32"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "backend_bucket" {
  description = "S3 bucket for terraform state"
  type        = string
}

variable "backend_key" {
  description = "S3 key for terraform state"
  type        = string
}

variable "backend_dynamodb_table" {
  description = "DynamoDB table for terraform locks"
  type        = string
}