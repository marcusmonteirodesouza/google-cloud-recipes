variable "trust_vpc_access_connector_northamerica_northeast1_id" {
  type        = string
  description = "Trust northamerica-northeast1 VPC Access Connector ID."
}

variable "process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id" {
  type        = string
  description = "Process Invoice Emails Cloud Function northamerica-northeast1 confidential KMS crypto key ID."
}

variable "process_invoice_emails_cloud_function_northamerica_northeast1_restricted_crypto_key_id" {
  type        = string
  description = "Process Invoice Emails Cloud Function northamerica-northeast1 restricted KMS crypto key ID."
}

variable "process_invoice_emails_cloud_function_sa_email" {
  type        = string
  description = "Process Invoice Emails Cloud Function Service Account email."
}

variable "gmail_address" {
  type        = string
  description = "Gmail address to process Invoice messages from."
}

variable "gmail_app_password" {
  type        = string
  description = "Gmail App password used to download Invoice messages."
  sensitive   = true
}

variable "invoices_service_name" {
  type        = string
  description = "Invoices Service Cloud Run service name."
}

variable "vendors_service_name" {
  type        = string
  description = "Vendors Service Cloud Run service name."
}

variable "send_email_pubsub_topic_name" {
  type        = string
  description = "Send Email PubSub topic name."
}