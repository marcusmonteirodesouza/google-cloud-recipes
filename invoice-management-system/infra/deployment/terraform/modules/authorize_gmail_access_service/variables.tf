variable "default_confidential_crypto_key_id" {
  type        = string
  description = "Default confidential KMS crypto key ID."
}

variable "trust_vpc_access_connector_northamerica_northeast1_id" {
  type        = string
  description = "Trust northamerica-northeast1 VPC Access Connector ID."
}

variable "oauth2_client_id" {
  type        = string
  description = "Project's OAuth2 client ID."
}

variable "oauth2_client_secret_secret_id" {
  type        = string
  description = "Project's OAuth2 client secret Secret Manager secret ID."
}

variable "authorize_gmail_access_service_sa_email" {
  type        = string
  description = "Invoices Service Service Account email."
}

variable "authorize_gmail_access_service_domain" {
  type        = string
  description = "Authorize Gmail Access Service domain."
}

variable "authorize_gmail_access_service_gmail_address" {
  type        = string
  description = "Gmail address whose inbox will be watched for invoices."
}