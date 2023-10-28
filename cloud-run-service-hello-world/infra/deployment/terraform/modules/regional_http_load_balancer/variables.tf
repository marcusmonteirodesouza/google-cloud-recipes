variable "network_name" {
  type        = string
  description = "The Regional HTTP Load Balancer VPC network name."
}

variable "ssl_certificate" {
  type        = string
  description = "The SSL certificate in PEM format."
}

variable "ssl_certificate_private_key" {
  type        = string
  description = "The SSL certificate write-only private key in PEM format."
}

variable "google_compute_address_id" {
  type        = string
  description = "The Regional HTTP Load Balancer IP address ID."
}

variable "api_cloud_run_service_name" {
  type        = string
  description = "The API Cloud Run services name."
}