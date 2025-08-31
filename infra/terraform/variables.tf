variable "env" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "eks_base_name" {
  description = "Base EKS cluster name"  
  type        = string
  default     = "todo-eks"
}