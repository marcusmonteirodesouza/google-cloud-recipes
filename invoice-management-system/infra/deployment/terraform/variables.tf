variable "company_name" {
  default = "gcloudrecipes"
}

variable "environment" {
  default     = "dev"
  description = "Deployment environment."
}

variable "project_id" {
  type        = string
  description = "The project ID."
}

variable "oauth2_client_id" {
  type        = string
  description = "Project's OAuth2 client ID."
}

variable "oauth2_client_secret" {
  type        = string
  description = "Project's OAuth2 client secret."
  sensitive   = true
}

variable "support_email" {
  type        = string
  description = "User support email."
}

variable "vendors_management_app_users_group" {
  type        = string
  description = "Vendors Management App Users Google group."
}

variable "vendors_management_app_domain" {
  type        = string
  description = "Vendor Management App domain."
}

variable "authorize_gmail_access_service_domain" {
  type        = string
  description = "Authorize Gmail Access Service domain."
}

variable "authorize_gmail_access_service_gmail_address" {
  type        = string
  description = "Gmail address whose inbox will be watched for invoices."
}

variable "ssl_certificate" {
  type        = string
  description = "The SSL certificate in PEM format."
}

variable "ssl_certificate_private_key" {
  type        = string
  description = "The SSL certificate write-only private key in PEM format."
  sensitive   = true
}