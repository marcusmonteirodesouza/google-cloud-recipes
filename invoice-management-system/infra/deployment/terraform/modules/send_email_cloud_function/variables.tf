variable "trust_vpc_access_connector_northamerica_northeast1_id" {
  type        = string
  description = "Trust northamerica-northeast1 VPC Access Connector ID."
}

variable "send_email_cloud_function_northamerica_northeast1_confidential_crypto_key_id" {
  type        = string
  description = "Send Email Cloud Function northamerica-northeast1 confidential KMS crypto key ID."
}

variable "send_email_cloud_function_sa_email" {
  type        = string
  description = "Send Email Cloud Function Service Account email."
}

variable "sendgrid_api_key" {
  type        = string
  description = "SendGrid API key."
  sensitive   = true
}

variable "sendgrid_from_email" {
  type        = string
  description = "Email address to send emails from."
}