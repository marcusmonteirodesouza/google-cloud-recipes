variable "trust_network_name" {
  type        = string
  description = "Trust VPC network name."
}

variable "trust_vpc_access_connector_northamerica_northeast1_id" {
  type        = string
  description = "Trust northamerica-northeast1 VPC Access Connector ID."
}

variable "invoices_service_sa_email" {
  type        = string
  description = "Invoices Service Service Account email."
}

variable "invoices_service_northamerica_northeast1_confidential_crypto_key_id" {
  type        = string
  description = "Invoices Service northamerica-northeast1 confidential KMS crypto key ID."
}

variable "invoices_service_northamerica_northeast1_restricted_crypto_key_id" {
  type        = string
  description = "Invoices Service northamerica-northeast1 restricted KMS crypto key ID."
}

variable "invoices_service_us_central1_restricted_crypto_key_id" {
  type        = string
  description = "Invoices Service us-central1 restricted KMS crypto key ID."
}

variable "vendors_service_name" {
  type        = string
  description = "Vendors Service Cloud Run service name."
}