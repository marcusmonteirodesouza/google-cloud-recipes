variable "default_confidential_crypto_key_id" {
  type        = string
  description = "Default confidential KMS crypto key ID."
}

variable "documentai_confidential_crypto_key_id" {
  type        = string
  description = "Document AI confidential KMS crypto key ID."
}

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

variable "vendors_service_name" {
  type        = string
  description = "Vendors Service Cloud Run service name."
}