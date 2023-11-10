variable "default_confidential_crypto_key_id" {
  type        = string
  description = "Default northamerica-northeast1 confidential KMS crypto key ID."
}

variable "trust_network_name" {
  type        = string
  description = "Trust VPC network name."
}

variable "vendors_management_app_backend_service_name" {
  type        = string
  description = "Cloud Load Balancing Vendors Management App Backend Service name."
}

variable "vendors_management_app_cloud_run_service_name" {
  type        = string
  description = "Vendors Management App Cloud Run service name."
}

variable "vendors_management_app_sa_email" {
  type        = string
  description = "Vendors Management App Service Account email."
}

variable "vendors_management_app_users_group" {
  type        = string
  description = "Vendors Management App Users Google group."
}

variable "vendors_management_app_iap_client_id" {
  type        = string
  description = "Unique identifier of the Vendors Management App OAuth client."
}

variable "vendors_management_app_iap_client_secret" {
  type        = string
  description = "Client secret of the Vendors Management App OAuth client."
  sensitive   = true
}

variable "ssl_certificate" {
  type        = string
  description = "SSL certificate in PEM format."
}

variable "ssl_certificate_private_key" {
  type        = string
  description = "SSL certificate write-only private key in PEM format."
}

variable "google_compute_address_id" {
  type        = string
  description = "Regional HTTP Load Balancer IP address ID."
}