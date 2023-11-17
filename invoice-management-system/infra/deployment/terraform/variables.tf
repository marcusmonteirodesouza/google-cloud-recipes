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

variable "vendors_management_app_users_group" {
  type        = string
  description = "Vendors Management App Users Google group."
}

variable "vendors_management_app_domain" {
  type        = string
  description = "Vendor Management App domain."
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

variable "process_invoice_emails_gmail_address" {
  type        = string
  description = "Gmail address to process Invoice messages from."
}

variable "process_invoice_emails_gmail_app_password" {
  type        = string
  description = "Gmail App password used to download Invoice messages."
  sensitive   = true
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