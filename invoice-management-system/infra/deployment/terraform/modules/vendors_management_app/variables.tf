variable "trust_vpc_access_connector_northamerica_northeast1_id" {
  type        = string
  description = "Trust northamerica-northeast1 VPC Access Connector ID."
}

variable "iap_sa_email" {
  type        = string
  description = "Identity-Aware Proxy Service Account email."
}

variable "vendors_management_app_sa_email" {
  type        = string
  description = "Vendors Management App Service Account email."
}

variable "vendors_management_app_users_group" {
  type        = string
  description = "Vendors Management App Users Google group."
}

variable "vendors_management_app_northamerica_northeast1_confidential_crypto_key_id" {
  type        = string
  description = "Vendors Management App northamerica-northeast1 confidential KMS crypto key ID."
}

variable "vendors_service_name" {
  type        = string
  description = "Vendors Service Cloud Run service name."
}