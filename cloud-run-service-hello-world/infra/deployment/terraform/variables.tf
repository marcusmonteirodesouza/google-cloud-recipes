variable "project_id" {
  type        = string
  description = "The project ID."
}

variable "domain_names" {
  type        = list(string)
  description = "Domain for which the managed SSL certificate will be valid."
}